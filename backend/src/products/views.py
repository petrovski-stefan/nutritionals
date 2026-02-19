from common.mixins import NoAuthMixin
from django.db.models import QuerySet
from rest_framework.generics import ListAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from . import filters
from .serializers import (
    BrandListSerializer,
    CategoryListSerializer,
    PharmacyListSerializer,
    ProductGroupListSerializer,
    ProductListSerializer,
    ProductSmartSearchInputSerializer,
)
from .services import brand as brand_service
from .services import category as category_service
from .services import pharmacy as pharmacy_service
from .services import product as product_service
from .services import productgroup as productgroup_service


class SearchProductListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = ProductListSerializer

    def get_queryset(self) -> QuerySet:
        q = self.request.query_params.get("q", None)

        return product_service.search_products(q=q)


class DiscountedProductListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = ProductListSerializer

    def get_queryset(self) -> QuerySet:
        return product_service.list_discounted_products()


class ProductSmartSearchAPIView(NoAuthMixin, APIView):
    def post(self, request: Request) -> Response:
        input_serializer = ProductSmartSearchInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        product_qs = product_service.get_smart_seached_products(
            validated_data=input_serializer.validated_data
        )

        return Response(ProductListSerializer(product_qs, many=True).data)


class BrandListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = BrandListSerializer

    def get_queryset(self) -> QuerySet:
        name = self.request.query_params.get("name", "")

        return brand_service.get_brands_with_product_count(name)


class PharmacyListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = PharmacyListSerializer

    def get_queryset(self) -> QuerySet:
        return pharmacy_service.list_pharmacies_with_product_stats()


class CategoryListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = CategoryListSerializer

    def get_queryset(self) -> QuerySet:
        return category_service.list_categories()


class ProductGroupListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = ProductGroupListSerializer

    filter_backends = [
        filters.filters.DjangoFilterBackend,
    ]
    filterset_class = filters.ProductGroupFilter

    def get_queryset(self) -> QuerySet:
        return productgroup_service.list_productgroups()
