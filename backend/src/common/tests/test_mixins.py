import pytest
from django.contrib.auth.models import User
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory
from rest_framework_simplejwt.tokens import RefreshToken

from common.mixins import OptionalJWTAuthentication


def make_request(**headers: str) -> Request:
    return Request(APIRequestFactory().get("/", **headers))


def test_optional_auth_skips_requests_without_a_header() -> None:
    assert OptionalJWTAuthentication().authenticate(make_request()) is None


@pytest.mark.django_db
def test_optional_auth_authenticates_a_valid_token(user: User) -> None:
    access = RefreshToken.for_user(user).access_token
    request = make_request(HTTP_AUTHORIZATION=f"Bearer {access}")

    result = OptionalJWTAuthentication().authenticate(request)

    assert result is not None
    assert result[0] == user
