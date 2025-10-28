from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView

from .views import UserRegisterAPIView

urlpatterns = [
    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login",
    ),
    path(
        "register/",
        UserRegisterAPIView.as_view(),
        name="register",
    ),
]
