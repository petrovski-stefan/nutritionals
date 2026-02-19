import logging

from django.db import transaction
from django.db.models import F, QuerySet
from django.db.models.functions import Round
from django.shortcuts import get_object_or_404
from products.models import Product

from .. import exceptions
from ..models import MyList, MyListItem

logger = logging.getLogger(__name__)


@transaction.atomic
def create_mylistitem(
    *, mylist_id: int, product_id: int, is_added_through_smart_search: bool = False
) -> MyListItem:
    mylist = get_object_or_404(MyList, id=mylist_id)
    product = get_object_or_404(Product, id=product_id)

    if MyListItem.objects.filter(mylist=mylist, product=product).exists():
        logger.warning(
            f"({product.id}) {product.name} already exists in ({mylist.id}) {mylist.name}"
        )
        raise exceptions.ProductInMyListAlreadyExists

    mylistitem = MyListItem.objects.create(
        mylist=mylist,
        product=product,
        is_added_through_smart_search=is_added_through_smart_search,
    )

    mylist.save(update_fields=["updated_at"])

    logger.info(f"Added ({product.id}) {product.name} to ({mylist.id}) {mylist.name}")

    return mylistitem


def get_mylistitem(
    *, mylist_id: int, product_id: int, raise_api_error: bool = True
) -> MyListItem | None:
    mylistitem = MyListItem.objects.filter(
        product_id=product_id, mylist_id=mylist_id
    ).first()

    if not mylistitem:
        logger.warning(
            f"MyListItem of mylist ({mylist_id}) and ({product_id}) not found"
        )

        if raise_api_error:
            raise exceptions.MyListItemNotFound

    return mylistitem


def list_mylistitems_with_discount_percent() -> QuerySet[MyListItem]:
    return (
        MyListItem.objects.select_related("product__pharmacy", "product__brand")
        .order_by("-updated_at")
        .annotate(
            product_discount_percent=Round(
                (1 - F("product__discount_price") / F("product__price")) * 100
            )
        )
    )
