from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def get_token_pair(user: User) -> tuple[str, str]:
    """Return a tuple of access token and refresh token as strings"""

    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    return str(access), str(refresh)
