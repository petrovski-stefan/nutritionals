import logging

from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Count, Prefetch, Q, QuerySet

from ..models import Product, ProductGroup
from . import product as product_service
from . import productgroupcategory as productgroupcategory_service

logger = logging.getLogger(__name__)


def list_productgroups() -> QuerySet:
    return (
        ProductGroup.objects.filter(is_reviewed=True)
        .annotate(product_count=Count("product"))
        .select_related("brand")
        .prefetch_related(
            Prefetch("product_set", queryset=product_service.base_products_qs())
        )
        .prefetch_related("categories")
        .order_by("-product_count")
    )


SCORE_THRESHOLD = 0.7


def assign_product_to_group(product: Product) -> None:  # noqa

    if product.group is not None:
        return

    product_brand_q = Q(brand=product.brand) if product.brand else Q(brand__isnull=True)
    product_category_ids = list(product.categories.values_list("id", flat=True))

    group_candidates = (
        list_productgroups()
        .filter(product_brand_q, product__categories__in=product_category_ids)
        .distinct()
    )

    best_group = None
    best_score = 0

    for group in group_candidates:
        pharmacy_count = group.product_set.filter(
            pharmacy=product.pharmacy, is_reviewed=True
        ).count()
        if pharmacy_count >= 2:
            continue

        for product_in_group in group.product_set.filter(is_reviewed=True).annotate(
            similarity=TrigramSimilarity("normalized_name", product.normalized_name)
        ):
            name_score = product_in_group.similarity
            form_with_count_score = (
                1 if product_in_group.form_with_count == product.form_with_count else 0
            )
            dosage_score = 1 if product_in_group.dosage == product.dosage else 0

            total_score = (
                name_score * 0.8 + form_with_count_score * 0.15 + dosage_score * 0.05
            )

            if total_score > best_score:
                best_score = total_score
                best_group = group

    if best_group and best_score >= SCORE_THRESHOLD:
        product.group = best_group
        product.save(update_fields=["group", "updated_at"])

        logger.info(
            f"Assigned {product.name} to group {best_group.name} with score {best_score}"
        )

    else:
        new_group = ProductGroup.objects.create(name=product.name, brand=product.brand)
        product.group = new_group
        product.save(update_fields=["group", "updated_at"])

        logger.info(f"Created group {new_group.name} for product {product.name}")

    productgroupcategory_service.assign_unique_categories_to_group(
        category_ids=product_category_ids, group=best_group
    )
