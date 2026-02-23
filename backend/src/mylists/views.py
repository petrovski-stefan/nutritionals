from common.mixins import JWTAuthMixin
from django.db.models import QuerySet
from rest_framework import generics

from .models import MyList, MyListItem
from .serializers import (
    MyListCreateSerializer,
    MyListItemCreateSerializer,
    MyListListSerializer,
    MyListRetrieveSerializer,
    MyListUpdateSerializer,
)
from .services import mylist as mylist_service
from .services import mylistitem as mylistitem_service


class MyListListCreateAPIView(JWTAuthMixin, generics.ListCreateAPIView):
    def get_queryset(self) -> QuerySet[MyList]:
        return mylist_service.list_mylists_by_user(
            user=self.request.user, include_products=False
        )

    def get_serializer_class(self):  # noqa
        if self.request.method == "POST":
            return MyListCreateSerializer
        elif self.request.method == "GET":
            return MyListListSerializer

    def perform_create(self, serializer) -> None:
        serializer.instance = mylist_service.create_mylist(
            user=self.request.user, name=serializer.validated_data.get("name")
        )


class MyListRetrieveUpdateDestroyAPIView(
    JWTAuthMixin, generics.RetrieveUpdateDestroyAPIView
):
    def get_queryset(self) -> QuerySet[MyList]:
        return mylist_service.list_mylists_by_user(
            user=self.request.user, include_products=True
        )

    def get_serializer_class(self):  # noqa
        if self.request.method == "GET":
            return MyListRetrieveSerializer
        elif self.request.method == "PUT":
            return MyListUpdateSerializer


class MyListProductsCreateAPIView(JWTAuthMixin, generics.CreateAPIView):
    serializer_class = MyListItemCreateSerializer

    def perform_create(self, serializer) -> None:
        instance = mylistitem_service.create_mylistitem(
            mylist_id=self.kwargs["pk"], **serializer.validated_data
        )
        serializer.instance = instance


class MyListProductsDestroyAPIView(JWTAuthMixin, generics.DestroyAPIView):
    def get_object(self) -> MyListItem:
        return mylistitem_service.get_mylistitem(
            mylist_id=self.kwargs["pk"], product_id=self.kwargs["product_id"]
        )
