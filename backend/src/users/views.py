import logging

from common.mixins import NoAuthMixin
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import UserRegisterInputSerializer
from .services import user as user_service

logger = logging.getLogger(__name__)


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


class UserLoginAPIView(TokenObtainPairView):
    """SimpleJWT's login view, plus a warning for each failed attempt"""

    def post(self, request: Request, *args, **kwargs) -> Response:
        try:
            return super().post(request, *args, **kwargs)
        except AuthenticationFailed:
            # SimpleJWT raises it only when the credentials match no active account
            username = request.data.get("username")
            logger.warning("Failed login for %r", username, extra={"username": username})

            raise
