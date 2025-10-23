from django.db.models import BooleanField, Case, Count, Q, Value, When

from .models import Brand


def get_brands_with_product_count(name: str):
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
