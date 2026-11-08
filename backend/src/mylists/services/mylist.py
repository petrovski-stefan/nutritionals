from django.contrib.auth import get_user_model
from django.db.models import Count, Prefetch, QuerySet

from .. import exceptions
from ..models import MyList
from . import mylistitem as mylistitem_service

User = get_user_model()


def list_mylists_by_user(*, user: User) -> QuerySet[MyList]:
    """Return the user's lists annotated with items_count, most recently updated first"""

    return (
        MyList.objects.filter(user=user)
        .only("name", "created_at", "updated_at")
        .annotate(items_count=Count("products"))
        .order_by("-updated_at")
    )


def list_mylists_with_items_by_user(*, user: User) -> QuerySet[MyList]:
    """Return the user's lists with their items and the items' products prefetched"""

    mylistitem_qs = mylistitem_service.list_mylistitems_with_discount_percent()

    return MyList.objects.filter(user=user).prefetch_related(
        Prefetch("mylistitem_set", queryset=mylistitem_qs)
    )


def create_mylist(*, name: str, user: User) -> MyList:
    if MyList.objects.filter(name=name, user=user).exists():
        raise exceptions.MyListNameByUserAlreadyExist

    return MyList.objects.create(name=name, user=user)


def update_mylist(*, mylist: MyList, name: str) -> MyList:
    if MyList.objects.filter(name=name, user=mylist.user).exclude(pk=mylist.pk).exists():
        raise exceptions.MyListNameByUserAlreadyExist

    mylist.name = name
    # updated_at is auto_now — it only gets written when listed in update_fields
    mylist.save(update_fields=["name", "updated_at"])

    return mylist
