import logging

from rest_framework.renderers import JSONRenderer

api_logger = logging.getLogger("API")


def _get_api_log_string(
    *,
    request_method: str,
    request_path: str,
    status_code: int | str,
    is_authenticated: bool,
    success: bool,
    error: str | None = None,
) -> str:
    if success:
        return f"{request_method}: {request_path} - {status_code} - Auth: {is_authenticated}"

    return f"{request_method}: {request_path} - {status_code} - {error} - Auth: {is_authenticated}"


class StandardizedJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None) -> bytes:
        request_obj = renderer_context.get("request")
        response_obj = renderer_context.get("response")

        status_code = response_obj.status_code if response_obj else 500
        request_method = request_obj.method if request_obj else "UNKNOWN"
        request_path = request_obj.get_full_path() if request_obj else "<unknown>"
        is_authenticated = (
            getattr(request_obj.user, "is_authenticated", False)
            if request_obj
            else False
        )

        response = {
            "status": 200 <= status_code < 300,
            "code": status_code,
        }
        if data and "errors" in data:
            response["errors_type"] = data["type"]
            response["errors"] = data["errors"]
            response["data"] = None

            api_log = _get_api_log_string(
                request_method=request_method,
                request_path=request_path,
                status_code=status_code,
                is_authenticated=is_authenticated,
                success=False,
                error=response["errors_type"],  # type: ignore
            )

            if status_code < 500:
                api_logger.warning(api_log)
            else:
                api_logger.error(api_log)
        else:
            response["data"] = data

            api_logger.info(
                _get_api_log_string(
                    request_method=request_method,
                    request_path=request_path,
                    status_code=status_code,
                    is_authenticated=is_authenticated,
                    success=True,
                )
            )

        return super(StandardizedJSONRenderer, self).render(
            response, accepted_media_type, renderer_context
        )
