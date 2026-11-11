from typing import NoReturn

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from users.tests.factories import UserFactory


def _fail_external_call(*args: object, **kwargs: object) -> NoReturn:
    raise RuntimeError(
        "A test made a real OpenAI or HTTP call. Mock it, e.g. with mocker.patch(...)"
    )


@pytest.fixture(autouse=True)
def _block_external_calls(monkeypatch: pytest.MonkeyPatch) -> None:
    """
    Fail any test that reaches OpenAI or the network. Tests that need a response
    patch the call site with mocker, which takes precedence over this
    """

    monkeypatch.setattr("integrations.openai.client.responses.parse", _fail_external_call)
    monkeypatch.setattr("requests.sessions.Session.request", _fail_external_call)


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(db: None) -> User:
    return UserFactory.create()


@pytest.fixture
def auth_client(user: User) -> APIClient:
    """An APIClient that sends a real access token for `user`"""

    client = APIClient()
    access = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    return client
