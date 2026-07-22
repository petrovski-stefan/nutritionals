from django.contrib.auth import get_user_model

from ..services import token as token_service
from ..services import user as user_service

User = get_user_model()


def execute(username: str, password: str) -> tuple[User, str, str]:
    user = user_service.create_user(username, password)
    access, refresh = token_service.get_token_pair(user)

    return user, access, refresh
