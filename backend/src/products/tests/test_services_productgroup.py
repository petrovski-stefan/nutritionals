from unittest.mock import MagicMock

import pytest
from pytest_mock import MockerFixture

from products import exceptions
from products.models import Brand, Category, Pharmacy, ProductGroup, ProductGroupCategory
from products.services import productgroup as productgroup_service
from products.services import productgroupcategory as productgroupcategory_service
from products.tests.factories import (
    BrandFactory,
    CategoryFactory,
    PharmacyFactory,
    ProductFactory,
    ProductGroupFactory,
)

pytestmark = pytest.mark.django_db


class TestListProductgroups:
    def test_orders_public_groups_by_product_count_then_id(self) -> None:
        small_first = ProductGroupFactory()
        big = ProductGroupFactory()
        small_second = ProductGroupFactory()
        ProductFactory.create_batch(2, group=big)
        ProductFactory(group=small_first)
        ProductFactory(group=small_second)
        ProductGroupFactory(is_reviewed=False)

        result = list(productgroup_service.list_productgroups())

        assert result == [big, small_first, small_second]

    def test_prefetches_only_public_products_with_discount_percent(self) -> None:
        group = ProductGroupFactory()
        public = ProductFactory(group=group, price=500.0, discount_price=400.0)
        ProductFactory(group=group, is_reviewed=False)

        [fetched] = productgroup_service.list_productgroups()

        [product] = fetched.product_set.all()
        assert product == public
        assert product.discount_percent == 20

    @pytest.mark.parametrize("q", [None, "", "   "])
    def test_ignores_a_blank_query(self, q: str | None) -> None:
        ProductGroupFactory()

        assert productgroup_service.list_productgroups(q=q).count() == 1

    def test_keeps_groups_with_a_matching_product_best_match_first(self) -> None:
        close = ProductGroupFactory()
        ProductFactory(group=close, normalized_name="magnesium citrate 200mg")
        exact = ProductGroupFactory()
        ProductFactory(group=exact, normalized_name="magnesium citrate")
        ProductGroupFactory()
        ProductFactory(normalized_name="omega 3 fish oil")

        result = list(productgroup_service.list_productgroups(q="Magnesium citrate"))

        assert result == [exact, close]

    def test_counts_only_matching_products_when_searching(self) -> None:
        group = ProductGroupFactory()
        ProductFactory(group=group, normalized_name="zinc picolinate")
        ProductFactory(group=group, normalized_name="omega 3")

        [fetched] = productgroup_service.list_productgroups(q="zinc")

        assert fetched.product_count == 1

    def test_rejects_a_too_short_query(self) -> None:
        with pytest.raises(exceptions.ProductSearchQueryShortAPIError):
            productgroup_service.list_productgroups(q="a")


class TestListDiscountedGroups:
    def test_annotates_the_best_deal(self) -> None:
        group = ProductGroupFactory()
        ProductFactory(group=group, price=500.0, discount_price=400.0)
        ProductFactory(group=group, price=1000.0, discount_price=500.0)
        ProductFactory(group=group, price=350.0)
        ProductFactory(group=group, price=100.0, discount_price=10.0, is_reviewed=False)

        [fetched] = productgroup_service.list_discounted_groups()

        assert fetched.best_discount_percent == 50
        assert fetched.lowest_price == 350.0
        assert fetched.offer_count == 3
        assert len(fetched.product_set.all()) == 3

    def test_excludes_groups_without_a_public_discount(self) -> None:
        ProductFactory(group=ProductGroupFactory(), discount_price=None)
        ProductFactory(group=ProductGroupFactory(), discount_price=100.0, is_reviewed=False)
        ProductFactory(group=ProductGroupFactory(is_reviewed=False), discount_price=100.0)

        assert list(productgroup_service.list_discounted_groups()) == []

    def test_orders_by_best_discount(self) -> None:
        small = ProductGroupFactory()
        ProductFactory(group=small, price=100.0, discount_price=90.0)
        large = ProductGroupFactory()
        ProductFactory(group=large, price=100.0, discount_price=50.0)

        assert list(productgroup_service.list_discounted_groups()) == [large, small]

    def test_filters_by_category(self) -> None:
        vitamins = CategoryFactory()
        kept = ProductGroupFactory(categories=[vitamins, CategoryFactory()])
        ProductFactory(group=kept, discount_price=100.0)
        ProductFactory(group=ProductGroupFactory(categories=[CategoryFactory()]), discount_price=1)

        [fetched] = productgroup_service.list_discounted_groups(category=vitamins)

        assert fetched == kept
        assert fetched.offer_count == 1

    def test_returns_at_most_the_limit(self) -> None:
        for _ in range(productgroup_service.DISCOUNTED_GROUPS_LIMIT + 1):
            ProductFactory(group=ProductGroupFactory(), discount_price=100.0)

        result = productgroup_service.list_discounted_groups()

        assert len(result) == productgroup_service.DISCOUNTED_GROUPS_LIMIT


@pytest.fixture
def smart_search_ai(mocker: MockerFixture) -> MagicMock:
    return mocker.patch.object(productgroup_service, "smart_search_ai")


def magnesium_group(name: str) -> ProductGroup:
    group = ProductGroupFactory(name=name)
    ProductFactory(group=group, normalized_name=f"magnesium {name}")

    return group


class TestGetSmartSearchedProductgroups:
    def test_returns_nothing_without_keywords(self, smart_search_ai: MagicMock) -> None:
        smart_search_ai.convert_query_to_tags.return_value = []

        result = productgroup_service.get_smart_searched_productgroups(query="weather today")

        assert list(result) == []
        smart_search_ai.smart_search.assert_not_called()

    def test_keeps_the_ai_order_and_drops_unknown_and_repeated_ids(
        self, smart_search_ai: MagicMock
    ) -> None:
        first = magnesium_group("citrate")
        second = magnesium_group("oxide")
        magnesium_group("glycinate")
        smart_search_ai.convert_query_to_tags.return_value = ["magnesium"]
        smart_search_ai.smart_search.return_value = [second.pk, 999_999, first.pk, second.pk]

        result = productgroup_service.get_smart_searched_productgroups(query="za spienje")

        assert list(result) == [second, first]

    def test_offers_only_similar_public_groups_as_candidates(
        self, smart_search_ai: MagicMock
    ) -> None:
        similar = magnesium_group("citrate")
        hidden = ProductGroupFactory(is_reviewed=False)
        ProductFactory(group=hidden, normalized_name="magnesium oxide")
        ProductFactory(group=ProductGroupFactory(), normalized_name="omega 3 fish oil")
        smart_search_ai.convert_query_to_tags.return_value = ["magnesium", "magnesium citrate"]
        smart_search_ai.smart_search.return_value = []

        result = productgroup_service.get_smart_searched_productgroups(query="за спиење")

        assert list(result) == []
        smart_search_ai.convert_query_to_tags.assert_called_once_with(latin_query="za spienje")
        smart_search_ai.smart_search.assert_called_once_with(
            latin_query="za spienje", candidates=[{"id": similar.pk, "name": similar.name}]
        )


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

        assert productgroup_service.assign_product_to_group(product) == "skipped"

    def test_joins_the_matching_group(self, brand: Brand, category: Category) -> None:
        group = make_group_with_product(brand=brand, category=category)
        product = make_ungrouped_product(brand=brand, category=category)

        assert productgroup_service.assign_product_to_group(product) == "joined"
        product.refresh_from_db()
        assert product.group == group

    def test_joins_the_group_and_adds_the_products_categories(
        self, brand: Brand, category: Category
    ) -> None:
        group = make_group_with_product(brand=brand, category=category)
        extra = CategoryFactory()
        product = make_ungrouped_product(brand=brand, category=category)
        product.categories.add(extra)

        productgroup_service.assign_product_to_group(product)

        assert set(group.categories.all()) == {category, extra}

    def test_creates_a_group_when_nothing_matches(self, brand: Brand, category: Category) -> None:
        product = make_ungrouped_product(brand=brand, category=category)

        assert productgroup_service.assign_product_to_group(product) == "created"

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

        assert productgroup_service.assign_product_to_group(product) == "created"
        product.refresh_from_db()
        assert product.group != group

    def test_skips_a_group_holding_two_products_from_the_pharmacy(
        self, brand: Brand, category: Category, pharmacy: Pharmacy
    ) -> None:
        group = make_group_with_product(brand=brand, category=category, pharmacy=pharmacy)
        ProductFactory(group=group, brand=brand, pharmacy=pharmacy)
        product = make_ungrouped_product(brand=brand, category=category, pharmacy=pharmacy)

        assert productgroup_service.assign_product_to_group(product) == "created"

    def test_ignores_unreviewed_groups(self, brand: Brand, category: Category) -> None:
        group = make_group_with_product(brand=brand, category=category)
        group.is_reviewed = False
        group.save()
        product = make_ungrouped_product(brand=brand, category=category)

        assert productgroup_service.assign_product_to_group(product) == "created"


def test_filter_by_category_count() -> None:
    none = ProductGroupFactory()
    one = ProductGroupFactory(categories=[CategoryFactory()])
    ProductGroupFactory(categories=[CategoryFactory(), CategoryFactory()])
    qs = ProductGroup.objects.all()

    assert list(productgroup_service.filter_by_category_count(queryset=qs, category_count=0)) == [
        none
    ]
    assert list(productgroup_service.filter_by_category_count(queryset=qs, category_count=1)) == [
        one
    ]


def test_assign_unique_categories_to_group_is_idempotent() -> None:
    group = ProductGroupFactory()
    category = CategoryFactory()

    for _ in range(2):
        productgroupcategory_service.assign_unique_categories_to_group(
            category_ids=[category.pk], group=group
        )

    assert ProductGroupCategory.objects.filter(group=group).count() == 1
