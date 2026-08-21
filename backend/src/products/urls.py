from django.urls import path

from .views import (
    BrandListAPIView,
    CategoryListAPIView,
    DiscountedProductGroupListAPIView,
    PharmacyListAPIView,
    ProductGroupListAPIView,
    SearchProductListAPIView,
    SmartSearchAPIView,
)

urlpatterns = [
    path(
        "products/search/",
        view=SearchProductListAPIView.as_view(),
        name="search-product-list",
    ),
    path(
        "products/smart-search/",
        view=SmartSearchAPIView.as_view(),
        name="product-smart-search",
    ),
    path(
        "product-groups/",
        view=ProductGroupListAPIView.as_view(),
        name="productgroup-list",
    ),
    path(
        "product-groups/discounted/",
        view=DiscountedProductGroupListAPIView.as_view(),
        name="discounted-productgroup-list",
    ),
    path(
        "brands/",
        view=BrandListAPIView.as_view(),
        name="brand-list",
    ),
    path(
        "pharmacies/",
        view=PharmacyListAPIView.as_view(),
        name="pharmacy-list",
    ),
    path(
        "categories/",
        view=CategoryListAPIView.as_view(),
        name="category-list",
    ),
]
