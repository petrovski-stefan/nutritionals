from django_filters import rest_framework as filters

from .models import Product


class ProductFilterSet(filters.FilterSet):
    # title = django_filters.CharFilter(field_name="title")
    # title__icontains = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = Product
        fields = {"title": ["icontains"]}
