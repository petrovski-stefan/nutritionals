from rest_framework.generics import ListAPIView

from .models import Product
from .serializers import ProductReadListSerializer


class ProductListAPIView(ListAPIView):
    serializer_class = ProductReadListSerializer
    queryset = Product.objects.all()
