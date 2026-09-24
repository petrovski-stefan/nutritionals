import logging

from django.db.models import Count, QuerySet

from ..models import Category

logger = logging.getLogger(__name__)


AI_CATEGORY_CONFIDENCE = 0.8

CATCH_ALL_CATEGORY_NAME = "Друго"

MIN_CHIP_GROUP_COUNT = 3
MIN_CHIP_CATEGORIES = 2


def get_category_by_name(*, name: str | None) -> Category | None:
    """Return a category obj by name or None"""

    if not name:
        return None

    try:
        obj = Category.objects.get(name=name)

        logger.info(f"Found category ({obj.id}) {obj.name} by name")

        return obj
    except Category.DoesNotExist:
        logger.info(f"Category {name} does not exist")

        return None


def _filter_high_confidence_ai_categories(*, categories: list[dict]) -> list[dict]:
    """
    Filter category dict from AI if have confidence higher than AI_CATEGORY_CONFIDENCE
    """

    return [c for c in categories if c["confidence"] > AI_CATEGORY_CONFIDENCE]


def _get_categories_names(*, categories: list[dict]) -> list[str]:
    """Return just the name from each category dict"""

    return [c["name"] for c in categories]


def _clean_categories(*, categories: list[dict]) -> list[str]:
    high_confidence = _filter_high_confidence_ai_categories(categories=categories)

    return _get_categories_names(categories=high_confidence)


def get_unique_categories(
    *, ai_categories: list[dict], catalog_category: str | None
) -> list[str]:
    """
    Return a list of categories which represent union between AI categories
    and the catalog category if present
    """

    clean_ai_categories = _clean_categories(categories=ai_categories)

    if not clean_ai_categories and not catalog_category:
        return []

    if not catalog_category:
        return clean_ai_categories

    if not clean_ai_categories:
        return [catalog_category]

    unique_categories_set = {catalog_category, *clean_ai_categories}

    return list(unique_categories_set)


def list_categories() -> QuerySet[Category]:
    """Return category queryset ordered by name A-Z"""

    return Category.objects.order_by("name")


def list_category_names() -> list[str]:
    """Return category names ordered by name A-Z"""

    return list(list_categories().values_list("name", flat=True))


def list_categories_with_discounted_groups() -> QuerySet[Category]:
    """
    Return categories holding enough discounted groups to be worth a filter chip,
    ordered by group count. Returns nothing unless at least MIN_CHIP_CATEGORIES
    qualify, since a single chip next to "all" filters nothing.
    """

    qs = (
        Category.objects.filter(
            productgroup__is_reviewed=True,
            productgroup__product__is_reviewed=True,
            productgroup__product__discount_price__isnull=False,
        )
        .exclude(name=CATCH_ALL_CATEGORY_NAME)
        .annotate(group_count=Count("productgroup", distinct=True))
        .filter(group_count__gte=MIN_CHIP_GROUP_COUNT)
        .order_by("-group_count", "name")
    )

    if qs.count() < MIN_CHIP_CATEGORIES:
        return Category.objects.none()

    return qs
