from .celery import *
from .django import *

# The default hasher is slow on purpose, which only slows tests down
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# A task queued with .delay() runs in the test process instead of needing a broker
CELERY_BROKER_URL = "memory://"
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# The admin pages render static asset URLs
STATIC_URL = "/static/"

# template0 records no collation version, so creating the test database still works on a
# volume whose template1 was made under an older glibc than the postgres image ships now
DATABASES["default"]["TEST"] = {"TEMPLATE": "template0"}
