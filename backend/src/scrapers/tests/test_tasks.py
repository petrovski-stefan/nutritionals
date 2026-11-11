import logging
from datetime import timedelta
from unittest.mock import MagicMock, call

import pytest
import requests
from django.core.management import call_command
from django.utils import timezone
from pytest_mock import MockerFixture

from products.models import Pharmacy, Product
from products.tests.factories import (
    CategoryFactory,
    PharmacyCatalogFactory,
    PharmacyFactory,
    ProductFactory,
)
from scrapers import tasks
from scrapers.tests.pages import ANNIFARM_PAGE

pytestmark = pytest.mark.django_db


def records(caplog: pytest.LogCaptureFixture, level: int) -> list[logging.LogRecord]:
    return [r for r in caplog.records if r.name == "scrapers.tasks" and r.levelno == level]


class TestCheckScrapeFreshness:
    def test_logs_an_error_per_stale_pharmacy(self, caplog: pytest.LogCaptureFixture) -> None:
        stale = PharmacyCatalogFactory(pharmacy__name="Stale").pharmacy
        ProductFactory(pharmacy=stale, last_scraped_at=timezone.now() - timedelta(hours=40))
        PharmacyCatalogFactory(pharmacy__name="Never")

        tasks.check_scrape_freshness()

        assert [r.pharmacy for r in records(caplog, logging.ERROR)] == ["Never", "Stale"]

    def test_logs_info_when_everything_is_fresh(self, caplog: pytest.LogCaptureFixture) -> None:
        fresh = PharmacyCatalogFactory().pharmacy
        ProductFactory(pharmacy=fresh, last_scraped_at=timezone.now() - timedelta(hours=1))

        with caplog.at_level(logging.INFO, logger="scrapers.tasks"):
            tasks.check_scrape_freshness()

        assert records(caplog, logging.ERROR) == []
        assert len(records(caplog, logging.INFO)) == 1


def test_schedule_pharmacy_catalogs_scrape_queues_active_catalogs(mocker: MockerFixture) -> None:
    delay = mocker.patch.object(tasks.schedule_catalog_page_scrape, "delay")
    first = PharmacyCatalogFactory()
    second = PharmacyCatalogFactory()
    PharmacyCatalogFactory(is_active=False)

    tasks.schedule_pharmacy_catalogs_scrape()

    assert sorted(delay.call_args_list) == sorted(
        [call(first.pk, first.pharmacy.name), call(second.pk, second.pharmacy.name)]
    )


def test_schedule_catalogs_command_runs_the_task(mocker: MockerFixture) -> None:
    task = mocker.patch.object(tasks, "schedule_pharmacy_catalogs_scrape")

    call_command("schedule_catalogs")

    task.assert_called_once_with()


class TestScheduleCatalogPageScrape:
    @pytest.fixture
    def delay(self, mocker: MockerFixture) -> MagicMock:
        mocker.patch.object(tasks, "get_random_useragent", return_value="UA")

        return mocker.patch.object(tasks.scrape_pharmacy_page, "delay")

    def test_queues_every_page(self, delay: MagicMock) -> None:
        catalog = PharmacyCatalogFactory(
            pharmacy__name="Annifarm",
            url_without_page="https://annifarm.com.mk/c/",
            queryparams_string="?orderby=price",
            max_pages=3,
            category=CategoryFactory(name="Vitamini"),
        )

        tasks.schedule_catalog_page_scrape(catalog.pk, "Annifarm")

        headers = {"User-Agent": "UA"}
        assert delay.call_args_list == [
            call(
                "Annifarm",
                f"https://annifarm.com.mk/c/page/{page}/?orderby=price",
                headers,
                page,
                "Vitamini",
                is_first_page=page == 1,
            )
            for page in (1, 2, 3)
        ]

    def test_starts_at_page_zero_when_configured(self, delay: MagicMock) -> None:
        catalog = PharmacyCatalogFactory(
            pharmacy__name="Annifarm", max_pages=2, page_numbering_starts_at_zero=True
        )

        tasks.schedule_catalog_page_scrape(catalog.pk, "Annifarm")

        assert [c.args[3] for c in delay.call_args_list] == [0, 1]
        assert [c.args[4] for c in delay.call_args_list] == ["", ""]

    def test_logs_and_stops_for_an_unknown_scraper(
        self, delay: MagicMock, caplog: pytest.LogCaptureFixture
    ) -> None:
        catalog = PharmacyCatalogFactory(pharmacy__name="Nonexistent")

        tasks.schedule_catalog_page_scrape(catalog.pk, "Nonexistent")

        delay.assert_not_called()
        assert len(records(caplog, logging.ERROR)) == 1


@pytest.fixture
def annifarm() -> Pharmacy:
    return PharmacyFactory(name="Annifarm")


@pytest.fixture
def fetch_html(mocker: MockerFixture) -> MagicMock:
    return mocker.patch.object(tasks, "make_request_and_get_html", return_value=ANNIFARM_PAGE)


@pytest.fixture
def enrich(mocker: MockerFixture) -> MagicMock:
    return mocker.patch(
        "products.services.product.enrich_supplement", return_value=("60 kapsuli", "", [])
    )


def scrape(page_num: int = 1, *, pharmacy: str = "Annifarm", is_first_page: bool = True) -> None:
    tasks.scrape_pharmacy_page(
        pharmacy, "https://annifarm.com.mk/c/page/1/", {}, page_num, "", is_first_page
    )


@pytest.mark.usefixtures("annifarm")
class TestScrapePharmacyPage:
    def test_creates_then_updates_products(
        self, fetch_html: MagicMock, enrich: MagicMock, caplog: pytest.LogCaptureFixture
    ) -> None:
        with caplog.at_level(logging.INFO, logger="scrapers.tasks"):
            scrape()
            scrape()

        product = Product.objects.get()
        assert (product.name, product.price) == ("Solgar Vitamin C 1000mg", 1200.0)
        first, second = records(caplog, logging.INFO)
        assert (first.card_count, first.valid_count, first.created_count) == (2, 1, 1)
        assert (second.created_count, second.updated_count) == (0, 1)
        enrich.assert_called_once()

    def test_keeps_going_when_a_product_fails(
        self, fetch_html: MagicMock, mocker: MockerFixture, caplog: pytest.LogCaptureFixture
    ) -> None:
        page = ANNIFARM_PAGE.replace("No price</p>", "Second</p>").replace(
            '/p/no-price/"></a>',
            '/p/no-price/"></a><span class="price"><span class="amount">500 ден</span></span>',
        )
        fetch_html.return_value = page
        mocker.patch.object(
            tasks,
            "create_or_update_scraped_product",
            side_effect=[RuntimeError("boom"), (ProductFactory(), True)],
        )

        with caplog.at_level(logging.INFO, logger="scrapers.tasks"):
            scrape()

        [summary] = records(caplog, logging.INFO)
        assert (summary.created_count, summary.failed_count) == (1, 1)
        [failure] = records(caplog, logging.ERROR)
        assert failure.product_name == "Solgar Vitamin C 1000mg"

    def test_warns_when_the_request_fails(
        self, fetch_html: MagicMock, caplog: pytest.LogCaptureFixture
    ) -> None:
        fetch_html.side_effect = requests.ConnectionError("refused")

        scrape()

        assert len(records(caplog, logging.WARNING)) == 1
        assert not Product.objects.exists()

    def test_errors_when_the_first_page_has_no_cards(
        self, fetch_html: MagicMock, caplog: pytest.LogCaptureFixture
    ) -> None:
        fetch_html.return_value = "<html></html>"

        scrape(is_first_page=True)

        assert len(records(caplog, logging.ERROR)) == 1

    def test_treats_a_later_empty_page_as_the_end(
        self, fetch_html: MagicMock, caplog: pytest.LogCaptureFixture
    ) -> None:
        fetch_html.return_value = "<html></html>"

        with caplog.at_level(logging.INFO, logger="scrapers.tasks"):
            scrape(5, is_first_page=False)

        assert records(caplog, logging.ERROR) == []
        assert len(records(caplog, logging.INFO)) == 1

    def test_warns_when_no_card_is_valid(
        self, fetch_html: MagicMock, caplog: pytest.LogCaptureFixture
    ) -> None:
        fetch_html.return_value = ANNIFARM_PAGE.replace("1,200 ден", "")

        scrape()

        [warning] = records(caplog, logging.WARNING)
        assert warning.card_count == 2
        assert not Product.objects.exists()

    def test_logs_and_stops_for_an_unknown_scraper(
        self, fetch_html: MagicMock, caplog: pytest.LogCaptureFixture
    ) -> None:
        PharmacyFactory(name="Nonexistent")

        scrape(pharmacy="Nonexistent")

        fetch_html.assert_not_called()
        assert len(records(caplog, logging.ERROR)) == 1
