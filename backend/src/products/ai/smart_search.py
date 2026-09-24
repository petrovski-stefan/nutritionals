from integrations.openai import get_response
from pydantic import BaseModel

HUMAN_QUERY_TO_TAGS_INSTRUCTIONS = """
You are a supplement search keyword generator for a pharmacy catalog search engine.

Your task:
Given a natural language query describing a health goal, symptom, or specific supplement,
generate a list of supplement name strings that will be used for fuzzy text matching
against a product catalog.

Rules:
1. Output ONLY a JSON object with a single key "keywords" holding an array of strings.
2. Each string should be a supplement name or common alias/abbreviation as it would
   typically appear on a product label or in a pharmacy catalog.
3. The query may be written in English OR in transliterated Macedonian
   (Macedonian words written with Latin letters, e.g. "za spienie", "zglobovi", "imunitet").
   Understand the intent regardless of language and always output keywords in English.
4. Always prioritize supplements explicitly named in the query — include them first
   and add common spelling variants or abbreviations for them
   (e.g. "coenzyme q10", "coq10", "ubiquinol").
5. Add other supplements commonly associated with the health goal or symptom.
6. Include both generic names and widely-used branded ingredient names where relevant
   (e.g. "curcumin", "turmeric", "meriva").
7. Aim for 7–10 strings. Do NOT pad with loosely related supplements just to hit a count.
8. If the query is entirely unrelated to health, medicine, or supplements,
   return an empty "keywords" array.

INPUT FORMAT:

{"query": "<user_query>"}

Examples:
- {"query": "I need magnesium 400mg for sleep"}
  → {"keywords": ["magnesium", "magnesium glycinate", "magnesium citrate",
     "magnesium oxide", "melatonin", "l-theanine", "5-htp"]}

- {"query": "za spienie"} (Macedonian transliteration of "for sleep")
  → {"keywords": ["melatonin", "magnesium", "magnesium glycinate", "l-theanine",
     "5-htp", "valerian", "chamomile"]}

- {"query": "bolki vo zglobovite"} (Macedonian transliteration of "joint pain")
  → {"keywords": ["glucosamine", "chondroitin", "msm", "collagen", "turmeric",
     "curcumin", "boswellia"]}

- {"query": "coq10"}
  → {"keywords": ["coq10", "coenzyme q10", "ubiquinol", "ubiquinone"]}
"""


class TagList(BaseModel):
    keywords: list[str]


def convert_query_to_tags(*, latin_query: str) -> list[str]:
    data = {"query": latin_query}

    result = get_response(
        instructions=HUMAN_QUERY_TO_TAGS_INSTRUCTIONS,
        input=data,
        schema=TagList,
    )

    return [k.strip() for k in result.keywords]


SMART_SEARCH_INSTRUCTIONS = """
You are a product search ranking engine for a pharmacy supplement catalog.

Your task:
Given a natural language search query and a list of candidate products,
return the IDs of the products that are relevant to the query, ranked best match first.

Each product has: id, name.

Output rules:
- Output ONLY a JSON object with a single key "product_ids" holding an array of integers.
- Example output: {"product_ids": [12, 4, 87]}
- Return AT MOST 30 product IDs.
- Rank IDs by relevance — most relevant first, least relevant last.
- If you have more than 30 relevant products, return only the 30 best matches.

Language rules:
- The query will be written in one of two ways:
  1. English (e.g. "magnesium for sleep", "joint pain relief")
  2. Transliterated Macedonian — Macedonian written with Latin letters
     (e.g. "za spienie", "bolki vo zglobovite", "za imunitet")
- Understand the intent of the query regardless of which language it is in,
  and match products accordingly.

Matching rules:
- Be INCLUSIVE rather than exclusive — when in doubt, include the product.
- Use semantic understanding: recognize synonyms, aliases, and related terms
  (e.g. "coq10" matches "coenzyme q10", "magnesium" matches "magnesium glycinate").
- If the query is vague or general, return ALL products that are plausibly relevant.
- Only omit a product if it is clearly unrelated to the query.
- Never invent or hallucinate product IDs — only use IDs from the provided list.
"""


class RankedProductIds(BaseModel):
    product_ids: list[int]


def smart_search(*, latin_query: str, candidates: list[dict]) -> list[int]:
    data = {
        "query": latin_query,
        "products": candidates,
    }

    result = get_response(
        instructions=SMART_SEARCH_INSTRUCTIONS, input=data, schema=RankedProductIds
    )

    return result.product_ids
