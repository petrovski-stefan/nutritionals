import logging
from collections import Counter

from celery import shared_task

from products.services import productgroup as productgroup_service

from .models import Product

logger = logging.getLogger(__name__)


@shared_task
def group_products() -> None:
    outcomes: Counter[str] = Counter()

    for p in Product.objects.public():
        try:
            outcome = productgroup_service.assign_product_to_group(p)
        except Exception:
            # One bad product must not stop the rest from being grouped
            logger.exception("Failed to group product (%s) %s", p.pk, p.name)
            outcomes["failed"] += 1

            continue

        outcomes[outcome] += 1

    logger.info(
        "Grouped products: %s joined a group, %s new groups, %s failed, %s already grouped",
        outcomes["joined"],
        outcomes["created"],
        outcomes["failed"],
        outcomes["skipped"],
    )
