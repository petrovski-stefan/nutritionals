from django.contrib.auth.models import User as UserType
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from products.models import Product

from .exceptions import (
    MyListNameByUserAlreadyExistsAPIException,
    ProductAlreadyExistsInMyListAPIException,
)
from .models import MyList, MyListItem


class MyListService:
    @staticmethod
    def list_mylists_by_user(*, user: UserType) -> QuerySet[MyList]:
        return user.mylist_set.all()

    @staticmethod
    def list_mylists_by_user_with_details(*, user: UserType) -> QuerySet[MyList]:
        return user.mylist_set.all()

    @staticmethod
    def create_mylist(*, name: str, user: UserType) -> MyList:
        if MyList.objects.filter(name=name, user=user).exists():
            raise MyListNameByUserAlreadyExistsAPIException

        return MyList.objects.create(name=name, user=user)


class MyListItemService:
    @staticmethod
    def create_mylistitem_in_mylist(
        *, mylist_id: int, product: Product, is_added_through_smart_search: bool = False
    ) -> None:
        mylist = get_object_or_404(MyList, id=mylist_id)

        if MyListItem.objects.filter(my_list=mylist, product=product).exists():
            raise ProductAlreadyExistsInMyListAPIException

        return MyListItem.objects.create(
            my_list=mylist,
            product=product,
            is_added_through_smart_search=is_added_through_smart_search,
        )

    @staticmethod
    def get_mylistitem_for_destroy(*, mylist_id: int, product_id: int) -> MyListItem:
        return get_object_or_404(
            MyListItem, product_id=product_id, my_list_id=mylist_id
        )
