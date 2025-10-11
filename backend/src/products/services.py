import logging
from datetime import datetime

from django.db.models import BooleanField, Case, Count, Q, Value, When

from .models import Pharmacy, ProductDeprecated, ProductDiscover


def get_brands_with_product_count(*, title_q: str):
    return (
        ProductDeprecated.objects.exclude(brand="")
        .annotate(
            included=Case(
                When(title__icontains=title_q, then=Value(True)),
                default=Value(False),
                output_field=BooleanField(),
            )
        )
        .values("brand")
        .annotate(products_by_brand_count=Count("included", filter=Q(included=True)))
        .order_by("brand")
    )


def update_or_create_many_product_discovers(
    *,
    pharmacy: Pharmacy,
    run_started_at: datetime,
    product_urls: list[str],
    logger: logging.Logger | None = None,
) -> None:
    if len(product_urls) == 0:
        return

    for url in product_urls:
        ProductDiscover.objects.update_or_create(
            url=url,
            pharmacy=pharmacy,
            defaults={
                "is_active": True,
                "last_seen_at": run_started_at,
            },
            create_defaults={
                "is_active": True,
                "last_seen_at": run_started_at,
            },
        )


def update_all_product_discovers_status_by_run_started_at(
    *,
    pharmacy: Pharmacy,
    run_started_at: datetime,
    logger: logging.Logger | None = None,
):
    ProductDiscover.objects.filter(
        pharmacy=pharmacy, last_seen_at__lt=run_started_at
    ).update(is_active=False)
