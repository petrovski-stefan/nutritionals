import logging

import pytest
from pytest_mock import MockerFixture

from products.tasks import group_products
from products.tests.factories import ProductFactory, ProductGroupFactory

pytestmark = pytest.mark.django_db


def summary(caplog: pytest.LogCaptureFixture) -> logging.LogRecord:
    [record] = [r for r in caplog.records if r.name == "products.tasks" and r.levelno == 20]

    return record


def test_groups_public_products_and_logs_the_outcomes(caplog: pytest.LogCaptureFixture) -> None:
    ungrouped = ProductFactory()
    ProductFactory(group=ProductGroupFactory())
    unreviewed = ProductFactory(is_reviewed=False)

    with caplog.at_level(logging.INFO, logger="products.tasks"):
        group_products()

    ungrouped.refresh_from_db()
    unreviewed.refresh_from_db()
    assert ungrouped.group is not None
    assert unreviewed.group is None

    record = summary(caplog)
    assert (record.new_group_count, record.skipped_count, record.failed_count) == (1, 1, 0)


def test_keeps_going_after_a_failure(
    mocker: MockerFixture, caplog: pytest.LogCaptureFixture
) -> None:
    ProductFactory.create_batch(2)
    mocker.patch(
        "products.tasks.productgroup_service.assign_product_to_group",
        side_effect=[RuntimeError("boom"), "joined"],
    )

    with caplog.at_level(logging.INFO, logger="products.tasks"):
        group_products()

    assert any(r.levelno == logging.ERROR and r.exc_info for r in caplog.records)
    record = summary(caplog)
    assert (record.joined_count, record.failed_count) == (1, 1)
