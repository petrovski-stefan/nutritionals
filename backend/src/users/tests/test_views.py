import logging

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from users.tests.factories import DEFAULT_PASSWORD, UserFactory

REGISTER_URL = "/api/v1/users/register/"
LOGIN_URL = "/api/v1/users/login/"
STRONG_PASSWORD = "Sup3r-Secret-Pass"

pytestmark = pytest.mark.django_db


def error_codes(response) -> set[tuple[str, str]]:
    """Return the (attr, code) pairs of a standardized error response"""

    return {(e["attr"], e["code"]) for e in response.json()["errors"]}


def register(api_client: APIClient, **overrides: str):
    payload = {
        "username": "newuser",
        "password": STRONG_PASSWORD,
        "confirm_password": STRONG_PASSWORD,
        **overrides,
    }

    return api_client.post(REGISTER_URL, payload, format="json")


class TestRegister:
    def test_creates_a_user_and_returns_tokens(self, api_client: APIClient) -> None:
        response = register(api_client)

        assert response.status_code == 201
        body = response.json()
        assert body["success"] is True
        assert body["data"]["username"] == "newuser"

        user = User.objects.get(username="newuser")
        assert user.check_password(STRONG_PASSWORD)
        assert AccessToken(body["data"]["access"])["user_id"] == user.pk

    def test_returned_token_authenticates(self, api_client: APIClient) -> None:
        access = register(api_client).json()["data"]["access"]

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        assert api_client.get("/api/v1/mylists/").status_code == 200

    def test_rejects_a_short_username(self, api_client: APIClient) -> None:
        response = register(api_client, username="abcd")

        assert response.status_code == 400
        assert error_codes(response) == {("username", "min_length")}

    def test_rejects_a_taken_username(self, api_client: APIClient) -> None:
        UserFactory(username="newuser")

        response = register(api_client)

        assert response.status_code == 400
        assert error_codes(response) == {("username", "invalid")}

    def test_rejects_mismatched_passwords(self, api_client: APIClient) -> None:
        response = register(api_client, confirm_password="Different-Pass-123")

        assert response.status_code == 400
        assert error_codes(response) == {("non_field_errors", "passwords_do_not_match")}

    @pytest.mark.parametrize(
        ("password", "code"),
        [
            ("password", "password_too_common"),
            ("Ab1-x", "password_too_short"),
            ("80934571826", "password_entirely_numeric"),
        ],
    )
    def test_rejects_a_weak_password(self, api_client: APIClient, password: str, code: str) -> None:
        response = register(api_client, password=password, confirm_password=password)

        assert response.status_code == 400
        assert ("password", code) in error_codes(response)
        assert not User.objects.filter(username="newuser").exists()


class TestLogin:
    def test_returns_a_token_pair(self, api_client: APIClient, user: User) -> None:
        response = api_client.post(
            LOGIN_URL, {"username": user.username, "password": DEFAULT_PASSWORD}, format="json"
        )

        assert response.status_code == 200
        data = response.json()["data"]
        assert set(data) == {"access", "refresh"}
        assert AccessToken(data["access"])["user_id"] == user.pk

    def test_rejects_wrong_credentials_and_logs_a_warning(
        self, api_client: APIClient, user: User, caplog: pytest.LogCaptureFixture
    ) -> None:
        with caplog.at_level(logging.WARNING, logger="users.views"):
            response = api_client.post(
                LOGIN_URL, {"username": user.username, "password": "wrong"}, format="json"
            )

        assert response.status_code == 401
        assert error_codes(response) == {(None, "no_active_account")}

        [record] = [r for r in caplog.records if r.name == "users.views"]
        assert record.levelno == logging.WARNING
        assert record.username == user.username

    def test_rejects_an_inactive_user(self, api_client: APIClient) -> None:
        user = UserFactory(is_active=False)

        response = api_client.post(
            LOGIN_URL, {"username": user.username, "password": DEFAULT_PASSWORD}, format="json"
        )

        assert response.status_code == 401
