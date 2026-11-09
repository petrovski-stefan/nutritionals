from environ import Env

env = Env()

CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

CELERY_BROKER_URL = env("CELERY_BROKER_URL")
# CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND")
CELERY_TIMEZONE = "Europe/Berlin"

# Task events feed Flower. Without them it lists workers but no tasks
CELERY_WORKER_SEND_TASK_EVENTS = True
CELERY_TASK_SEND_SENT_EVENT = True
