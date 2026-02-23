import logging

from ..models import Product, ProductCategory
from . import category as category_service

logger = logging.getLogger(__name__)


def add_categories_to_product(*, categories: list[str], product: Product) -> None:

    if not categories:
        logger.info(f"No categories to add to ({product.id}) {product.name}")

        return

    for c in categories:
        clean_c = c.strip()

        if ProductCategory.objects.filter(
            category__name=clean_c, product=product
        ).exists():
            logger.info(
                f"Category {clean_c} already exists in ({product.id}) {product.name}"
            )

            continue

        category = category_service.get_category_by_name(name=c)
        if not category:
            continue

        ProductCategory.objects.create(product=product, category=category)

        logger.info(f"Added category {clean_c} to ({product.id}) {product.name}")
