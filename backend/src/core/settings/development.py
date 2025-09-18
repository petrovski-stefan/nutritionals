from datetime import timedelta

from .django import *

DEBUG = True

ALLOWED_HOSTS = []


INSTALLED_APPS += [
    "django_extensions",
    "silk",
]

MIDDLEWARE = [
    "silk.middleware.SilkyMiddleware",
] + MIDDLEWARE

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

CORS_ALLOW_ALL_ORIGINS = True

DRF_STANDARDIZED_ERRORS = {
    "ENABLE_IN_DEBUG_FOR_UNHANDLED_EXCEPTIONS": True,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=40),
}

# TODO: refactor
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR.parent / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR.parent / "mediafiles"
