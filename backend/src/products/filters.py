from django.db.models import QuerySet
from django_filters import rest_framework as filters

from .models import Product


class ProductFilterSet(filters.FilterSet):
    has_discount = filters.BooleanFilter(method="filter_has_discount")

    class Meta:
        model = Product
        fields = {
            "name": ["icontains"],
            "brand": ["in"],
            "productdiscover__pharmacy": ["in"],
        }

    def filter_has_discount(self, queryset, name, value) -> QuerySet:
        """
        If value is True, return products with non-empty discount_price.
        If value is False, return products with empty discount_price.
        """
        if value:
            return queryset.exclude(discount_price="")
        return queryset.filter(discount_price="")
