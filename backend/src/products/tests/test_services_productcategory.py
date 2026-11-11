import logging

import pytest

from products.services import productcategory as productcategory_service
from products.tests.factories import CategoryFactory, ProductFactory

pytestmark = pytest.mark.django_db


def test_adds_existing_categories() -> None:
    vitamins = CategoryFactory(name="Vitamini")
    minerals = CategoryFactory(name="Minerali")
    product = ProductFactory()

    productcategory_service.add_categories_to_product(
        categories=["Vitamini", "Minerali"], product=product
    )

    assert set(product.categories.all()) == {vitamins, minerals}


def test_skips_a_category_the_product_already_has() -> None:
    vitamins = CategoryFactory(name="Vitamini")
    product = ProductFactory(categories=[vitamins])

    productcategory_service.add_categories_to_product(categories=["Vitamini"], product=product)

    assert list(product.categories.all()) == [vitamins]


def test_skips_and_warns_about_an_unknown_category(caplog: pytest.LogCaptureFixture) -> None:
    product = ProductFactory()

    with caplog.at_level(logging.WARNING, logger="products.services.productcategory"):
        productcategory_service.add_categories_to_product(categories=["Missing"], product=product)

    assert not product.categories.exists()
    [record] = caplog.records
    assert record.category == "Missing"


def test_does_nothing_without_categories() -> None:
    product = ProductFactory()

    productcategory_service.add_categories_to_product(categories=[], product=product)

    assert not product.categories.exists()
