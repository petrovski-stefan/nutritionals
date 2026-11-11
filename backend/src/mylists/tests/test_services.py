import pytest
from django.contrib.auth.models import User

from mylists import exceptions
from mylists.services import mylist as mylist_service
from mylists.services import mylistitem as mylistitem_service
from mylists.tests.factories import MyListFactory, MyListItemFactory
from products.tests.factories import ProductFactory

pytestmark = pytest.mark.django_db


def test_create_mylist_rejects_a_duplicate_name(user: User) -> None:
    MyListFactory(user=user, name="Vitamins")

    with pytest.raises(exceptions.MyListNameByUserAlreadyExist):
        mylist_service.create_mylist(user=user, name="Vitamins")


def test_update_mylist_writes_updated_at(user: User) -> None:
    mylist = MyListFactory(user=user, name="Old")
    before = mylist.updated_at

    mylist_service.update_mylist(mylist=mylist, name="New")

    mylist.refresh_from_db()
    assert mylist.name == "New"
    assert mylist.updated_at > before


def test_list_mylists_with_items_by_user_prefetches_items_newest_first(user: User) -> None:
    mylist = MyListFactory(user=user)
    first = MyListItemFactory(mylist=mylist)
    second = MyListItemFactory(mylist=mylist)
    MyListFactory()

    [fetched] = mylist_service.list_mylists_with_items_by_user(user=user)

    assert list(fetched.mylistitem_set.all()) == [second, first]


def test_create_mylistitem_rejects_a_duplicate(user: User) -> None:
    mylist = MyListFactory(user=user)
    product = ProductFactory()
    mylistitem_service.create_mylistitem(user=user, mylist_id=mylist.pk, product_id=product.pk)

    with pytest.raises(exceptions.ProductInMyListAlreadyExists):
        mylistitem_service.create_mylistitem(user=user, mylist_id=mylist.pk, product_id=product.pk)


def test_get_mylistitem_ignores_other_users_lists(user: User) -> None:
    item = MyListItemFactory()

    with pytest.raises(exceptions.MyListItemNotFound):
        mylistitem_service.get_mylistitem(
            user=user, mylist_id=item.mylist_id, product_id=item.product_id
        )
