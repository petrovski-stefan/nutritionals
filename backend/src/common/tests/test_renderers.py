import json

from rest_framework.response import Response

from common.renderers import StandardizedJSONRenderer


def render(data: object, status_code: int | None) -> bytes:
    context = {"response": Response(status=status_code)} if status_code else None

    return StandardizedJSONRenderer().render(data, renderer_context=context)


def test_wraps_success_data() -> None:
    body = json.loads(render({"id": 1}, 200))

    assert body == {"success": True, "data": {"id": 1}}


def test_wraps_success_list() -> None:
    body = json.loads(render([1, 2], 201))

    assert body == {"success": True, "data": [1, 2]}


def test_merges_error_payload() -> None:
    errors = {"type": "client_error", "errors": [{"code": "x", "detail": "y", "attr": None}]}

    body = json.loads(render(errors, 400))

    assert body == {"success": False, **errors}


def test_renders_no_content_as_empty_body() -> None:
    assert render(None, 204) == b""


def test_treats_missing_response_as_server_error() -> None:
    body = json.loads(render({"type": "server_error", "errors": []}, None))

    assert body["success"] is False
