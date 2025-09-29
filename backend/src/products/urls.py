from django.urls import path

from .views import ProductBrandListAPIView, ProductListAPIView

urlpatterns = [
    path("", view=ProductListAPIView.as_view(), name="product-list"),
    path("brands/", view=ProductBrandListAPIView.as_view(), name="product-list"),
]
