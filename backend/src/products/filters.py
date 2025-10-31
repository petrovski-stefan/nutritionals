from django.db.models import QuerySet
from django_filters import rest_framework as filters

from .models import Product


class ProductFilterSet(filters.FilterSet):
    LIMIT_CHOICES = (
        (10, "10"),
        (20, "20"),
        (50, "50"),
        (100, "100"),
    )

    limit = filters.ChoiceFilter(choices=LIMIT_CHOICES, method="filter_limit")
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

    def filter_limit(self, queryset, name, value) -> QuerySet:
        if value:
            return queryset[: int(value)]
        return queryset
