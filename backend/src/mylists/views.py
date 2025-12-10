from common.mixins import JWTAuthMixin
from rest_framework import generics

from .serializers import (
    MyListCreateSerializer,
    MyListItemCreateSerializer,
    MyListListSerializer,
    MyListRetrieveSerializer,
    MyListUpdateSerializer,
)
from .services import MyListItemService, MyListService


class MyListListCreateAPIView(JWTAuthMixin, generics.ListCreateAPIView):
    def get_queryset(self):
        return MyListService.list_mylists_by_user(user=self.request.user)

    def get_serializer_class(self):  # noqa
        if self.request.method == "POST":
            return MyListCreateSerializer
        elif self.request.method == "GET":
            return MyListListSerializer

    def perform_create(self, serializer):
        serializer.instance = MyListService.create_mylist(
            user=self.request.user, name=serializer.validated_data.get("name")
        )


class MyListRetrieveUpdateDestroyAPIView(
    JWTAuthMixin, generics.RetrieveUpdateDestroyAPIView
):
    def get_queryset(self):
        return MyListService.list_mylists_by_user(user=self.request.user)

    def get_serializer_class(self):  # noqa
        if self.request.method == "GET":
            return MyListRetrieveSerializer
        elif self.request.method == "PUT":
            return MyListUpdateSerializer


class MyListProductsCreateAPIView(JWTAuthMixin, generics.CreateAPIView):
    serializer_class = MyListItemCreateSerializer

    def perform_create(self, serializer):
        MyListItemService.create_mylistitem_in_mylist(
            mylist_id=self.kwargs["pk"], **serializer.validated_data
        )


class MyListProductsDestroyAPIView(JWTAuthMixin, generics.DestroyAPIView):
    def get_object(self):
        return MyListItemService.get_mylistitem_for_destroy(
            mylist_id=self.kwargs["pk"], product_id=self.kwargs["product_id"]
        )
