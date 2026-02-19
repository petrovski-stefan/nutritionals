import json
import logging

import openai

logger = logging.getLogger(__name__)


def get_openai_response(
    *,
    system_prompt: str,
    input: dict | list,
) -> list | dict:

    response = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(input)},
        ],
    )

    output_text = response.choices[0].message.content

    try:
        return json.loads(output_text)
    except json.JSONDecodeError as e:
        logger.warning(e)
        raise e
