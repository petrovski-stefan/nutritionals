from common.mixins import NoAuthMixin
from django.db.models import QuerySet
from rest_framework.generics import ListAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from . import filters
from .pagination import ProductGroupPagePagination
from .serializers import (
    BrandListSerializer,
    CategoryListSerializer,
    DiscountedCategorySerializer,
    DiscountedProductGroupSerializer,
    DiscountedProductGroupsInputSerializer,
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


class DiscountedProductGroupListAPIView(NoAuthMixin, APIView):
    def get(self, request: Request) -> Response:
        input_serializer = DiscountedProductGroupsInputSerializer(
            data=request.query_params
        )
        input_serializer.is_valid(raise_exception=True)

        category = input_serializer.validated_data.get("category")

        group_qs = productgroup_service.list_discounted_groups(category=category)
        category_qs = category_service.list_categories_with_discounted_groups()

        return Response(
            {
                "categories": DiscountedCategorySerializer(category_qs, many=True).data,
                "results": DiscountedProductGroupSerializer(group_qs, many=True).data,
            }
        )


class SmartSearchAPIView(NoAuthMixin, APIView):
    def post(self, request: Request) -> Response:
        input_serializer = ProductSmartSearchInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        group_qs = productgroup_service.get_smart_searched_productgroups(
            validated_data=input_serializer.validated_data
        )

        return Response(ProductGroupListSerializer(group_qs, many=True).data)


class BrandListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = BrandListSerializer

    def get_queryset(self) -> QuerySet:
        return brand_service.list_brands()


class PharmacyListAPIView(NoAuthMixin, ListAPIView):
    serializer_class = PharmacyListSerializer

    def get_queryset(self) -> QuerySet:
        return pharmacy_service.list_pharmacies()


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

    pagination_class = ProductGroupPagePagination

    def get_queryset(self) -> QuerySet:
        q = self.request.query_params.get("q", None)

        return productgroup_service.list_productgroups(q=q)
