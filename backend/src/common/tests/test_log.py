import logging
from types import SimpleNamespace

from pytest_mock import MockerFixture

from common.log import ContextFilter, request_id_var


def make_record() -> logging.LogRecord:
    return logging.LogRecord("test", logging.INFO, __file__, 1, "message", None, None)


def test_uses_dashes_outside_a_request_and_a_task() -> None:
    record = make_record()

    assert ContextFilter().filter(record) is True
    assert record.request_id == "-"
    assert record.task_id == "-"


def test_adds_the_current_request_id() -> None:
    record = make_record()
    token = request_id_var.set("req-1")

    try:
        ContextFilter().filter(record)
    finally:
        request_id_var.reset(token)

    assert record.request_id == "req-1"


def test_adds_the_current_task_id(mocker: MockerFixture) -> None:
    mocker.patch("common.log.current_task", SimpleNamespace(request=SimpleNamespace(id="task-1")))
    record = make_record()

    ContextFilter().filter(record)

    assert record.task_id == "task-1"
