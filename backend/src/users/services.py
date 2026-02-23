from django.contrib.auth import get_user_model
from django.contrib.auth.models import User as UserType
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserService:
    @staticmethod
    @transaction.atomic
    def register_user(username: str, password: str) -> tuple[UserType, dict[str, str]]:
        user = UserService.create_user(username, password)
        token_pair = TokenService.get_token_pair(user)

        return user, token_pair

    @staticmethod
    def create_user(username: str, password: str) -> UserType:
        return User.objects.create_user(username=username, password=password)


class TokenService:
    @staticmethod
    def get_token_pair(user: UserType) -> dict[str, str]:
        """Return a dict with refresh and access token as strings"""

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return {"refresh": str(refresh), "access": str(access)}
