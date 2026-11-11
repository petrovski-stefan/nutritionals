import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from mylists.models import MyList, MyListItem
from mylists.tests.factories import MyListFactory, MyListItemFactory
from products.tests.factories import BrandFactory, ProductFactory

LIST_URL = "/api/v1/mylists/"

pytestmark = pytest.mark.django_db


def detail_url(mylist: MyList) -> str:
    return f"{LIST_URL}{mylist.pk}/"


def products_url(mylist: MyList) -> str:
    return f"{LIST_URL}{mylist.pk}/products/"


def product_url(mylist: MyList, product_id: int) -> str:
    return f"{LIST_URL}{mylist.pk}/products/{product_id}/"


def error_codes(response) -> set[str]:
    return {e["code"] for e in response.json()["errors"]}


@pytest.mark.parametrize(
    ("method", "url"),
    [
        ("get", LIST_URL),
        ("post", LIST_URL),
        ("get", f"{LIST_URL}1/"),
        ("put", f"{LIST_URL}1/"),
        ("delete", f"{LIST_URL}1/"),
        ("post", f"{LIST_URL}1/products/"),
        ("delete", f"{LIST_URL}1/products/1/"),
    ],
)
def test_requires_authentication(api_client: APIClient, method: str, url: str) -> None:
    response = getattr(api_client, method)(url)

    assert response.status_code == 401
    assert error_codes(response) == {"not_authenticated"}


class TestList:
    def test_lists_only_own_lists_most_recently_updated_first(
        self, auth_client: APIClient, user: User
    ) -> None:
        older = MyListFactory(user=user, name="Older")
        newer = MyListFactory(user=user, name="Newer")
        MyListFactory(name="Someone else's")
        MyListItemFactory.create_batch(2, mylist=older)
        newer.save()  # bumps updated_at past older's

        response = auth_client.get(LIST_URL)

        assert response.status_code == 200
        data = response.json()["data"]
        assert [(d["name"], d["items_count"]) for d in data] == [("Newer", 0), ("Older", 2)]
        assert set(data[0]) == {"id", "name", "items_count", "created_at", "updated_at"}


class TestCreate:
    def test_creates_a_list(self, auth_client: APIClient, user: User) -> None:
        response = auth_client.post(LIST_URL, {"name": "Vitamins"}, format="json")

        assert response.status_code == 201
        data = response.json()["data"]
        assert data["name"] == "Vitamins"
        assert data["items_count"] == 0
        assert MyList.objects.get(pk=data["id"]).user == user

    def test_rejects_a_duplicate_name(self, auth_client: APIClient, user: User) -> None:
        MyListFactory(user=user, name="Vitamins")

        response = auth_client.post(LIST_URL, {"name": "Vitamins"}, format="json")

        assert response.status_code == 400
        assert error_codes(response) == {"unique_together_name_user"}

    def test_allows_a_name_another_user_has(self, auth_client: APIClient) -> None:
        MyListFactory(name="Vitamins")

        response = auth_client.post(LIST_URL, {"name": "Vitamins"}, format="json")

        assert response.status_code == 201

    def test_rejects_a_blank_name(self, auth_client: APIClient) -> None:
        response = auth_client.post(LIST_URL, {"name": ""}, format="json")

        assert response.status_code == 400
        assert error_codes(response) == {"blank"}


class TestRetrieve:
    def test_returns_items_with_product_details(self, auth_client: APIClient, user: User) -> None:
        mylist = MyListFactory(user=user)
        product = ProductFactory(price=500.0, discount_price=400.0, brand=BrandFactory())
        MyListItemFactory(mylist=mylist, product=product, is_added_through_smart_search=True)

        response = auth_client.get(detail_url(mylist))

        assert response.status_code == 200
        [item] = response.json()["data"]["items"]
        assert item["product_id"] == product.pk
        assert item["product_name"] == product.name
        assert item["product_price"] == 500.0
        assert item["product_discount_price"] == 400.0
        assert item["product_discount_percent"] == 20.0
        assert item["product_brand_name"] == product.brand.name
        assert item["product_pharmacy_name"] == product.pharmacy.name
        assert item["is_added_through_smart_search"] is True

    def test_returns_null_discount_and_brand_when_missing(
        self, auth_client: APIClient, user: User
    ) -> None:
        mylist = MyListFactory(user=user)
        MyListItemFactory(mylist=mylist, product=ProductFactory(discount_price=None, brand=None))

        [item] = auth_client.get(detail_url(mylist)).json()["data"]["items"]

        assert item["product_discount_percent"] is None
        assert item["product_brand_name"] is None

    def test_hides_another_users_list(self, auth_client: APIClient) -> None:
        response = auth_client.get(detail_url(MyListFactory()))

        assert response.status_code == 404


class TestUpdate:
    def test_renames_the_list(self, auth_client: APIClient, user: User) -> None:
        mylist = MyListFactory(user=user, name="Old")

        response = auth_client.put(detail_url(mylist), {"name": "New"}, format="json")

        assert response.status_code == 200
        assert response.json()["data"]["name"] == "New"
        mylist.refresh_from_db()
        assert mylist.name == "New"

    def test_keeps_its_own_name(self, auth_client: APIClient, user: User) -> None:
        mylist = MyListFactory(user=user, name="Same")

        response = auth_client.put(detail_url(mylist), {"name": "Same"}, format="json")

        assert response.status_code == 200

    def test_rejects_the_name_of_another_own_list(self, auth_client: APIClient, user: User) -> None:
        MyListFactory(user=user, name="Taken")
        mylist = MyListFactory(user=user, name="Mine")

        response = auth_client.put(detail_url(mylist), {"name": "Taken"}, format="json")

        assert response.status_code == 400
        assert error_codes(response) == {"unique_together_name_user"}

    def test_rejects_patch(self, auth_client: APIClient, user: User) -> None:
        mylist = MyListFactory(user=user, name="Old")

        response = auth_client.patch(detail_url(mylist), {"name": "New"}, format="json")

        assert response.status_code == 405
        assert error_codes(response) == {"method_not_allowed"}
        mylist.refresh_from_db()
        assert mylist.name == "Old"

    def test_options_lists_the_allowed_methods(self, auth_client: APIClient, user: User) -> None:
        response = auth_client.options(detail_url(MyListFactory(user=user)))

        assert response.status_code == 200
        assert "PATCH" not in response["Allow"]
        assert {"GET", "PUT", "DELETE"} <= set(response["Allow"].split(", "))

    def test_cannot_rename_another_users_list(self, auth_client: APIClient) -> None:
        response = auth_client.put(detail_url(MyListFactory()), {"name": "Mine"}, format="json")

        assert response.status_code == 404


class TestDelete:
    def test_deletes_the_list_and_its_items(self, auth_client: APIClient, user: User) -> None:
        mylist = MyListFactory(user=user)
        MyListItemFactory(mylist=mylist)

        response = auth_client.delete(detail_url(mylist))

        assert response.status_code == 204
        assert response.content == b""
        assert not MyList.objects.filter(pk=mylist.pk).exists()
        assert not MyListItem.objects.exists()

    def test_cannot_delete_another_users_list(self, auth_client: APIClient) -> None:
        mylist = MyListFactory()

        response = auth_client.delete(detail_url(mylist))

        assert response.status_code == 404
        assert MyList.objects.filter(pk=mylist.pk).exists()


class TestAddProduct:
    def test_adds_the_product(self, auth_client: APIClient, user: User) -> None:
        mylist = MyListFactory(user=user)
        product = ProductFactory()

        response = auth_client.post(
            products_url(mylist),
            {"product_id": product.pk, "is_added_through_smart_search": True},
            format="json",
        )

        assert response.status_code == 201
        assert response.json()["data"] == {"is_added_through_smart_search": True}
        item = MyListItem.objects.get(mylist=mylist)
        assert item.product == product
        assert item.is_added_through_smart_search is True

    def test_bumps_the_lists_updated_at(self, auth_client: APIClient, user: User) -> None:
        mylist = MyListFactory(user=user)
        before = mylist.updated_at

        auth_client.post(products_url(mylist), {"product_id": ProductFactory().pk}, format="json")

        mylist.refresh_from_db()
        assert mylist.updated_at > before

    def test_rejects_a_product_already_in_the_list(
        self, auth_client: APIClient, user: User
    ) -> None:
        item = MyListItemFactory(mylist=MyListFactory(user=user))

        response = auth_client.post(
            products_url(item.mylist), {"product_id": item.product_id}, format="json"
        )

        assert response.status_code == 400
        assert error_codes(response) == {"unique_together_product_mylist"}

    def test_rejects_an_unknown_product(self, auth_client: APIClient, user: User) -> None:
        response = auth_client.post(
            products_url(MyListFactory(user=user)), {"product_id": 999_999}, format="json"
        )

        assert response.status_code == 404

    def test_cannot_add_to_another_users_list(self, auth_client: APIClient) -> None:
        response = auth_client.post(
            products_url(MyListFactory()), {"product_id": ProductFactory().pk}, format="json"
        )

        assert response.status_code == 404
        assert not MyListItem.objects.exists()


class TestRemoveProduct:
    def test_removes_the_product(self, auth_client: APIClient, user: User) -> None:
        item = MyListItemFactory(mylist=MyListFactory(user=user))

        response = auth_client.delete(product_url(item.mylist, item.product_id))

        assert response.status_code == 204
        assert not MyListItem.objects.filter(pk=item.pk).exists()

    def test_returns_404_for_a_product_not_in_the_list(
        self, auth_client: APIClient, user: User
    ) -> None:
        mylist = MyListFactory(user=user)

        response = auth_client.delete(product_url(mylist, ProductFactory().pk))

        assert response.status_code == 404
        assert error_codes(response) == {"mylistitem_not_found"}

    def test_cannot_remove_from_another_users_list(self, auth_client: APIClient) -> None:
        item = MyListItemFactory()

        response = auth_client.delete(product_url(item.mylist, item.product_id))

        assert response.status_code == 404
        assert MyListItem.objects.filter(pk=item.pk).exists()
