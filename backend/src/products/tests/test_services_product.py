import logging
from datetime import timedelta
from unittest.mock import MagicMock

import pytest
from django.utils import timezone
from pytest_mock import MockerFixture

from products import exceptions
from products.models import Pharmacy, Product
from products.services import product as product_service
from products.tests.factories import (
    BrandFactory,
    CategoryFactory,
    PharmacyFactory,
    ProductFactory,
)


@pytest.mark.parametrize(
    ("product_name", "brand_name", "expected"),
    [
        ("Solgar Vitamin C 1000mg", "Solgar", "vitamin c 1000mg"),
        ("Витамин Ц", None, "vitamin c"),
        ("Omega 3 (60 caps), 1000mg", None, "omega 3 60 caps 1000mg"),
        ("Magnesium 2 x 30 tabs", None, "magnesium 2 30 tabs"),
        ("Zinc/Copper", None, "zinc copper"),
        ("Now Now Omega", "Now", "now omega"),
    ],
)
def test_get_normalized_product_name(
    product_name: str, brand_name: str | None, expected: str
) -> None:
    assert (
        product_service.get_normalized_product_name(
            product_name=product_name, brand_name=brand_name
        )
        == expected
    )


class TestNormalizeSearchQuery:
    def test_strips_and_transliterates(self) -> None:
        assert product_service.normalize_search_query(q="  магнезиум ") == "magnezium"

    def test_counts_length_after_transliteration(self) -> None:
        assert product_service.normalize_search_query(q="ж") == "zh"

    @pytest.mark.parametrize("q", ["", "   "])
    def test_rejects_an_empty_query(self, q: str) -> None:
        with pytest.raises(exceptions.ProductSearchQueryEmptyAPIError):
            product_service.normalize_search_query(q=q)

    def test_rejects_a_one_letter_query(self) -> None:
        with pytest.raises(exceptions.ProductSearchQueryShortAPIError):
            product_service.normalize_search_query(q=" a ")


@pytest.mark.django_db
class TestListMatchingProducts:
    def test_short_query_matches_brand_or_name_substrings(self) -> None:
        by_brand = ProductFactory(normalized_name="vitamin c", brand=BrandFactory(name="Solgar"))
        by_name = ProductFactory(normalized_name="omega solar")
        ProductFactory(normalized_name="zinc")

        assert set(product_service.list_matching_products(latin_q="sol")) == {by_brand, by_name}

    def test_medium_query_matches_by_similarity(self) -> None:
        match = ProductFactory(normalized_name="magnesium citrate 200mg")
        ProductFactory(normalized_name="omega 3 fish oil")

        assert list(product_service.list_matching_products(latin_q="magnezium")) == [match]

    def test_long_query_matches_by_similarity(self) -> None:
        match = ProductFactory(normalized_name="magnesium citrate 200mg")
        ProductFactory(normalized_name="omega 3 fish oil")

        result = product_service.list_matching_products(latin_q="magnesium citrate 400mg")

        assert list(result) == [match]

    def test_excludes_unreviewed_products(self) -> None:
        ProductFactory(normalized_name="vitamin c", is_reviewed=False)

        assert not product_service.list_matching_products(latin_q="vit").exists()


def scraped(**overrides: object) -> dict:
    return {
        "name": "Solgar Vitamin C 1000mg",
        "brand": "Solgar",
        "price": 1200.0,
        "discount_price": None,
        "url": "https://pharmacy.example.com/vitamin-c",
        **overrides,
    }


@pytest.fixture
def enrich(mocker: MockerFixture) -> MagicMock:
    return mocker.patch(
        "products.services.product.enrich_supplement",
        return_value=("60 kapsuli", "1000 mg", [{"name": "Vitamini", "confidence": 0.95}]),
    )


@pytest.fixture
def pharmacy(db: None) -> Pharmacy:
    return PharmacyFactory()


class TestCreateScrapedProduct:
    def test_creates_an_enriched_product(self, pharmacy: Pharmacy, enrich: MagicMock) -> None:
        vitamins = CategoryFactory(name="Vitamini")
        immunity = CategoryFactory(name="Imunitet")

        product, created = product_service.create_or_update_scraped_product(
            pharmacy=pharmacy, validated_data=scraped(), category_name="Imunitet"
        )

        assert created is True
        assert product.name == "Solgar Vitamin C 1000mg"
        assert product.normalized_name == "vitamin c 1000mg"
        assert product.brand is not None
        assert product.brand.normalized_name == "solgar"
        assert (product.form_with_count, product.dosage) == ("60 kapsuli", "1000 mg")
        assert set(product.categories.all()) == {vitamins, immunity}
        assert product.is_reviewed is True
        assert product.last_scraped_at is not None
        enrich.assert_called_once_with(
            name="Solgar Vitamin C 1000mg", categories=["Imunitet", "Vitamini"]
        )

    def test_leaves_the_product_unreviewed_without_categories(
        self, pharmacy: Pharmacy, enrich: MagicMock
    ) -> None:
        enrich.return_value = ("60 kapsuli", "", [])

        product, _ = product_service.create_or_update_scraped_product(
            pharmacy=pharmacy, validated_data=scraped(), category_name=None
        )

        assert product.is_reviewed is False

    def test_leaves_the_product_unreviewed_without_form(
        self, pharmacy: Pharmacy, enrich: MagicMock
    ) -> None:
        CategoryFactory(name="Vitamini")
        enrich.return_value = ("", "", [{"name": "Vitamini", "confidence": 0.95}])

        product, _ = product_service.create_or_update_scraped_product(
            pharmacy=pharmacy, validated_data=scraped(), category_name=None
        )

        assert product.is_reviewed is False

    def test_infers_a_missing_brand(self, pharmacy: Pharmacy, enrich: MagicMock) -> None:
        solgar = BrandFactory(name="Solgar")

        product, _ = product_service.create_or_update_scraped_product(
            pharmacy=pharmacy, validated_data=scraped(brand=None), category_name=None
        )

        assert product.brand == solgar

    def test_creates_a_separate_product_per_pharmacy(
        self, pharmacy: Pharmacy, enrich: MagicMock
    ) -> None:
        ProductFactory(name="Solgar Vitamin C 1000mg")

        _, created = product_service.create_or_update_scraped_product(
            pharmacy=pharmacy, validated_data=scraped(), category_name=None
        )

        assert created is True
        assert Product.objects.count() == 2


class TestUpdateScrapedProduct:
    def test_updates_prices_and_scrape_time(
        self, pharmacy: Pharmacy, enrich: MagicMock, caplog: pytest.LogCaptureFixture
    ) -> None:
        old_scrape = timezone.now() - timedelta(days=1)
        existing = ProductFactory(
            pharmacy=pharmacy,
            name="Solgar Vitamin C 1000mg",
            price=1000.0,
            brand=BrandFactory(),
            last_scraped_at=old_scrape,
        )

        with caplog.at_level(logging.INFO, logger="products.services.product"):
            product, created = product_service.create_or_update_scraped_product(
                pharmacy=pharmacy,
                validated_data=scraped(price=1200.0, discount_price=999.0),
                category_name=None,
            )

        assert created is False
        assert product.pk == existing.pk
        existing.refresh_from_db()
        assert (existing.price, existing.discount_price) == (1200.0, 999.0)
        assert existing.last_scraped_at > old_scrape
        enrich.assert_not_called()

        [record] = [r for r in caplog.records if r.name == "products.services.product"]
        assert record.changes == ["price 1000.0 -> 1200.0", "discount_price None -> 999.0"]

    def test_keeps_unchanged_prices(self, pharmacy: Pharmacy, enrich: MagicMock) -> None:
        existing = ProductFactory(
            pharmacy=pharmacy, name="Solgar Vitamin C 1000mg", price=1200.0, brand=BrandFactory()
        )

        product_service.create_or_update_scraped_product(
            pharmacy=pharmacy, validated_data=scraped(), category_name=None
        )

        existing.refresh_from_db()
        assert (existing.price, existing.discount_price) == (1200.0, None)

    def test_infers_a_missing_brand(self, pharmacy: Pharmacy, enrich: MagicMock) -> None:
        solgar = BrandFactory(name="Solgar")
        existing = ProductFactory(pharmacy=pharmacy, name="Solgar Vitamin C 1000mg", brand=None)

        product_service.create_or_update_scraped_product(
            pharmacy=pharmacy, validated_data=scraped(), category_name=None
        )

        existing.refresh_from_db()
        assert existing.brand == solgar

    def test_adds_the_catalog_category(self, pharmacy: Pharmacy, enrich: MagicMock) -> None:
        immunity = CategoryFactory(name="Imunitet")
        existing = ProductFactory(pharmacy=pharmacy, name="Solgar Vitamin C 1000mg")

        product_service.create_or_update_scraped_product(
            pharmacy=pharmacy, validated_data=scraped(), category_name="Imunitet"
        )

        assert list(existing.categories.all()) == [immunity]
