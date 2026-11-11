import logging
import re

import pytest
from django.test import Client

from common.log import request_id_var

URL = "/api/v1/categories/"

pytestmark = pytest.mark.django_db


def test_generates_request_id_when_none_is_sent(client: Client) -> None:
    response = client.get(URL)

    assert re.fullmatch(r"[0-9a-f]{32}", response["X-Request-ID"])


def test_echoes_a_valid_incoming_request_id(client: Client) -> None:
    response = client.get(URL, headers={"X-Request-ID": "abc-123"})

    assert response["X-Request-ID"] == "abc-123"


@pytest.mark.parametrize("incoming", ["has spaces", "x" * 65, "semi;colon"])
def test_replaces_an_invalid_incoming_request_id(client: Client, incoming: str) -> None:
    response = client.get(URL, headers={"X-Request-ID": incoming})

    assert response["X-Request-ID"] != incoming
    assert re.fullmatch(r"[0-9a-f]{32}", response["X-Request-ID"])


def test_resets_the_request_id_after_the_request(client: Client) -> None:
    client.get(URL, headers={"X-Request-ID": "abc-123"})

    assert request_id_var.get() == "-"


def test_logs_one_line_per_request(client: Client, caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.INFO, logger="common.middleware"):
        client.get(URL)

    [record] = [r for r in caplog.records if r.name == "common.middleware"]
    assert record.method == "GET"
    assert record.path == URL
    assert record.status_code == 200
    assert record.user_id is None
