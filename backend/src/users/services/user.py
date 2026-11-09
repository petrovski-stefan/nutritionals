import logging
from typing import TYPE_CHECKING

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

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


def create_user(username: str, password: str) -> User:
    # NOTE: Possible race condition, IntegrityError should be handled

    return User.objects.create_user(username=username, password=password)


def register_user(*, username: str, password: str) -> tuple[User, str, str]:
    """Create a user and return it with its access and refresh tokens"""

    user = create_user(username, password)
    access, refresh = get_token_pair(user)

    logger.info("Registered user (%s) %s", user.pk, user.username, extra={"user_id": user.pk})

    return user, access, refresh
