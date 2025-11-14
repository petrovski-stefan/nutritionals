from common.mixins import JWTAuthMixin, NoAuthMixin
from django_filters import rest_framework as filters
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import ProductFilterSet
from .models import Pharmacy, Product, ProductCollection
from .serializers import (
    BrandReadListSerializer,
    PharmacyReadListSerializer,
    ProductCollectionCreateSerializer,
    ProductCollectionListSerializer,
    ProductCollectionRetrieveUpdateDestroySerializer,
    ProductReadListSerializer,
)
from .services import CollectionService, get_brands_with_product_count


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


class ProductCollectionListCreateAPIView(JWTAuthMixin, ListCreateAPIView):
    def get_serializer_class(self):  # noqa
        if self.request.method == "POST":
            return ProductCollectionCreateSerializer

        return ProductCollectionListSerializer

    def get_queryset(self):  # noqa
        return self.request.user.productcollection_set.all()

    def perform_create(self, serializer) -> None:
        product_collection = ProductCollection.objects.create(
            **serializer.validated_data, user=self.request.user
        )
        serializer.instance = product_collection


class ProductCollectionRetrieveUpdateDestroyAPIView(
    JWTAuthMixin, RetrieveUpdateDestroyAPIView
):
    serializer_class = ProductCollectionRetrieveUpdateDestroySerializer

    def get_queryset(self):  # noqa
        return self.request.user.productcollection_set.all()

    def perform_update(self, serializer) -> None:
        product_id = self.request.query_params.get("product_id", None)

        CollectionService.add_product_to_collection(
            product_id=product_id, collection=serializer.instance
        )

    def perform_destroy(self, instance) -> None:
        product_id = self.request.query_params.get("product_id", None)

        CollectionService.remove_product_from_collection(
            product_id=product_id, collection=instance
        )
