import logging

from ..models import Product, ProductCategory
from . import category as category_service

logger = logging.getLogger(__name__)


def add_categories_to_product(*, categories: list[str], product: Product) -> None:

    if not categories:
        logger.debug("No categories to add to (%s) %s", product.id, product.name)

        return

    for c in categories:
        clean_c = c.strip()

        if ProductCategory.objects.filter(
            category__name=clean_c, product=product
        ).exists():
            logger.debug(
                "Category %s already exists in (%s) %s", clean_c, product.id, product.name
            )

            continue

        category = category_service.get_category_by_name(name=clean_c)
        if not category:
            logger.warning(
                "Category %r does not exist, not added to (%s) %s",
                clean_c,
                product.id,
                product.name,
                extra={"category": clean_c, "product_id": product.id},
            )

            continue

        ProductCategory.objects.create(product=product, category=category)

        logger.info(
            "Added category %s to (%s) %s",
            clean_c,
            product.id,
            product.name,
            extra={"category": clean_c, "product_id": product.id},
        )
