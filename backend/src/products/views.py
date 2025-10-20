from django_filters import rest_framework as filters
from rest_framework.generics import ListAPIView

from .filters import ProductFilterSet
from .models import Pharmacy, Product
from .serializers import (
    BrandReadListSerializer,
    PharmacyReadListSerializer,
    ProductReadListSerializer,
)
from .services import get_brands_with_product_count


class ProductListAPIView(ListAPIView):
    serializer_class = ProductReadListSerializer
    queryset = Product.objects.select_related(
        "brand", "productdiscover", "productdiscover__pharmacy"
    ).only(
        "name",
        "price",
        "is_in_stock",
        "updated_at",
        "brand__name",
        "productdiscover__pharmacy__name",
        "productdiscover__pharmacy__logo",
        "productdiscover__url",
    )
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = ProductFilterSet


class BrandListAPIView(ListAPIView):
    serializer_class = BrandReadListSerializer

    def get_queryset(self):
        name = self.request.query_params.get("name", "")

        return get_brands_with_product_count(name)


class PharmacyListAPIView(ListAPIView):
    serializer_class = PharmacyReadListSerializer
    queryset = Pharmacy.objects.only("name", "homepage", "logo")
