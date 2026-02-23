from django.contrib.auth.models import User as UserType
from django.db.models import Count, Prefetch, QuerySet

from .. import exceptions
from ..models import MyList
from . import mylistitem as mylistitem_service


def list_mylists_by_user(*, user: UserType, include_products: bool) -> QuerySet[MyList]:

    base_qs = MyList.objects.filter(user=user).order_by("-updated_at")

    if not include_products:
        return base_qs.only("name", "created_at", "updated_at").annotate(
            items_count=Count("products")
        )

    mylistitem_qs = mylistitem_service.list_mylistitems_with_discount_percent()
    return base_qs.prefetch_related(Prefetch("mylistitem_set", queryset=mylistitem_qs))


def create_mylist(*, name: str, user: UserType) -> MyList:
    if MyList.objects.filter(name=name, user=user).exists():
        raise exceptions.MyListNameByUserAlreadyExist

    return MyList.objects.create(name=name, user=user)
