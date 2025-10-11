from django.urls import path

from .views import ProductDeprecatedBrandListAPIView, ProductDeprecatedListAPIView

urlpatterns = [
    path("", view=ProductDeprecatedListAPIView.as_view(), name="product-list"),
    path(
        "brands/", view=ProductDeprecatedBrandListAPIView.as_view(), name="product-list"
    ),
]
