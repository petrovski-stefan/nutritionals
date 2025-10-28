from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTAuthMixin:
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


class OptionalJWTAuthentication(JWTAuthentication):
    def authenticate(self, request) -> tuple | None:
        if "HTTP_AUTHORIZATION" in request.META:
            return super().authenticate(request)

        return None


class OptionalAuthMixin:
    authentication_classes = [OptionalJWTAuthentication]  # type: ignore[var-annotated]
    permission_classes = [AllowAny]


class NoAuthMixin:
    authentication_classes = []  # type: ignore[var-annotated]
    permission_classes = [AllowAny]
