from common.mixins import NoAuthMixin
from rest_framework.generics import CreateAPIView

from .serializers import UserRegisterSerializer
from .services import UserService


class UserRegisterAPIView(NoAuthMixin, CreateAPIView):
    serializer_class = UserRegisterSerializer

    def perform_create(self, serializer) -> None:
        user, token_pair = UserService.register_user(
            username=serializer.validated_data.get("username"),
            password=serializer.validated_data.get("password"),
        )

        serializer.instance = user
        serializer.context["token_pair"] = token_pair
