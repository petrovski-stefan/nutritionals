import os

from celery import Celery
from celery.signals import setup_logging
from django.conf import settings
from django.utils.log import configure_logging

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.development")

app = Celery("core")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()


@setup_logging.connect
def use_django_logging(**kwargs) -> None:
    """
    Apply the LOGGING setting in the worker and beat. While a receiver is connected,
    Celery skips its own setup, which replaces the root handler and its format
    """

    configure_logging(settings.LOGGING_CONFIG, settings.LOGGING)
