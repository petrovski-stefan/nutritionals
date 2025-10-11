from django_filters import rest_framework as filters

from .models import ProductDeprecated


class ProductDeprecatedFilterSet(filters.FilterSet):
    class Meta:
        model = ProductDeprecated
        fields = {
            "title": ["icontains"],
            "brand": ["in"],
            "pharmacy": ["in"],
        }
