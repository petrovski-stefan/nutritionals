import logging
from contextvars import ContextVar

from celery import current_task

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")


class ContextFilter(logging.Filter):
    """Add the current request id and Celery task id to every record, "-" when there is none"""

    def filter(self, record: logging.LogRecord) -> bool:
        task_id = current_task.request.id if current_task else None

        record.__dict__.update(request_id=request_id_var.get(), task_id=task_id or "-")

        return True
