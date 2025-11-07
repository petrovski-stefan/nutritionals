from django.db import transaction
from django.db.models import BooleanField, Case, Count, Q, QuerySet, Value, When
from django.shortcuts import get_object_or_404

from .exceptions import ProductIdQueryParamMissingError
from .models import Brand, Product, ProductCollection


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


class CollectionService:
    @staticmethod
    @transaction.atomic
    def add_product_to_collection(
        *, product_id: int | None, collection: ProductCollection
    ) -> ProductCollection:
        if not product_id:
            raise ProductIdQueryParamMissingError

        product = get_object_or_404(Product, pk=product_id)

        collection.products.add(product)

        return collection

    @staticmethod
    @transaction.atomic
    def remove_product_from_collection(
        *, product_id: int | None, collection: ProductCollection
    ) -> ProductCollection:
        if not product_id:
            raise ProductIdQueryParamMissingError

        product = get_object_or_404(Product, pk=product_id)

        collection.products.remove(product)

        return collection
