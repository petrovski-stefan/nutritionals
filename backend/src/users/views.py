from common.mixins import NoAuthMixin
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserRegisterInputSerializer
from .use_cases import register_user


class UserRegisterAPIView(NoAuthMixin, APIView):
    def post(self, request: Request) -> Response:

        serializer = UserRegisterInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, access, refresh = register_user.execute(
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
