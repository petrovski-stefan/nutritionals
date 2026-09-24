import logging

from common.utils import transliterate_cyrillic_to_latin
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import (
    Count,
    F,
    Max,
    Min,
    Prefetch,
    Q,
    QuerySet,
    Subquery,
)
from django.db.models.functions import Coalesce, Greatest, Round

from ..ai import smart_search as smart_search_ai
from ..models import Category, Product, ProductGroup, ProductGroupCategory
from . import product as product_service
from . import productgroupcategory as productgroupcategory_service

logger = logging.getLogger(__name__)


def list_productgroups(*, q: str | None = None) -> QuerySet:
    base_qs = ProductGroup.objects.filter(is_reviewed=True)

    if q:
        matching_products_qs = product_service.search_products(
            q=q,
            has_limit=False,
        ).values("pk")

        base_qs = base_qs.filter(product__in=Subquery(matching_products_qs)).distinct()

    return (
        base_qs.annotate(product_count=Count("product", distinct=True))
        .select_related("brand")
        .prefetch_related(
            Prefetch(
                "product_set",
                queryset=product_service.base_products_qs(),
            )
        )
        .prefetch_related("categories")
        .order_by("-product_count")
    )


DISCOUNTED_GROUPS_LIMIT = 12


def list_discounted_groups(
    *, category: Category | None = None
) -> QuerySet[ProductGroup]:
    """
    Return the groups with the best member discount, annotated with the best discount
    percent, the lowest current price and the total number of offers
    """

    discounted = Q(product__is_reviewed=True, product__discount_price__isnull=False)
    reviewed = Q(product__is_reviewed=True)

    qs = (
        ProductGroup.objects.filter(is_reviewed=True)
        .annotate(
            best_discount_percent=Max(
                Round((1 - F("product__discount_price") / F("product__price")) * 100),
                filter=discounted,
            ),
            lowest_price=Min(
                Coalesce("product__discount_price", "product__price"), filter=reviewed
            ),
            offer_count=Count("product", distinct=True, filter=reviewed),
        )
        .filter(best_discount_percent__isnull=False)
    )

    if category is not None:
        # Filter through a subquery instead of joining categories, so the annotations
        # above are not computed over a product x category cartesian product
        qs = qs.filter(
            id__in=ProductGroupCategory.objects.filter(category=category).values(
                "group_id"
            )
        )

    return (
        qs.select_related("brand")
        .prefetch_related(
            Prefetch("product_set", queryset=product_service.base_products_qs())
        )
        .order_by("-best_discount_percent", "-lowest_price")[:DISCOUNTED_GROUPS_LIMIT]
    )


def _get_smart_search_candidates(*, keywords: list[str]) -> QuerySet[Product]:
    """
    Return smart search group queryset candidates by taking the greatest similarity
    from the keywords per product
    """

    similarity_expressions = [TrigramSimilarity("name", kw) for kw in keywords]

    # Greatest requires at least 2 expressions
    if len(similarity_expressions) == 1:
        similarity_expressions.append(TrigramSimilarity("name", keywords[0]))

    return (
        list_productgroups()
        .annotate(similarity=Greatest(*similarity_expressions))
        .filter(similarity__gt=0.15)
        .order_by("-similarity")
    )


def get_smart_searched_productgroups(*, query: str) -> QuerySet[ProductGroup]:
    """Return smart searched product group queryset, ordered by the best AI rank
    of any member product
    """

    latin_query = transliterate_cyrillic_to_latin(query)

    supplement_keywords = smart_search_ai.convert_query_to_tags(latin_query=latin_query)

    if not supplement_keywords:
        return ProductGroup.objects.none()

    candidates = _get_smart_search_candidates(keywords=supplement_keywords)

    candidates_list = list(candidates.values("id", "name")[:200])

    ai_product_ids = smart_search_ai.smart_search(
        latin_query=latin_query, candidates=candidates_list
    )

    return list_productgroups().filter(id__in=ai_product_ids)


SCORE_THRESHOLD = 0.7


def assign_product_to_group(product: Product) -> None:

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

        best_group = new_group

    productgroupcategory_service.assign_unique_categories_to_group(
        category_ids=product_category_ids, group=best_group
    )


def filter_by_category_count(
    *, queryset: QuerySet[ProductGroup], category_count: int
) -> QuerySet[ProductGroup]:
    """Filter by exact number of annotated _category_count"""

    return queryset.annotate(_category_count=Count("categories", distinct=True)).filter(
        _category_count=category_count
    )
