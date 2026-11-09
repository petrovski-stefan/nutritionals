import json
import logging
import time
from typing import TypeVar

from openai import Client, OpenAIError
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)

client = Client(timeout=30.0)

MODEL = "gpt-4.1-mini"

T = TypeVar("T", bound=BaseModel)


class AIResponseError(Exception):
    """Raise when the AI provider fails or returns unusable output"""


def get_response(*, instructions: str, input: dict | list | str, schema: type[T]) -> T:
    """Return the model response parsed into the given pydantic schema.

    Raises AIResponseError only, so callers never handle provider specific errors.
    Logs one line per call with its duration and token usage.
    """

    start = time.perf_counter()

    try:
        response = client.responses.parse(
            model=MODEL,
            instructions=instructions,
            input=json.dumps(input),
            text_format=schema,
        )
    except (OpenAIError, ValidationError) as e:
        duration_ms = round((time.perf_counter() - start) * 1000)
        logger.warning(
            "OpenAI call for %s failed after %sms: %s",
            schema.__name__,
            duration_ms,
            e,
            extra={"schema": schema.__name__, "model": MODEL, "duration_ms": duration_ms},
        )

        raise AIResponseError(str(e)) from e

    # The duration includes the SDK's retries, which it logs itself
    duration_ms = round((time.perf_counter() - start) * 1000)
    usage = response.usage
    input_tokens = usage.input_tokens if usage else None
    cached_input_tokens = usage.input_tokens_details.cached_tokens if usage else None
    output_tokens = usage.output_tokens if usage else None

    logger.info(
        "OpenAI call for %s: %sms, %s input tokens (%s cached), %s output tokens",
        schema.__name__,
        duration_ms,
        input_tokens,
        cached_input_tokens,
        output_tokens,
        extra={
            "schema": schema.__name__,
            "model": response.model,
            "openai_response_id": response.id,
            "duration_ms": duration_ms,
            "input_tokens": input_tokens,
            "cached_input_tokens": cached_input_tokens,
            "output_tokens": output_tokens,
        },
    )

    parsed = response.output_parsed

    if parsed is None:
        logger.warning(
            "OpenAI returned no parsed output for %s",
            schema.__name__,
            extra={"schema": schema.__name__, "openai_response_id": response.id},
        )

        raise AIResponseError("OpenAI response has no parsed content")

    return parsed
