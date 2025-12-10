from common.mixins import NoAuthMixin
from django_filters import rest_framework as filters
from rest_framework.generics import (
    ListAPIView,
)
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import ProductFilterSet
from .models import Pharmacy, Product
from .serializers import (
    BrandReadListSerializer,
    PharmacyReadListSerializer,
    ProductReadListSerializer,
)
from .services import get_brands_with_product_count


class ProductListAPIView(NoAuthMixin, ListAPIView):
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


class ProductSmartSearchAPIView(NoAuthMixin, APIView):
    def post(self, request: Request) -> Response:
        search_query = request.data.get("search_query", None)

        sample_products = Product.objects.all()[:5]

        return Response(ProductReadListSerializer(sample_products, many=True).data)


class BrandListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = BrandReadListSerializer

    def get_queryset(self):
        name = self.request.query_params.get("name", "")

        return get_brands_with_product_count(name)


class PharmacyListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = PharmacyReadListSerializer
    queryset = Pharmacy.objects.only("name", "homepage", "logo")
