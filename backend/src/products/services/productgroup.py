import logging
from typing import Literal

from common.utils import transliterate_cyrillic_to_latin
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import (
    Case,
    Count,
    Max,
    Min,
    Prefetch,
    Q,
    QuerySet,
    Subquery,
    Value,
    When,
)
from django.db.models.functions import Coalesce, Greatest

from ..ai import smart_search as smart_search_ai
from ..expressions import discount_percent, public_product_q, search_match_score
from ..models import Category, Product, ProductGroup, ProductGroupCategory
from . import product as product_service
from . import productgroupcategory as productgroupcategory_service

logger = logging.getLogger(__name__)


def _public_products_prefetch() -> Prefetch:
    """Prefetch the public products of each group, as ProductListSerializer reads them"""

    return Prefetch(
        "product_set",
        queryset=Product.objects.public()
        .with_discount_percent()
        .select_related("pharmacy", "brand"),
    )


def list_productgroups(*, q: str | None = None) -> QuerySet[ProductGroup]:
    """
    Return public groups for the group list endpoint, ordered by product count, then id.
    With a non-blank q, keep only the groups holding a public product that matches q,
    ordered by their best matching product, then by how many products match
    """

    qs = ProductGroup.objects.public()
    # id breaks ties, so a group can't move between pages from one request to the next
    ordering = ["-product_count", "id"]

    if q and q.strip():
        latin_q = product_service.normalize_search_query(q=q)
        matching_products_qs = product_service.list_matching_products(
            latin_q=latin_q
        ).values("pk")

        # Annotations after this filter cover only the matching products,
        # so product_count counts matches and the score is the best match
        qs = (
            qs.filter(product__in=Subquery(matching_products_qs))
            .distinct()
            .annotate(
                best_match_score=Max(search_match_score(latin_q=latin_q, prefix="product__"))
            )
        )
        ordering = ["-best_match_score", "-product_count", "id"]

    return (
        qs.with_product_count()
        .select_related("brand")
        .prefetch_related(_public_products_prefetch(), "categories")
        .order_by(*ordering)
    )


DISCOUNTED_GROUPS_LIMIT = 12


def list_discounted_groups(
    *, category: Category | None = None
) -> QuerySet[ProductGroup]:
    """
    Return the groups with the best member discount, annotated with the best discount
    percent, the lowest current price and the total number of offers
    """

    public = public_product_q(prefix="product__")
    discounted = public & Q(product__discount_price__isnull=False)

    qs = (
        ProductGroup.objects.public()
        .annotate(
            best_discount_percent=Max(
                discount_percent(prefix="product__"), filter=discounted
            ),
            lowest_price=Min(
                Coalesce("product__discount_price", "product__price"), filter=public
            ),
            offer_count=Count("product", distinct=True, filter=public),
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
        .prefetch_related(_public_products_prefetch())
        .order_by("-best_discount_percent", "-lowest_price")[:DISCOUNTED_GROUPS_LIMIT]
    )


def _get_smart_search_candidates(*, keywords: list[str]) -> QuerySet[ProductGroup]:
    """
    Return public groups holding a public product whose normalized name is similar to
    any keyword, most similar first. Product names are matched instead of group names
    because the keywords are English and most group names are Cyrillic
    """

    similarity_expressions = [
        TrigramSimilarity("product__normalized_name", kw) for kw in keywords
    ]

    # Greatest requires at least 2 expressions
    if len(similarity_expressions) == 1:
        similarity_expressions.append(
            TrigramSimilarity("product__normalized_name", keywords[0])
        )

    # Filtering on product before annotating limits the Max to public products
    return (
        ProductGroup.objects.public()
        .filter(public_product_q(prefix="product__"))
        .annotate(similarity=Max(Greatest(*similarity_expressions)))
        .filter(similarity__gt=0.15)
        .order_by("-similarity", "id")
    )


def get_smart_searched_productgroups(*, query: str) -> QuerySet[ProductGroup]:
    """Return smart searched public groups in the order the AI ranked them"""

    # The serializer requires at least 3 characters, so this is never None
    latin_query = transliterate_cyrillic_to_latin(query) or ""

    supplement_keywords = smart_search_ai.convert_query_to_tags(latin_query=latin_query)

    # Queries are anonymous. The cut keeps a pasted wall of text out of the logs
    logged_query = query[:100]

    if not supplement_keywords:
        logger.info(
            "Smart search %r: no supplement keywords",
            logged_query,
            extra={"query": logged_query, "keyword_count": 0},
        )

        return ProductGroup.objects.none()

    candidates = _get_smart_search_candidates(keywords=supplement_keywords)

    candidates_list = list(candidates.values("id", "name")[:200])
    candidate_ids = {c["id"] for c in candidates_list}

    ai_ranked_ids = smart_search_ai.smart_search(
        latin_query=latin_query, candidates=candidates_list
    )

    # Keep the AI order, drop repeats and ids that were not offered as candidates
    ranked_group_ids = list(dict.fromkeys(i for i in ai_ranked_ids if i in candidate_ids))

    logger.info(
        "Smart search %r: %s keywords, %s candidates, AI returned %s ids, kept %s",
        logged_query,
        len(supplement_keywords),
        len(candidates_list),
        len(ai_ranked_ids),
        len(ranked_group_ids),
        extra={
            "query": logged_query,
            "keywords": supplement_keywords,
            "keyword_count": len(supplement_keywords),
            "candidate_count": len(candidates_list),
            "ai_id_count": len(ai_ranked_ids),
            "kept_count": len(ranked_group_ids),
        },
    )

    if not ranked_group_ids:
        return ProductGroup.objects.none()

    ai_rank = Case(
        *[When(id=group_id, then=Value(rank)) for rank, group_id in enumerate(ranked_group_ids)]
    )

    return (
        ProductGroup.objects.public()
        .filter(id__in=ranked_group_ids)
        .select_related("brand")
        .prefetch_related(_public_products_prefetch(), "categories")
        .order_by(ai_rank)
    )


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
        pharmacy_count = (
            group.product_set.public().filter(pharmacy=product.pharmacy).count()
        )
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

            total_score = (
                name_score * 0.8 + form_with_count_score * 0.15 + dosage_score * 0.05
            )

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


def filter_by_category_count(
    *, queryset: QuerySet[ProductGroup], category_count: int
) -> QuerySet[ProductGroup]:
    """Filter by exact number of annotated _category_count"""

    return queryset.annotate(_category_count=Count("categories", distinct=True)).filter(
        _category_count=category_count
    )
