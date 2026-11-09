import logging
import re
import time
import uuid
from collections.abc import Callable

from django.http import HttpRequest, HttpResponse

from .log import request_id_var

logger = logging.getLogger(__name__)

# nginx sends a 32 character hex $request_id. Anything else from a client is replaced
REQUEST_ID_RE = re.compile(r"[A-Za-z0-9-]{1,64}")


class RequestLogMiddleware:
    """
    Give each request an id that every log line written while handling it carries,
    send the id back in X-Request-ID, and log one line per request
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        incoming_id = request.headers.get("X-Request-ID", "")
        request_id = incoming_id if REQUEST_ID_RE.fullmatch(incoming_id) else uuid.uuid4().hex

        token = request_id_var.set(request_id)
        start = time.perf_counter()

        try:
            response = self.get_response(request)

            duration_ms = round((time.perf_counter() - start) * 1000)
            # DRF copies the authenticated user onto the Django request
            user_id = getattr(getattr(request, "user", None), "pk", None)

            logger.info(
                "%s %s %s %sms",
                request.method,
                request.path,
                response.status_code,
                duration_ms,
                extra={
                    "method": request.method,
                    "path": request.path,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                    "user_id": user_id,
                },
            )
            response["X-Request-ID"] = request_id

            return response
        finally:
            request_id_var.reset(token)
