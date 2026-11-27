from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Q, QuerySet

from common.utils import transliterate_cyrillic_to_latin

from .. import exceptions
from ..expressions import product_search_text
from ..models import Product


def normalize_search_query(*, q: str) -> str:
    """
    Return q stripped and transliterated to latin, the form product names are
    normalized to. Raise if q is empty or too short
    """

    stripped_q = q.strip()

    if not stripped_q:
        raise exceptions.ProductSearchQueryEmptyAPIError

    # A non-empty string never transliterates to None, the `or ""` only narrows the type
    latin_q = transliterate_cyrillic_to_latin(stripped_q) or ""

    if len(latin_q) < 2:
        raise exceptions.ProductSearchQueryShortAPIError

    return latin_q


def list_matching_products(*, latin_q: str) -> QuerySet[Product]:
    """
    Return every public product matching latin_q by its normalized name, or by its
    brand and normalized name together, unordered. Get latin_q from
    normalize_search_query
    """

    queryset = Product.objects.public().annotate(search_text=product_search_text())
    q_len = len(latin_q)

    if q_len <= 4:
        return queryset.filter(search_text__icontains=latin_q)

    queryset = queryset.annotate(
        name_similarity=TrigramSimilarity("normalized_name", latin_q),
        text_similarity=TrigramSimilarity("search_text", latin_q),
    )
    is_similar = Q(name_similarity__gt=0.1) | Q(text_similarity__gt=0.1)

    if q_len <= 15:
        return queryset.filter(is_similar | Q(search_text__icontains=latin_q))

    # Long query
    return queryset.filter(is_similar)
