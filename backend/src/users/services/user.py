from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

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

    return user, access, refresh
