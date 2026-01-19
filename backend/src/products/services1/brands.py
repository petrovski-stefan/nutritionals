import logging

import openai
from django.conf import settings
from django.db.models import (
    BooleanField,
    Case,
    Count,
    Q,
    QuerySet,
    Value,
    When,
)
from django.utils import timezone

from ..models import Brand

logger = logging.getLogger(__name__)


def get_brands_with_product_count(name: str) -> QuerySet:
    return (
        Brand.objects.annotate(
            included=Case(
                When(product__name__icontains=name, then=Value(True)),
                default=Value(False),
                output_field=BooleanField(),
            )
        )
        .values("id", "name")
        .annotate(products_by_brand_count=Count("included", filter=Q(included=True)))
        .order_by("name")
    )


def get_or_create_brand_by_name(*, name: str | None) -> Brand | None:
    if not name:
        return None

    brand, is_created = Brand.objects.get_or_create(name=name)

    log_action = "created" if is_created else "loaded"
    logger.info(f"Succesfully {log_action} brand ({brand.pk}) {brand.name} ...")

    return brand
