import logging

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from products.expressions import discount_percent
from products.models import Product

from .. import exceptions
from ..models import MyList, MyListItem

logger = logging.getLogger(__name__)

User = get_user_model()


@transaction.atomic
def create_mylistitem(
    *,
    user: User,
    mylist_id: int,
    product_id: int,
    is_added_through_smart_search: bool = False,
) -> MyListItem:
    mylist = get_object_or_404(MyList, id=mylist_id, user=user)
    product = get_object_or_404(Product, id=product_id)

    if MyListItem.objects.filter(mylist=mylist, product=product).exists():
        raise exceptions.ProductInMyListAlreadyExists

    mylistitem = MyListItem.objects.create(
        mylist=mylist,
        product=product,
        is_added_through_smart_search=is_added_through_smart_search,
    )

    mylist.save(update_fields=["updated_at"])

    logger.info(
        "Added (%s) %s to list (%s) %s",
        product.id,
        product.name,
        mylist.id,
        mylist.name,
        extra={"product_id": product.id, "mylist_id": mylist.id},
    )

    return mylistitem


def get_mylistitem(*, user: User, mylist_id: int, product_id: int) -> MyListItem:
    mylistitem = MyListItem.objects.filter(
        product_id=product_id, mylist_id=mylist_id, mylist__user=user
    ).first()

    if not mylistitem:
        raise exceptions.MyListItemNotFound

    return mylistitem


def list_mylistitems_with_discount_percent() -> QuerySet[MyListItem]:
    return (
        MyListItem.objects.select_related("product__pharmacy", "product__brand")
        .order_by("-updated_at")
        .annotate(product_discount_percent=discount_percent(prefix="product__"))
    )
