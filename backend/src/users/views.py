from common.mixins import NoAuthMixin
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserRegisterInputSerializer
from .services import user as user_service


class UserRegisterAPIView(NoAuthMixin, APIView):
    def post(self, request: Request) -> Response:

        serializer = UserRegisterInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, access, refresh = user_service.register_user(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        return Response(
            data={
                "username": user.username,
                "access": access,
                "refresh": refresh,
            },
            status=status.HTTP_201_CREATED,
        )
