from django_filters import rest_framework as filters

from .models import Product


class ProductFilterSet(filters.FilterSet):
    class Meta:
        model = Product
        fields = {
            "title": ["icontains"],
            "brand": ["in"],
            "pharmacy": ["in"],
        }
