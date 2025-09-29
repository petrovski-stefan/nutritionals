from django.db.models import BooleanField, Case, Count, Q, Value, When

from .models import Product


def get_brands_with_product_count(*, title_q: str):
    return (
        Product.objects.exclude(brand="")
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
