import logging
import re
from functools import reduce

from common.utils import transliterate_cyrillic_to_latin
from django.db.models import Count, Q, QuerySet

from ..models import Brand

logger = logging.getLogger(__name__)


def get_brands_with_product_count(name: str) -> QuerySet[Brand]:
    """
    Return a queryset of brands annotated with the number of product groups
    matching the given name.
    """

    group_filter = Q()
    if name:
        group_filter = Q(productgroup__name__icontains=name)

    return (
        Brand.objects.annotate(product_count=Count("product", distinct=True))
        .filter(product_count__gt=0)
        .annotate(group_count=Count("productgroup", filter=group_filter, distinct=True))
        .values("id", "name", "group_count")
        .order_by("name")
    )


def get_or_create_brand_by_name(*, name: str | None) -> Brand | None:
    """Get or create brand by a name. Return None if no brand name"""

    if not name:
        return None

    brand, is_created = Brand.objects.get_or_create(name=name)

    log_action = "Created" if is_created else "Loaded"
    logger.info(f"{log_action} brand ({brand.pk}) {brand.name}")

    return brand


def infer_brand_from_product_name(product_name: str | None) -> Brand | None:
    """
    Infer the brand name by iexact match from the first 1-3 words of a product name
    and return a Brand object if found.
    """

    if not product_name:
        return None

    words = re.split(r"\s+", product_name.strip())
    if not words:
        return None

    candidates = [" ".join(words[:i]) for i in range(1, min(4, len(words) + 1))]
    latin_candidates = [transliterate_cyrillic_to_latin(c) for c in candidates]
    sorted_candidates = sorted(latin_candidates, key=len, reverse=True)

    q_list = [Q(name__iexact=name) for name in sorted_candidates]
    q_filter = reduce(lambda a, b: a | b, q_list)

    brand = Brand.objects.filter(q_filter).first()
    if brand:
        logger.info(f"Inferred brand ({brand.pk}) {brand.name} from {product_name}")

        return brand

    return None
