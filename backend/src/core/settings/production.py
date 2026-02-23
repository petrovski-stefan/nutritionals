from .django import *  # noqa
from datetime import timedelta

DEBUG = False

ALLOWED_HOSTS = env("DJANGO_ALLOWED_HOSTS", list)
CORS_ALLOWED_ORIGINS = env("DJANGO_CORS_ALLOWED_ORIGINS", list)


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=40),
}


STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR.parent / "staticfiles"  # app/staticfiles/

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR.parent / "mediafiles"  # app/mediafiles/
