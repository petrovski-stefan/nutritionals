import pytest

from products import exceptions
from products.models import ProductGroup, ProductGroupCategory
from products.services import productgroup as productgroup_service
from products.services import productgroupcategory as productgroupcategory_service
from products.tests.factories import (
    CategoryFactory,
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

    def test_orders_by_lowest_current_price_groups_without_offers_last(self) -> None:
        dear = ProductGroupFactory()
        ProductFactory(group=dear, price=900.0)
        cheap_on_discount = ProductGroupFactory()
        ProductFactory(group=cheap_on_discount, price=1000.0, discount_price=300.0)
        middle = ProductGroupFactory()
        ProductFactory(group=middle, price=500.0)
        ProductFactory(group=middle, price=450.0, is_reviewed=False)
        empty = ProductGroupFactory()

        result = list(productgroup_service.list_productgroups(ordering="price"))

        assert result == [cheap_on_discount, middle, dear, empty]

    def test_orders_by_price_over_every_offer_when_searching(self) -> None:
        # The matching offer is dear, but the group's cheapest offer decides its place
        cheap_elsewhere = ProductGroupFactory()
        ProductFactory(group=cheap_elsewhere, normalized_name="zinc picolinate", price=900.0)
        ProductFactory(group=cheap_elsewhere, normalized_name="omega 3", price=100.0)
        middle = ProductGroupFactory()
        ProductFactory(group=middle, normalized_name="zinc citrate", price=400.0)

        result = list(productgroup_service.list_productgroups(q="zinc", ordering="price"))

        assert result == [cheap_elsewhere, middle]

    def test_orders_by_best_discount_groups_without_discount_last(self) -> None:
        small = ProductGroupFactory()
        ProductFactory(group=small, price=1000.0, discount_price=900.0)
        big = ProductGroupFactory()
        ProductFactory(group=big, price=1000.0, discount_price=500.0)
        ProductFactory(group=big, price=1000.0, discount_price=800.0)
        none = ProductGroupFactory()
        ProductFactory(group=none, price=1000.0)

        result = list(productgroup_service.list_productgroups(ordering="discount"))

        assert result == [big, small, none]


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
