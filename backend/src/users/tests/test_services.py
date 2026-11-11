import pytest
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from users.services import user as user_service

pytestmark = pytest.mark.django_db


def test_register_user_creates_a_user_with_a_hashed_password() -> None:
    user, _, _ = user_service.register_user(username="someone", password="Pass-1234-x")

    assert user.pk is not None
    assert user.password != "Pass-1234-x"
    assert user.check_password("Pass-1234-x")


def test_register_user_returns_tokens_for_the_user() -> None:
    user, access, refresh = user_service.register_user(username="someone", password="Pass-12-x")

    assert AccessToken(access)["user_id"] == user.pk
    assert RefreshToken(refresh)["user_id"] == user.pk
