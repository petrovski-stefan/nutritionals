import logging
from typing import Literal

from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Q

from ..models import Product, ProductGroup
from . import productgroupcategory as productgroupcategory_service

logger = logging.getLogger(__name__)


SCORE_THRESHOLD = 0.7

GroupAssignment = Literal["skipped", "joined", "created"]


def assign_product_to_group(product: Product) -> GroupAssignment:  # complexipy: ignore
    """
    Put an ungrouped product in its best matching public group, or in a new group.
    Return "skipped" if it already had a group, else "joined" or "created"
    """

    if product.group is not None:
        return "skipped"

    product_brand_q = Q(brand=product.brand) if product.brand else Q(brand__isnull=True)
    product_category_ids = list(product.categories.values_list("id", flat=True))

    # Only public groups are candidates. Ties on score go to the group with
    # the most products, because candidates are scored in this order
    group_candidates = (
        ProductGroup.objects.public()
        .with_product_count()
        .filter(product_brand_q, product__categories__in=product_category_ids)
        .distinct()
        .order_by("-product_count")
    )

    best_group = None
    best_score = 0

    for group in group_candidates:
        pharmacy_count = group.product_set.public().filter(pharmacy=product.pharmacy).count()
        if pharmacy_count >= 2:
            continue

        for product_in_group in group.product_set.public().annotate(
            similarity=TrigramSimilarity("normalized_name", product.normalized_name)
        ):
            name_score = product_in_group.similarity
            form_with_count_score = (
                1 if product_in_group.form_with_count == product.form_with_count else 0
            )
            dosage_score = 1 if product_in_group.dosage == product.dosage else 0

            total_score = name_score * 0.8 + form_with_count_score * 0.15 + dosage_score * 0.05

            if total_score > best_score:
                best_score = total_score
                best_group = group

    outcome: GroupAssignment

    if best_group and best_score >= SCORE_THRESHOLD:
        product.group = best_group
        product.save(update_fields=["group", "updated_at"])

        logger.info(
            "Assigned (%s) %s to group (%s) %s with score %.3f",
            product.pk,
            product.name,
            best_group.pk,
            best_group.name,
            best_score,
            extra={
                "product_id": product.pk,
                "group_id": best_group.pk,
                "score": round(best_score, 3),
            },
        )

        outcome = "joined"

    else:
        new_group = ProductGroup.objects.create(name=product.name, brand=product.brand)
        product.group = new_group
        product.save(update_fields=["group", "updated_at"])

        logger.info(
            "Created group (%s) %s for product (%s) %s",
            new_group.pk,
            new_group.name,
            product.pk,
            product.name,
            extra={"product_id": product.pk, "group_id": new_group.pk},
        )

        best_group = new_group
        outcome = "created"

    productgroupcategory_service.assign_unique_categories_to_group(
        category_ids=product_category_ids, group=best_group
    )

    return outcome
