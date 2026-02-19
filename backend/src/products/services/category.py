import logging

from django.db.models import QuerySet

from ..models import Category

logger = logging.getLogger(__name__)


OPENAI_CATEGORY_PRECISION = 0.7


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


def _check_openai_category_structure(category: dict) -> bool:
    """Return True if name exists as string, and precision as number [0,1], in the category"""

    if "name" not in category:
        return False

    if "precision" not in category:
        return False

    if not isinstance(category["name"], str):
        return False

    if not isinstance(category["precision"], (int, float)):
        return False

    if category["precision"] < 0 or category["precision"] > 1:
        return False

    return True


def _validate_openai_categories(*, categories: list[dict]) -> list[dict]:
    """Return only categories which fit the format {name:str, precision:float}"""

    return [c for c in categories if _check_openai_category_structure(category=c)]


def _filter_high_precision_openai_categories(*, categories: list[dict]) -> list[dict]:
    """
    Filter category dict from OpenAI if have precision higher than OPENAI_CATEGORY_PRECISION
    """

    return [c for c in categories if c["precision"] > OPENAI_CATEGORY_PRECISION]


def _normalize_openai_categories(*, categories: list[str]) -> list[str]:
    """Strip and capitilize each category name in the list"""

    return [c.strip().capitalize() for c in categories]


def _get_categories_names(*, categories: list[dict]) -> list[str]:
    """Return just the name from each category dict"""

    return [c["name"] for c in categories]


def _clean_categories(*, categories: list[dict]) -> list[str]:
    valid = _validate_openai_categories(categories=categories)
    high_precision = _filter_high_precision_openai_categories(categories=valid)
    categories_names = _get_categories_names(categories=high_precision)
    normalized = _normalize_openai_categories(categories=categories_names)

    return normalized


def get_unique_categories(
    *, openai_categories: list[dict], catalog_category: str | None
) -> list[str]:
    """
    Return a list of categories which represent union between OpenAI categories
    and the catalog category if present
    """

    clean_openai_categories = _clean_categories(categories=openai_categories)

    if not clean_openai_categories and not catalog_category:
        return []

    if not catalog_category:
        return clean_openai_categories

    if not clean_openai_categories:
        return [catalog_category]

    unique_categories_set = {catalog_category, *clean_openai_categories}

    return list(unique_categories_set)


def list_categories() -> QuerySet[Category]:
    """Return category queryset ordered by name A-Z"""

    return Category.objects.order_by("name")
