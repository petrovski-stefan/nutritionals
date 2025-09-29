from django_filters import rest_framework as filters
from rest_framework.generics import ListAPIView

from .filters import ProductFilterSet
from .models import Product
from .serializers import ProductBrandReadListSerializer, ProductReadListSerializer
from .services import get_brands_with_product_count


class ProductListAPIView(ListAPIView):
    serializer_class = ProductReadListSerializer
    queryset = Product.objects.all()
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = ProductFilterSet


class ProductBrandListAPIView(ListAPIView):
    serializer_class = ProductBrandReadListSerializer

    def get_queryset(self):
        title_q = self.request.query_params.get("title") or ""

        return get_brands_with_product_count(title_q=title_q)
