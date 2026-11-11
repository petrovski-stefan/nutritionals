from datetime import UTC, datetime
from types import ModuleType
from unittest.mock import MagicMock

import pytest
import requests
from pydantic import ValidationError
from pytest_mock import MockerFixture

from scrapers import zegin
from scrapers.models import ScrapeEvent
from scrapers.services import create_scrape_event
from scrapers.shared import client
from scrapers.shared.imports import load_pharmacy_fns
from scrapers.shared.soup import get_soup, get_stripped_attribute
from scrapers.shared.validators import BaseCatalogProduct


def product(**overrides: object) -> dict:
    return {
        "name": "Vitamin C",
        "price": "1.200,00 ден",
        "discount_price": None,
        "brand": None,
        "url": "https://pharmacy.example.com/vitamin-c",
        **overrides,
    }


class TestBaseCatalogProduct:
    def test_normalizes_the_fields(self) -> None:
        validated = BaseCatalogProduct(
            **product(discount_price="990,00 ден", brand="солгар, витамини")
        ).model_dump()

        assert validated["price"] == 1200.0
        assert validated["discount_price"] == 990.0
        assert validated["brand"] == "Solgar"

    @pytest.mark.parametrize(
        "overrides",
        [
            {"name": "X"},
            {"price": ""},
            {"url": "not a url"},
            {"discount_price": "1.500,00 ден"},
        ],
        ids=["short-name", "no-price", "bad-url", "discount-above-price"],
    )
    def test_rejects_invalid_data(self, overrides: dict) -> None:
        with pytest.raises(ValidationError):
            BaseCatalogProduct(**product(**overrides))


class TestLoadPharmacyFns:
    def test_loads_the_package_by_pharmacy_name(self) -> None:
        assert load_pharmacy_fns("Zegin") == (
            zegin.get_catalog_url_by_page,
            zegin.extract_cards_from_page,
            zegin.get_products_from_cards,
        )

    def test_rejects_an_unknown_pharmacy(self) -> None:
        with pytest.raises(ImportError, match="Parser module not found"):
            load_pharmacy_fns("Nonexistent")

    def test_rejects_a_package_missing_functions(self, mocker: MockerFixture) -> None:
        mocker.patch(
            "scrapers.shared.imports.importlib.import_module", return_value=ModuleType("x")
        )

        with pytest.raises(ImportError, match="Missing required functions"):
            load_pharmacy_fns("Broken")


class TestClient:
    @pytest.fixture
    def get(self, mocker: MockerFixture) -> MagicMock:
        return mocker.patch.object(client.requests, "get")

    def test_returns_the_page_html(self, get: MagicMock) -> None:
        get.return_value.text = "<html></html>"

        html = client.make_request_and_get_html("https://x.example.com", {"User-Agent": "UA"})

        assert html == "<html></html>"
        get.assert_called_once_with(
            url="https://x.example.com", headers={"User-Agent": "UA"}, timeout=15
        )

    def test_raises_on_an_error_status(self, get: MagicMock) -> None:
        get.return_value.raise_for_status.side_effect = requests.HTTPError("503")

        with pytest.raises(requests.HTTPError):
            client.make_request_and_get_html("https://x.example.com")

    def test_random_useragent_is_a_desktop_browser(self) -> None:
        useragent = client.get_random_useragent()

        assert useragent.startswith("Mozilla/")
        assert "Mobile" not in useragent


def test_get_stripped_attribute() -> None:
    link = get_soup('<a href="  /p/1 " class="x y">P</a>').a
    assert link is not None

    assert get_stripped_attribute(link, "href") == "/p/1"
    assert get_stripped_attribute(link, "class") is None
    assert get_stripped_attribute(link, "title") is None


@pytest.mark.django_db
def test_create_scrape_event_moves_url_and_time_out_of_the_data() -> None:
    created_at = datetime(2026, 1, 2, tzinfo=UTC)

    event = create_scrape_event(
        {"url": "https://x.example.com", "created_at": created_at, "name": "P"}, "product_list"
    )

    event = ScrapeEvent.objects.get(pk=event.pk)
    assert event.scraped_data == {"name": "P"}
    assert (event.url, event.created_at) == ("https://x.example.com", created_at)
