from django.urls import path

from .views import UserLoginAPIView, UserRegisterAPIView

urlpatterns = [
    path(
        "login/",
        UserLoginAPIView.as_view(),
        name="login",
    ),
    path(
        "register/",
        UserRegisterAPIView.as_view(),
        name="register",
    ),
]
