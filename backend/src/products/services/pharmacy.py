from datetime import datetime

from django.db.models import Count, Max, Q, QuerySet, Sum

from ..models import Pharmacy, PharmacyCatalog


def _base_pharmacy_qs() -> QuerySet[Pharmacy]:
    """Return pharmacy queryset with name ordered A-Z"""

    return Pharmacy.objects.order_by("name")


def list_pharmacies() -> QuerySet[Pharmacy]:
    """
    Return pharmacy queryset annotated with number products tracked
    and last scraped at timestamp
    """

    return (
        _base_pharmacy_qs()
        .annotate(num_products=Count("product"))
        .annotate(last_scraped_at=Max("product__last_scraped_at"))
    )


def list_stale_pharmacies(*, scraped_before: datetime) -> list[tuple[str, datetime | None]]:
    """
    Return (name, last_scraped_at) of each pharmacy with an active catalog whose newest
    product scrape is older than scraped_before, or that has no scraped product at all,
    ordered by name
    """

    active_catalog_pharmacy_ids = PharmacyCatalog.objects.filter(is_active=True).values(
        "pharmacy_id"
    )

    return list(
        Pharmacy.objects.filter(pk__in=active_catalog_pharmacy_ids)
        .annotate(last_scraped_at=Max("product__last_scraped_at"))
        .filter(Q(last_scraped_at__lt=scraped_before) | Q(last_scraped_at__isnull=True))
        .order_by("name")
        .values_list("name", "last_scraped_at")
    )


def with_catalog_counts(*, queryset: QuerySet[Pharmacy]) -> QuerySet[Pharmacy]:
    """Return pharmacy queryset annotated with catalog_count and total_pages_count"""

    return queryset.annotate(catalog_count=Count("pharmacycatalog")).annotate(
        total_pages_count=Sum("pharmacycatalog__max_pages")
    )
