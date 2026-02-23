from django.db.models import Count, Max, QuerySet, Sum

from ..models import Pharmacy


def _base_pharmacy_qs() -> QuerySet[Pharmacy]:
    """Return pharmacy queryset with name ordered A-Z"""

    return Pharmacy.objects.order_by("name")


def list_pharmacies_with_product_stats() -> QuerySet[Pharmacy]:
    """
    Return pharmacy queryset annotated with number products tracked
    and last scraped at timestamp
    """

    return (
        _base_pharmacy_qs()
        .annotate(num_products=Count("product"))
        .annotate(last_scraped_at=Max("product__last_scraped_at"))
    )


def with_catalog_counts(*, queryset: QuerySet[Pharmacy]) -> QuerySet[Pharmacy]:
    """Return pharmacy queryset annotated with catalog_count and total_pages_count"""

    return queryset.annotate(catalog_count=Count("pharmacycatalog")).annotate(
        total_pages_count=Sum("pharmacycatalog__max_pages")
    )
