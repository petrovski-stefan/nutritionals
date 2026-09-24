import logging
from typing import Annotated

from common.utils import transliterate_cyrillic_to_latin
from integrations.openai import AIResponseError, get_response
from pydantic import AfterValidator, BaseModel, BeforeValidator

logger = logging.getLogger(__name__)

ENRICHMENT_INSTRUCTIONS_TEMPLATE = """
You are a dietary supplement classification engine.

TASK:
You will receive a name of a supplement product.
Classify it according to the fixed categories below,
infer if it is an OTC supplement (status),
and extract dosage and form+count if present.

CATEGORIES (fixed, do not invent):
__CATEGORIES__

RULES:
- For the product, output a maximum of 2 categories.
- Order categories by descending relevance (most precise first).
- Assign each category a confidence score between 0 and 1.
- Do not include irrelevant categories.
- Do not force 2 categories if fewer apply.
- Prefer ingredient-based categorization over marketing claims.
- If the product is a combination (e.g. mineral + vitamin), include both.
- If functional intent is clear (e.g. neuro), it may be included as a secondary category.
- Include "status": true if it is an OTC supplement suitable for classification; false otherwise.
- Include "dosage": string in format "{number} {unit}" if the dosage is mentioned
in the product name, else null.
- Include "form_count": string in format "{count} {form}" if the product form and count
are mentioned, else null.
- Do not output any text outside JSON. Only return valid JSON.

INPUT FORMAT:

{"name": "<product_name>"},

OUTPUT SCHEMA:

{
"categories": [
    {
    "name": "<category_name>",
    "confidence": <0-1>
    }
],
"status": <true|false>,
"dosage": <string|null>,
"form_count": <string|null>
}

"""


def _build_instructions(*, categories: list[str]) -> str:
    """Render the instructions with the categories currently in the database"""

    numbered = "\n".join(f"{i}. {c}" for i, c in enumerate(categories, 1))

    return ENRICHMENT_INSTRUCTIONS_TEMPLATE.replace("__CATEGORIES__", numbered)


def _to_clean_latin(value: str | None) -> str:
    """Transliterate to latin and lowercase, empty string when the model sent null"""

    return (transliterate_cyrillic_to_latin(value) or "").lower()


def _to_category_name(value: str) -> str:
    """Strip and capitalize so the name matches a Category row"""

    return value.strip().capitalize()


CleanLatinText = Annotated[
    str, BeforeValidator(_to_clean_latin, json_schema_input_type=str | None)
]

CategoryName = Annotated[str, AfterValidator(_to_category_name)]


class AICategory(BaseModel):
    name: CategoryName
    confidence: float


class SupplementEnrichment(BaseModel):
    categories: list[AICategory]
    status: bool
    dosage: CleanLatinText
    form_count: CleanLatinText


def enrich_supplement(
    *, name: str, categories: list[str]
) -> tuple[str, str, list[dict]]:
    """Return form with count, dosage and categories inferred from the product name.

    The categories the model may choose from are passed in, so they stay in sync
    with the Category table instead of being duplicated in the prompt.

    Returns empty values when the AI call fails, so the product is still created
    and flagged for manual review instead of aborting the scrape.
    """

    if not categories:
        logger.warning(f"No categories to classify into, skipping enrichment of {name}")

        return "", "", []

    data = {"name": name}

    try:
        result = get_response(
            instructions=_build_instructions(categories=categories),
            input=data,
            schema=SupplementEnrichment,
        )
    except AIResponseError as e:
        logger.warning(f"Enrichment failed for {name}: {e}")

        return "", "", []

    ai_categories = [c.model_dump() for c in result.categories]

    return result.form_count, result.dosage, ai_categories
