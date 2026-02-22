import logging
import re
from functools import reduce

from common.utils import transliterate_cyrillic_to_latin
from django.db.models import Count, Q, QuerySet

from ..models import Brand, Product

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


def get_normalized_brand_name(*, name: str | None) -> str:
    """Return lowercase, joined, latin brand name"""

    if not name:
        return ""

    latin_name = transliterate_cyrillic_to_latin(name)

    lowercase_latin_name = latin_name.lower()

    splitted = re.split(r"\s+", lowercase_latin_name)
    parsed_splitted = [s for s in splitted if s.strip()]

    return "".join(parsed_splitted)


def get_or_create_brand_by_name(*, name: str | None) -> Brand | None:
    """Get brand by normalized name or create it. Return None if no brand name"""

    if not name:
        return None

    normalized_name = get_normalized_brand_name(name=name)

    existing_brand = Brand.objects.filter(normalized_name=normalized_name).first()

    if existing_brand is None:
        brand = Brand.objects.create(name=name, normalized_name=normalized_name)
        logger.info(
            f"Created brand ({brand.pk}) {brand.name} - {brand.normalized_name}"
        )

        return brand

    logger.info(
        f"Loaded brand ({existing_brand.pk}) {existing_brand.name} - {existing_brand.normalized_name}"  # noqa
    )

    return existing_brand


def infer_brand_from_product_name(
    *, product_name: str | None, normalized_product_name: str | None
) -> Brand | None:
    """
    Infer brand name from the first 1-3 normalized words of a product name
    and return a Brand object if found.
    """

    if not product_name or not normalized_product_name:
        return None

    words = re.split(r"\s+", product_name.strip())
    if not words:
        return None

    candidates = [" ".join(words[:i]) for i in range(1, min(4, len(words) + 1))]
    normalized_candidates = [get_normalized_brand_name(name=c) for c in candidates]
    sorted_candidates = sorted(normalized_candidates, key=len, reverse=True)

    q_list = [Q(normalized_name=name) for name in sorted_candidates]
    q_filter = reduce(lambda a, b: a | b, q_list)

    brand = Brand.objects.filter(q_filter).first()
    if brand:
        logger.info(f"Inferred brand ({brand.pk}) {brand.name} from {product_name}")

        return brand

    candidate_to_return_brand = Product.objects.filter(
        is_reviewed=True, normalized_name=normalized_product_name, brand__isnull=False
    ).first()

    if candidate_to_return_brand:
        logger.info(
            f"Inferred brand ({brand.pk}) {brand.name} by normalized name from {candidate_to_return_brand.name}"  # noqa
        )
        return candidate_to_return_brand.brand

    return None
