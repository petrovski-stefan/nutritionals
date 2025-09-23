from django_filters import rest_framework as filters
from rest_framework.generics import ListAPIView

from .filters import ProductFilterSet
from .models import Product
from .serializers import ProductReadListSerializer


class ProductListAPIView(ListAPIView):
    serializer_class = ProductReadListSerializer
    queryset = Product.objects.all()
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = ProductFilterSet
