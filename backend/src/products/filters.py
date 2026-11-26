from django_filters import rest_framework as filters

from .models import ProductGroup


class ProductGroupFilter(filters.FilterSet):
    brand = filters.BaseInFilter(field_name="brand_id", lookup_expr="in")
    categories = filters.BaseInFilter(
        field_name="categories__id", lookup_expr="in", distinct=True
    )

    class Meta:
        model = ProductGroup
        fields = ["brand", "categories"]
