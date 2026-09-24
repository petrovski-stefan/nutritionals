import json
import logging
from typing import TypeVar

from openai import Client, OpenAIError
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)

client = Client(timeout=30.0)

T = TypeVar("T", bound=BaseModel)


class AIResponseError(Exception):
    """Raise when the AI provider fails or returns unusable output"""


def get_response(*, instructions: str, input: dict | list | str, schema: type[T]) -> T:
    """Return the model response parsed into the given pydantic schema.

    Raises AIResponseError only, so callers never handle provider specific errors.
    """

    try:
        response = client.responses.parse(
            model="gpt-4.1-mini",
            instructions=instructions,
            input=json.dumps(input),
            text_format=schema,
        )
    except (OpenAIError, ValidationError) as e:
        logger.warning(f"OpenAI call failed for {schema.__name__}: {e}")

        raise AIResponseError(str(e)) from e

    parsed = response.output_parsed

    if parsed is None:
        logger.warning(f"OpenAI returned no parsed output for {schema.__name__}")

        raise AIResponseError("OpenAI response has no parsed content")

    return parsed
