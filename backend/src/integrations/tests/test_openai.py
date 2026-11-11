import json
import logging
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from openai import OpenAIError
from pydantic import BaseModel, ValidationError
from pytest_mock import MockerFixture

from integrations import openai as openai_integration
from integrations.openai import AIResponseError, get_response


class Answer(BaseModel):
    value: int


def make_response(parsed: Answer | None, *, with_usage: bool = True) -> SimpleNamespace:
    usage = SimpleNamespace(
        input_tokens=10,
        input_tokens_details=SimpleNamespace(cached_tokens=4),
        output_tokens=3,
    )

    return SimpleNamespace(
        id="resp_1",
        model="gpt-test",
        output_parsed=parsed,
        usage=usage if with_usage else None,
    )


@pytest.fixture
def parse(mocker: MockerFixture) -> MagicMock:
    return mocker.patch.object(openai_integration.client.responses, "parse")


def test_returns_the_parsed_output_and_logs_usage(
    parse: MagicMock, caplog: pytest.LogCaptureFixture
) -> None:
    parse.return_value = make_response(Answer(value=42))

    with caplog.at_level(logging.INFO, logger="integrations.openai"):
        result = get_response(instructions="Answer", input={"q": "ж"}, schema=Answer)

    assert result == Answer(value=42)
    parse.assert_called_once_with(
        model=openai_integration.MODEL,
        instructions="Answer",
        input=json.dumps({"q": "ж"}),
        text_format=Answer,
    )
    [record] = caplog.records
    assert (record.input_tokens, record.cached_input_tokens, record.output_tokens) == (10, 4, 3)
    assert record.openai_response_id == "resp_1"


def test_works_without_usage(parse: MagicMock) -> None:
    parse.return_value = make_response(Answer(value=1), with_usage=False)

    assert get_response(instructions="", input="x", schema=Answer) == Answer(value=1)


def test_wraps_provider_errors(parse: MagicMock) -> None:
    parse.side_effect = OpenAIError("rate limited")

    with pytest.raises(AIResponseError, match="rate limited"):
        get_response(instructions="", input="x", schema=Answer)


def test_wraps_invalid_output(parse: MagicMock) -> None:
    with pytest.raises(ValidationError) as exc_info:
        Answer.model_validate({"value": "not a number"})
    parse.side_effect = exc_info.value

    with pytest.raises(AIResponseError):
        get_response(instructions="", input="x", schema=Answer)


def test_raises_when_nothing_was_parsed(parse: MagicMock) -> None:
    parse.return_value = make_response(None)

    with pytest.raises(AIResponseError, match="no parsed content"):
        get_response(instructions="", input="x", schema=Answer)


def test_unmocked_calls_are_blocked() -> None:
    with pytest.raises(RuntimeError, match="real OpenAI or HTTP call"):
        get_response(instructions="", input="x", schema=Answer)
