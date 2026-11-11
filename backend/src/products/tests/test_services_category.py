import pytest

from products.models import Category, ProductGroup
from products.services import category as category_service
from products.tests.factories import CategoryFactory, ProductFactory, ProductGroupFactory


@pytest.mark.django_db
class TestGetCategoryByName:
    def test_returns_the_category(self) -> None:
        category = CategoryFactory(name="Vitamini")

        assert category_service.get_category_by_name(name="Vitamini") == category

    @pytest.mark.parametrize("name", [None, "", "Missing"])
    def test_returns_none(self, name: str | None) -> None:
        assert category_service.get_category_by_name(name=name) is None


def ai(name: str, confidence: float) -> dict:
    return {"name": name, "confidence": confidence}


@pytest.mark.parametrize(
    ("ai_categories", "catalog_category", "expected"),
    [
        ([], None, []),
        ([ai("A", 0.9)], None, ["A"]),
        ([ai("A", 0.8)], None, []),  # the threshold is exclusive
        ([ai("A", 0.5)], "B", ["B"]),
        ([], "B", ["B"]),
        ([ai("A", 0.9)], "A", ["A"]),
        ([ai("A", 0.9), ai("C", 0.95)], "B", ["A", "B", "C"]),
    ],
)
def test_get_unique_categories(
    ai_categories: list[dict], catalog_category: str | None, expected: list[str]
) -> None:
    result = category_service.get_unique_categories(
        ai_categories=ai_categories, catalog_category=catalog_category
    )

    assert sorted(result) == expected


@pytest.mark.django_db
def test_list_categories_and_names_are_ordered_by_name() -> None:
    CategoryFactory(name="Минерали")
    CategoryFactory(name="Алфа")

    assert [c.name for c in category_service.list_categories()] == ["Алфа", "Минерали"]
    assert category_service.list_category_names() == ["Алфа", "Минерали"]


def make_discounted_groups(
    category: Category, count: int, **product_kwargs: object
) -> list[ProductGroup]:
    groups = ProductGroupFactory.create_batch(count, categories=[category])

    for group in groups:
        ProductFactory(group=group, discount_price=400.0, **product_kwargs)

    return groups


@pytest.mark.django_db
class TestListCategoriesWithDiscountedGroups:
    def test_returns_categories_with_enough_groups_ordered_by_count(self) -> None:
        minerals = CategoryFactory(name="Minerali")
        vitamins = CategoryFactory(name="Vitamini")
        omega = CategoryFactory(name="Omega")
        make_discounted_groups(minerals, 3)
        make_discounted_groups(vitamins, 4)
        make_discounted_groups(omega, 3)
        make_discounted_groups(CategoryFactory(), 2)

        result = category_service.list_categories_with_discounted_groups()

        assert [(c.name, c.group_count) for c in result] == [
            ("Vitamini", 4),
            ("Minerali", 3),
            ("Omega", 3),
        ]

    def test_returns_nothing_when_only_one_category_qualifies(self) -> None:
        make_discounted_groups(CategoryFactory(), 5)

        assert list(category_service.list_categories_with_discounted_groups()) == []

    def test_excludes_the_catch_all_category(self) -> None:
        make_discounted_groups(CategoryFactory(), 3)
        make_discounted_groups(CategoryFactory(), 3)
        make_discounted_groups(CategoryFactory(name=category_service.CATCH_ALL_CATEGORY_NAME), 5)

        names = {c.name for c in category_service.list_categories_with_discounted_groups()}

        assert category_service.CATCH_ALL_CATEGORY_NAME not in names
        assert len(names) == 2

    def test_counts_only_public_discounted_groups(self) -> None:
        make_discounted_groups(CategoryFactory(name="First"), 3)
        make_discounted_groups(CategoryFactory(name="Second"), 3)
        # 2 groups count; the unreviewed product, the undiscounted product and the
        # unreviewed group would take it to 5
        other = CategoryFactory(name="Other")
        make_discounted_groups(other, 2)
        make_discounted_groups(other, 1, is_reviewed=False)
        ProductFactory(group=ProductGroupFactory(categories=[other]), discount_price=None)
        hidden_group = ProductGroupFactory(categories=[other], is_reviewed=False)
        ProductFactory(group=hidden_group, discount_price=400.0)

        names = {c.name for c in category_service.list_categories_with_discounted_groups()}

        assert names == {"First", "Second"}
