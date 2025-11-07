from django.urls import path

from .views import (
    BrandListAPIView,
    PharmacyListAPIView,
    ProductCollectionListCreateAPIView,
    ProductCollectionRetrieveUpdateDestroyAPIView,
    ProductListAPIView,
)

urlpatterns = [
    path(
        "",
        view=ProductListAPIView.as_view(),
        name="product-list",
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
        "collections/",
        view=ProductCollectionListCreateAPIView.as_view(),
        name="collection-list-create",
    ),
    path(
        "collections/<int:pk>/",
        view=ProductCollectionRetrieveUpdateDestroyAPIView.as_view(),
        name="collection-retrieve-update-destroy",
    ),
]
