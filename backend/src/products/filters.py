from django_filters import rest_framework as filters

from .models import Product


class ProductFilterSet(filters.FilterSet):
    class Meta:
        model = Product
        fields = {
            "name": ["icontains"],
            "brand": ["in"],
            "productdiscover__pharmacy": ["in"],
        }
