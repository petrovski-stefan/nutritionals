from .django import *  # noqa

DEBUG = False

ALLOWED_HOSTS = env("DJANGO_ALLOWED_HOSTS", list)
