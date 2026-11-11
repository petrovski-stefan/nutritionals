from datetime import UTC, datetime
from unittest.mock import MagicMock

import pytest
from pytest_mock import MockerFixture
from rest_framework.test import APIClient

from products.services import productgroup as productgroup_service
from products.tests.factories import (
    BrandFactory,
    CategoryFactory,
    PharmacyFactory,
    ProductFactory,
    ProductGroupFactory,
)

GROUPS_URL = "/api/v1/product-groups/"
DISCOUNTED_URL = "/api/v1/product-groups/discounted/"
SMART_SEARCH_URL = "/api/v1/products/smart-search/"

pytestmark = pytest.mark.django_db


def data(response):
    assert response.status_code == 200, response.json()
    body = response.json()
    assert body["success"] is True

    return body["data"]


def errors(response) -> set[tuple[str | None, str]]:
    return {(e["attr"], e["code"]) for e in response.json()["errors"]}


class TestProductGroupList:
    def test_returns_a_page_of_groups(self, api_client: APIClient) -> None:
        brand = BrandFactory(name="Solgar")
        category = CategoryFactory(name="Vitamini")
        group = ProductGroupFactory(brand=brand, categories=[category])
        product = ProductFactory(
            group=group,
            brand=brand,
            price=500.0,
            discount_price=400.0,
            last_scraped_at=datetime(2026, 1, 2, tzinfo=UTC),
        )

        page = data(api_client.get(GROUPS_URL))

        assert page["count"] == 1
        assert page["results"] == [
            {
                "id": group.pk,
                "name": group.name,
                "brand_name": "Solgar",
                "categories": [{"id": category.pk, "name": "Vitamini"}],
                "products": [
                    {
                        "id": product.pk,
                        "name": product.name,
                        "price": 500.0,
                        "discount_price": 400.0,
                        "discount_percent": 20.0,
                        "pharmacy_name": product.pharmacy.name,
                        "brand_name": "Solgar",
                        "url": product.url,
                        "last_scraped_at": "2026-01-02T01:00:00+01:00",
                    }
                ],
            }
        ]

    def test_paginates_by_six(self, api_client: APIClient) -> None:
        ProductGroupFactory.create_batch(7)

        first = data(api_client.get(GROUPS_URL))
        second = data(api_client.get(GROUPS_URL, {"page": 2}))

        assert (first["count"], len(first["results"]), len(second["results"])) == (7, 6, 1)
        assert first["next"] is not None
        assert {g["id"] for g in first["results"]}.isdisjoint(g["id"] for g in second["results"])

    def test_filters_by_brands(self, api_client: APIClient) -> None:
        first, second = BrandFactory(), BrandFactory()
        kept = [ProductGroupFactory(brand=first), ProductGroupFactory(brand=second)]
        ProductGroupFactory(brand=BrandFactory())

        page = data(api_client.get(GROUPS_URL, {"brand": f"{first.pk},{second.pk}"}))

        assert {g["id"] for g in page["results"]} == {g.pk for g in kept}

    def test_filters_by_categories_without_duplicates(self, api_client: APIClient) -> None:
        first, second = CategoryFactory(), CategoryFactory()
        kept = ProductGroupFactory(categories=[first, second])
        ProductGroupFactory(categories=[CategoryFactory()])

        page = data(api_client.get(GROUPS_URL, {"categories": f"{first.pk},{second.pk}"}))

        assert [g["id"] for g in page["results"]] == [kept.pk]

    def test_searches_with_q(self, api_client: APIClient) -> None:
        kept = ProductGroupFactory()
        ProductFactory(group=kept, normalized_name="magnesium citrate")
        ProductFactory(group=ProductGroupFactory(), normalized_name="omega 3")

        page = data(api_client.get(GROUPS_URL, {"q": "магнезиум"}))

        assert [g["id"] for g in page["results"]] == [kept.pk]

    def test_rejects_a_short_q(self, api_client: APIClient) -> None:
        response = api_client.get(GROUPS_URL, {"q": "a"})

        assert response.status_code == 400
        assert errors(response) == {(None, "query_short")}


class TestDiscountedProductGroupList:
    def test_returns_categories_and_deals(self, api_client: APIClient) -> None:
        group = ProductGroupFactory()
        ProductFactory(group=group, price=500.0, discount_price=400.0)

        payload = data(api_client.get(DISCOUNTED_URL))

        assert payload["categories"] == []
        [deal] = payload["results"]
        assert deal["id"] == group.pk
        assert deal["best_discount_percent"] == 20.0
        assert deal["lowest_price"] == 400.0
        assert deal["offer_count"] == 1
        assert "categories" not in deal

    def test_filters_by_category(self, api_client: APIClient) -> None:
        category = CategoryFactory()
        kept = ProductGroupFactory(categories=[category])
        ProductFactory(group=kept, discount_price=100.0)
        ProductFactory(group=ProductGroupFactory(), discount_price=100.0)

        payload = data(api_client.get(DISCOUNTED_URL, {"category_id": category.pk}))

        assert [d["id"] for d in payload["results"]] == [kept.pk]

    def test_rejects_an_unknown_category(self, api_client: APIClient) -> None:
        response = api_client.get(DISCOUNTED_URL, {"category_id": 999_999})

        assert response.status_code == 400
        assert errors(response) == {("category_id", "does_not_exist")}


class TestSmartSearch:
    @pytest.fixture
    def smart_search_ai(self, mocker: MockerFixture) -> MagicMock:
        return mocker.patch.object(productgroup_service, "smart_search_ai")

    def test_returns_the_ranked_groups(
        self, api_client: APIClient, smart_search_ai: MagicMock
    ) -> None:
        group = ProductGroupFactory()
        ProductFactory(group=group, normalized_name="melatonin 5mg")
        smart_search_ai.convert_query_to_tags.return_value = ["melatonin"]
        smart_search_ai.smart_search.return_value = [group.pk]

        response = api_client.post(SMART_SEARCH_URL, {"query": "for sleep"}, format="json")

        assert [g["id"] for g in data(response)] == [group.pk]

    @pytest.mark.parametrize(
        ("query", "code"), [("ab", "min_length"), ("x" * 101, "max_length"), ("", "blank")]
    )
    def test_validates_the_query(self, api_client: APIClient, query: str, code: str) -> None:
        response = api_client.post(SMART_SEARCH_URL, {"query": query}, format="json")

        assert response.status_code == 400
        assert errors(response) == {("query", code)}


def test_brand_list(api_client: APIClient) -> None:
    brand = BrandFactory(name="Solgar")
    ProductFactory(brand=brand)

    assert data(api_client.get("/api/v1/brands/")) == [{"id": brand.pk, "name": "Solgar"}]


def test_pharmacy_list(api_client: APIClient) -> None:
    pharmacy = PharmacyFactory(name="Zegin", homepage="https://zegin.com.mk/")
    ProductFactory(pharmacy=pharmacy, last_scraped_at=datetime(2026, 1, 2, tzinfo=UTC))

    assert data(api_client.get("/api/v1/pharmacies/")) == [
        {
            "id": pharmacy.pk,
            "name": "Zegin",
            "homepage": "https://zegin.com.mk/",
            "num_products": 1,
            "last_scraped_at": "2026-01-02T01:00:00+01:00",
        }
    ]


def test_category_list(api_client: APIClient) -> None:
    second = CategoryFactory(name="Vitamini")
    first = CategoryFactory(name="Minerali")

    assert data(api_client.get("/api/v1/categories/")) == [
        {"id": first.pk, "name": "Minerali"},
        {"id": second.pk, "name": "Vitamini"},
    ]
