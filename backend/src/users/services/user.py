import logging
from typing import TYPE_CHECKING

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework_simplejwt.tokens import RefreshToken

from .. import exceptions

logger = logging.getLogger(__name__)

# mypy can't use the get_user_model() result as a type. The project uses the default model
if TYPE_CHECKING:
    from django.contrib.auth.models import User
else:
    User = get_user_model()


def get_token_pair(user: User) -> tuple[str, str]:
    """Return a tuple of access token and refresh token as strings"""

    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    return str(access), str(refresh)


def create_user(*, username: str, password: str) -> User:
    """
    Create a user. Raise UsernameTakenAPIError if the username exists, which the unique
    constraint decides, so two concurrent registrations can't both pass a lookup
    """

    try:
        # The savepoint keeps an outer transaction usable after the IntegrityError
        with transaction.atomic():
            return User.objects.create_user(username=username, password=password)
    except IntegrityError as e:
        logger.info("Username %r is taken", username, extra={"username": username})

        raise exceptions.UsernameTakenAPIError from e


def register_user(*, username: str, password: str) -> tuple[User, str, str]:
    """Create a user and return it with its access and refresh tokens"""

    user = create_user(username=username, password=password)
    access, refresh = get_token_pair(user)

    logger.info("Registered user (%s) %s", user.pk, user.username, extra={"user_id": user.pk})

    return user, access, refresh
