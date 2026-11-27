import pytest

from products.models import Brand, Category, Pharmacy
from products.services import grouping as grouping_service
from products.tests.factories import (
    BrandFactory,
    CategoryFactory,
    PharmacyFactory,
    ProductFactory,
    ProductGroupFactory,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def pharmacy() -> Pharmacy:
    return PharmacyFactory()


@pytest.fixture
def brand() -> Brand:
    return BrandFactory()


@pytest.fixture
def category() -> Category:
    return CategoryFactory()


def make_group_with_product(*, brand: Brand | None, category: Category, **product_kwargs):
    group = ProductGroupFactory(brand=brand, categories=[category])
    ProductFactory(
        group=group,
        brand=brand,
        categories=[category],
        normalized_name="vitamin c 1000mg",
        form_with_count="60 tableti",
        dosage="1000 mg",
        **product_kwargs,
    )

    return group


def make_ungrouped_product(*, brand: Brand | None, category: Category, **overrides):
    defaults = {
        "normalized_name": "vitamin c 1000mg",
        "form_with_count": "60 tableti",
        "dosage": "1000 mg",
    }

    return ProductFactory(brand=brand, categories=[category], **{**defaults, **overrides})


class TestAssignProductToGroup:
    def test_skips_a_grouped_product(self) -> None:
        product = ProductFactory(group=ProductGroupFactory())

        assert grouping_service.assign_product_to_group(product) == "skipped"

    def test_joins_the_matching_group(self, brand: Brand, category: Category) -> None:
        group = make_group_with_product(brand=brand, category=category)
        product = make_ungrouped_product(brand=brand, category=category)

        assert grouping_service.assign_product_to_group(product) == "joined"
        product.refresh_from_db()
        assert product.group == group

    def test_joins_the_group_and_adds_the_products_categories(
        self, brand: Brand, category: Category
    ) -> None:
        group = make_group_with_product(brand=brand, category=category)
        extra = CategoryFactory()
        product = make_ungrouped_product(brand=brand, category=category)
        product.categories.add(extra)

        grouping_service.assign_product_to_group(product)

        assert set(group.categories.all()) == {category, extra}

    def test_creates_a_group_when_nothing_matches(self, brand: Brand, category: Category) -> None:
        product = make_ungrouped_product(brand=brand, category=category)

        assert grouping_service.assign_product_to_group(product) == "created"

        product.refresh_from_db()
        assert product.group is not None
        assert (product.group.name, product.group.brand) == (product.name, brand)
        assert list(product.group.categories.all()) == [category]

    @pytest.mark.parametrize(
        "overrides",
        [
            {"normalized_name": "omega 3 fish oil"},
            {"brand": None},
        ],
        ids=["different-name", "different-brand"],
    )
    def test_creates_a_group_for_a_poor_match(
        self, brand: Brand, category: Category, overrides: dict
    ) -> None:
        group = make_group_with_product(brand=brand, category=category)
        product = make_ungrouped_product(**{"brand": brand, "category": category, **overrides})

        assert grouping_service.assign_product_to_group(product) == "created"
        product.refresh_from_db()
        assert product.group != group

    def test_skips_a_group_holding_two_products_from_the_pharmacy(
        self, brand: Brand, category: Category, pharmacy: Pharmacy
    ) -> None:
        group = make_group_with_product(brand=brand, category=category, pharmacy=pharmacy)
        ProductFactory(group=group, brand=brand, pharmacy=pharmacy)
        product = make_ungrouped_product(brand=brand, category=category, pharmacy=pharmacy)

        assert grouping_service.assign_product_to_group(product) == "created"

    def test_ignores_unreviewed_groups(self, brand: Brand, category: Category) -> None:
        group = make_group_with_product(brand=brand, category=category)
        group.is_reviewed = False
        group.save()
        product = make_ungrouped_product(brand=brand, category=category)

        assert grouping_service.assign_product_to_group(product) == "created"
