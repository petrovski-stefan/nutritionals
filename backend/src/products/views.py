from django.db.models import BooleanField, Case, Count, Q, Value, When
from django_filters import rest_framework as filters
from rest_framework.generics import ListAPIView

from .filters import ProductFilterSet
from .models import Product
from .serializers import ProductBrandReadListSerializer, ProductReadListSerializer


class ProductListAPIView(ListAPIView):
    serializer_class = ProductReadListSerializer
    queryset = Product.objects.all()
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = ProductFilterSet


class ProductBrandListAPIView(ListAPIView):
    serializer_class = ProductBrandReadListSerializer

    def get_queryset(self):
        title_q = self.request.query_params.get("title") or ""

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
            .annotate(
                products_by_brand_count=Count("included", filter=Q(included=True))
            )
            .order_by("brand")
        )
