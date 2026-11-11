import pytest
from django.db.models import Model
from django.test import Client
from django.urls import reverse

from products.tests.factories import (
    BrandFactory,
    CategoryFactory,
    PharmacyCatalogFactory,
    ProductFactory,
    ProductGroupFactory,
)

pytestmark = pytest.mark.django_db


def admin_url(obj: Model, action: str) -> str:
    meta = obj._meta
    args = [obj.pk] if action == "change" else []

    return reverse(f"admin:{meta.app_label}_{meta.model_name}_{action}", args=args)


@pytest.fixture
def objects() -> list[Model]:
    category = CategoryFactory()
    brand = BrandFactory()
    group = ProductGroupFactory(brand=brand, categories=[category])
    product = ProductFactory(group=group, brand=brand, categories=[category])
    catalog = PharmacyCatalogFactory(pharmacy=product.pharmacy, category=category)

    return [category, brand, group, product, catalog.pharmacy]


@pytest.mark.parametrize("action", ["changelist", "add", "change"])
def test_admin_pages_render(admin_client: Client, objects: list[Model], action: str) -> None:
    for obj in objects:
        response = admin_client.get(admin_url(obj, action))

        assert response.status_code == 200, f"{type(obj).__name__} {action}"


@pytest.mark.parametrize("is_grouped", ["true", "false"])
def test_product_is_grouped_filter(admin_client: Client, is_grouped: str) -> None:
    grouped = ProductFactory(group=ProductGroupFactory())
    ungrouped = ProductFactory()
    url = reverse("admin:products_product_changelist")

    response = admin_client.get(url, {"is_grouped": is_grouped})

    expected, other = (grouped, ungrouped) if is_grouped == "true" else (ungrouped, grouped)
    assert list(response.context["cl"].queryset) == [expected]
    assert other not in response.context["cl"].queryset


@pytest.mark.parametrize(
    "params",
    [
        {"is_reviewed__exact": "1"},
        {"pharmacy__id__exact": "{pharmacy}"},
        {"q": "magnes"},
    ],
    ids=["is_reviewed", "pharmacy", "search"],
)
def test_product_is_grouped_filter_combines_with_other_filters(
    admin_client: Client, params: dict[str, str]
) -> None:
    group = ProductGroupFactory()
    kept = ProductFactory(name="Magnesium citrate", group=group)
    ProductFactory(name="Magnesium oxide", group=group, is_reviewed=False)
    ProductFactory(name="Omega 3", group=group, pharmacy=kept.pharmacy, is_reviewed=False)
    ProductFactory(name="Magnesium glycinate")
    params = {k: v.format(pharmacy=kept.pharmacy_id) for k, v in params.items()}
    url = reverse("admin:products_product_changelist")

    response = admin_client.get(url, {"is_grouped": "true", **params})

    names = {p.name for p in response.context["cl"].queryset}
    assert kept.name in names
    assert "Magnesium glycinate" not in names
    assert len(names) < 3, f"{params} was dropped: {sorted(names)}"


def test_group_category_count_filter(admin_client: Client) -> None:
    ProductGroupFactory()
    one = ProductGroupFactory(categories=[CategoryFactory()])
    url = reverse("admin:products_productgroup_changelist")

    response = admin_client.get(url, {"category_count": "1"})

    assert list(response.context["cl"].queryset) == [one]


def test_brand_changelist_shows_counts(admin_client: Client) -> None:
    brand = BrandFactory()
    ProductFactory(brand=brand)

    response = admin_client.get(reverse("admin:products_brand_changelist"))

    [row] = response.context["cl"].result_list
    assert (row.total_product_count, row.reviewed_product_count) == (1, 1)
    assert row == brand


def test_product_search(admin_client: Client) -> None:
    kept = ProductFactory(name="Magnesium citrate")
    ProductFactory(name="Omega 3")

    response = admin_client.get(reverse("admin:products_product_changelist"), {"q": "magnes"})

    assert list(response.context["cl"].result_list) == [kept]
