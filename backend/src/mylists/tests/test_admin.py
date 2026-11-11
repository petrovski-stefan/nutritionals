import pytest
from django.db.models import Model
from django.test import Client
from django.urls import reverse

from mylists.tests.factories import MyListItemFactory

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("action", ["changelist", "add", "change"])
def test_admin_pages_render(admin_client: Client, action: str) -> None:
    item = MyListItemFactory()
    objects: list[Model] = [item, item.mylist]

    for obj in objects:
        meta = obj._meta
        args = [obj.pk] if action == "change" else []
        url = reverse(f"admin:{meta.app_label}_{meta.model_name}_{action}", args=args)

        assert admin_client.get(url).status_code == 200, f"{meta.model_name} {action}"
