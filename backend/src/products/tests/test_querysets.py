import pytest
from django.core.exceptions import ValidationError

from products.models import Product, ProductGroup
from products.tests.factories import PharmacyCatalogFactory, ProductFactory, ProductGroupFactory
from products.validators import validate_catalog_queryparams_string

pytestmark = pytest.mark.django_db


def test_product_public_keeps_reviewed_products() -> None:
    reviewed = ProductFactory(is_reviewed=True)
    ProductFactory(is_reviewed=False)

    assert list(Product.objects.public()) == [reviewed]


@pytest.mark.parametrize(
    ("price", "discount_price", "expected"),
    [(500.0, 400.0, 20), (300.0, 199.0, 34), (500.0, None, None)],
)
def test_product_with_discount_percent(
    price: float, discount_price: float | None, expected: int | None
) -> None:
    ProductFactory(price=price, discount_price=discount_price)

    assert Product.objects.with_discount_percent().get().discount_percent == expected


def test_group_public_keeps_reviewed_groups_even_without_products() -> None:
    reviewed = ProductGroupFactory(is_reviewed=True)
    ProductGroupFactory(is_reviewed=False)

    assert list(ProductGroup.objects.public()) == [reviewed]


def test_group_with_product_count_counts_every_product() -> None:
    group = ProductGroupFactory()
    ProductFactory(group=group, is_reviewed=True)
    ProductFactory(group=group, is_reviewed=False)

    assert ProductGroup.objects.with_product_count().get(pk=group.pk).product_count == 2


@pytest.mark.parametrize("value", ["", "?page=1", "?orderby=price&per_page=48"])
def test_queryparams_validator_accepts(value: str) -> None:
    validate_catalog_queryparams_string(value)


def test_queryparams_validator_rejects_a_missing_question_mark() -> None:
    with pytest.raises(ValidationError):
        validate_catalog_queryparams_string("page=1")


def test_catalog_model_runs_the_queryparams_validator() -> None:
    catalog = PharmacyCatalogFactory(queryparams_string="page=1")

    with pytest.raises(ValidationError) as exc_info:
        catalog.full_clean()

    assert "queryparams_string" in exc_info.value.message_dict
