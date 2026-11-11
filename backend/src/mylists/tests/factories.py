import factory
from factory.django import DjangoModelFactory

from mylists.models import MyList, MyListItem
from products.tests.factories import ProductFactory
from users.tests.factories import UserFactory


class MyListFactory(DjangoModelFactory[MyList]):
    class Meta:
        model = MyList

    name = factory.Sequence(lambda n: f"List {n}")
    user = factory.SubFactory(UserFactory)


class MyListItemFactory(DjangoModelFactory[MyListItem]):
    class Meta:
        model = MyListItem

    product = factory.SubFactory(ProductFactory)
    mylist = factory.SubFactory(MyListFactory)
