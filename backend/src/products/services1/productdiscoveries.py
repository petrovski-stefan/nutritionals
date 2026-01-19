import logging

import openai
from django.conf import settings
from django.db.models import (
    BooleanField,
    Case,
    Count,
    Q,
    QuerySet,
    Value,
    When,
)
from django.utils import timezone

from ..models import Brand

logger = logging.getLogger(__name__)
