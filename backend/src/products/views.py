from common.mixins import NoAuthMixin
from django.db.models import QuerySet
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
    ProductSmartSearchInputSerializer,
)
from .services import BrandService, ProductService


class ProductListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = ProductReadListSerializer
    queryset = Product.objects.select_related(
        "brand", "productdiscover", "productdiscover__pharmacy"
    ).only(
        "name",
        "price",
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
        input_serializer = ProductSmartSearchInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        product_qs = ProductService.get_smart_seached_products(
            input_serializer.validated_data.get("query")
        )

        return Response(ProductReadListSerializer(product_qs, many=True).data)


class BrandListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = BrandReadListSerializer

    def get_queryset(self) -> QuerySet:
        name = self.request.query_params.get("name", "")

        return BrandService.get_brands_with_product_count(name)


class PharmacyListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = PharmacyReadListSerializer
    queryset = Pharmacy.objects.only("name", "homepage", "logo")
