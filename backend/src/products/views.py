from django_filters import rest_framework as filters
from rest_framework.generics import ListAPIView

from .filters import ProductDeprecatedFilterSet
from .models import ProductDeprecated
from .serializers import (
    ProductDeprecatedBrandReadListSerializer,
    ProductDeprecatedReadListSerializer,
)
from .services import get_brands_with_product_count


class ProductDeprecatedListAPIView(ListAPIView):
    serializer_class = ProductDeprecatedReadListSerializer
    queryset = ProductDeprecated.objects.all()
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = ProductDeprecatedFilterSet


class ProductDeprecatedBrandListAPIView(ListAPIView):
    serializer_class = ProductDeprecatedBrandReadListSerializer

    def get_queryset(self):
        title_q = self.request.query_params.get("title") or ""

        return get_brands_with_product_count(title_q=title_q)
