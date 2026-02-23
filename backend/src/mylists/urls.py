from django.urls import path

from .views import (
    MyListListCreateAPIView,
    MyListProductsCreateAPIView,
    MyListProductsDestroyAPIView,
    MyListRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    path(
        "",
        MyListListCreateAPIView.as_view(),
    ),
    path(
        "<int:pk>/",
        MyListRetrieveUpdateDestroyAPIView.as_view(),
    ),
    path(
        "<int:pk>/products/",
        MyListProductsCreateAPIView.as_view(),
    ),
    path(
        "<int:pk>/products/<int:product_id>/",
        MyListProductsDestroyAPIView.as_view(),
    ),
]
