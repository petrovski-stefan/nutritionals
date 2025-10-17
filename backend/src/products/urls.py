from django.urls import path

from .views import BrandListAPIView, PharmacyListAPIView, ProductListAPIView

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
]
