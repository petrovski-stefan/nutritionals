import logging

from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Case, Max, QuerySet, Value, When
from django.db.models.functions import Greatest

from common.utils import transliterate_cyrillic_to_latin

from ..ai import smart_search as smart_search_ai
from ..expressions import public_product_q
from ..models import ProductGroup
from .productgroup import public_products_prefetch

logger = logging.getLogger(__name__)


def _get_smart_search_candidates(*, keywords: list[str]) -> QuerySet[ProductGroup]:
    """
    Return public groups holding a public product whose normalized name is similar to
    any keyword, most similar first. Product names are matched instead of group names
    because the keywords are English and most group names are Cyrillic
    """

    similarity_expressions = [TrigramSimilarity("product__normalized_name", kw) for kw in keywords]

    # Greatest requires at least 2 expressions
    if len(similarity_expressions) == 1:
        similarity_expressions.append(TrigramSimilarity("product__normalized_name", keywords[0]))

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
        .prefetch_related(public_products_prefetch(), "categories")
        .order_by(ai_rank)
    )
