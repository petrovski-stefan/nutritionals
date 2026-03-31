import logging
import re
from dataclasses import dataclass

from common.utils import transliterate_cyrillic_to_latin
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Case, F, FloatField, Q, QuerySet, Value, When
from django.db.models.functions import Greatest, Round
from django.utils import timezone

from .. import exceptions
from ..models import Pharmacy, Product
from . import category as category_service
from . import openai as openai_service
from . import productcategory as productcategory_service

logger = logging.getLogger(__name__)


@dataclass
class ScrapedProduct:
    """Representation of validated product data returned by scraping"""

    name: str
    brand: str | None
    price: float
    discount_price: float | None
    url: str


SUPPLEMENT_CLASSIFICATION_SYSTEM_PROMPT = """
You are a dietary supplement classification engine.

TASK:
You will receive a list of up to 20 products. Each product includes a unique ID and a product name.
For each product, classify it according to the fixed categories below,
infer if it is an OTC supplement (status),
and extract dosage and form+count if present.

CATEGORIES (fixed, do not invent):
1. Витамини
2. Минерали
3. Амино-киселини
4. Херба
5. Рибини масла
6. Пробиотици
7. Спортска исхрана
8. Коски и зглобови
9. Антиоксиданси
10. Неуро
11. Друго

RULES:
- For each product, output a maximum of 3 categories.
- Order categories by descending relevance (most precise first).
- Assign each category a confidence score between 0 and 1.
- Do not include irrelevant categories.
- Do not force 3 categories if fewer apply.
- Prefer ingredient-based categorization over marketing claims.
- If a product is a combination (e.g. mineral + vitamin), include both.
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


def _get_additional_product_data_from_openai(
    name: str,
) -> tuple[str | None, str | None, list]:
    data = {"name": name}

    additional_data = openai_service.get_openai_response(
        system_prompt=SUPPLEMENT_CLASSIFICATION_SYSTEM_PROMPT, input=data
    )

    return _parse_additional_product_data_from_openai(
        openai_response_dict=additional_data
    )


def _parse_additional_product_data_from_openai(
    *, openai_response_dict: dict
) -> tuple[str, str, list[str]]:
    form_with_count = (
        transliterate_cyrillic_to_latin(openai_response_dict.get("form_count")) or ""
    ).lower()

    dosage = (
        transliterate_cyrillic_to_latin(openai_response_dict.get("dosage")) or ""
    ).lower()

    categories = openai_response_dict.get("categories", [])

    return form_with_count, dosage, categories


def _create_scraped_product(
    *,
    pharmacy: Pharmacy,
    scraped_product: ScrapedProduct,
    last_scraped_at: timezone.datetime,
    category_name: str | None,
) -> Product:
    """Create a new product"""

    normalized_name = get_normalized_product_name(
        product_name=scraped_product.name, brand_name=scraped_product.brand
    )

    from .brand import get_or_create_brand_by_name, infer_brand_from_product_name

    if scraped_product.brand is not None:
        brand = get_or_create_brand_by_name(name=scraped_product.brand)
    else:
        brand = infer_brand_from_product_name(
            product_name=scraped_product.name, normalized_product_name=normalized_name
        )

    form_with_count, dosage, openai_categories = (
        _get_additional_product_data_from_openai(scraped_product.name)
    )

    categories = category_service.get_unique_categories(
        openai_categories=openai_categories, catalog_category=category_name
    )

    is_reviewed = bool(categories and form_with_count)

    product = Product.objects.create(
        name=scraped_product.name,
        normalized_name=normalized_name,
        price=scraped_product.price,
        discount_price=scraped_product.discount_price,
        pharmacy=pharmacy,
        brand=brand,
        url=scraped_product.url,
        last_scraped_at=last_scraped_at,
        is_reviewed=is_reviewed,
        form_with_count=form_with_count,
        dosage=dosage,
    )

    productcategory_service.add_categories_to_product(
        categories=categories, product=product
    )

    logger.info(
        f"({pharmacy.name}) Created product ({product.pk}) {product.name} - {product.normalized_name}"  # noqa
    )

    return product


def _update_scraped_product(
    *,
    product: Product,
    scraped_product: ScrapedProduct,
    pharmacy_name: str,
    last_scraped_at: timezone.datetime,
    category_name: str | None,
) -> Product:
    """Updates last_scraped_at, and price and discount_price only if changed"""

    PRIMITIVE_FIELDS_TO_TRACK = ["price", "discount_price"]

    fields_to_update = ["last_scraped_at", "updated_at"]
    changes = []

    for field in PRIMITIVE_FIELDS_TO_TRACK:
        new_value = getattr(scraped_product, field)

        if new_value != getattr(product, field):
            setattr(product, field, new_value)

            fields_to_update.append(field)
            changes.append(field)

    if product.brand is None:
        from .brand import infer_brand_from_product_name

        infered_brand = infer_brand_from_product_name(
            product_name=scraped_product.name,
            normalized_product_name=product.normalized_name,
        )
        if infered_brand is not None:
            product.brand = infered_brand
            fields_to_update.append("brand")
            changes.append("brand")

    if category_name:
        productcategory_service.add_categories_to_product(
            categories=[category_name], product=product
        )

    product.last_scraped_at = last_scraped_at
    product.save(update_fields=fields_to_update)

    logger.info(
        f"({pharmacy_name}) Updated product ({product.pk}) {product.name}: "
        f"{', '.join(changes) or '/'}"
    )

    return product


def create_or_update_scraped_product(
    *, pharmacy: Pharmacy, validated_data: dict, category_name: str | None
) -> Product:
    """Create or update a scraped product, assign it to a group and return it"""

    last_scraped_at = timezone.now()

    scraped_product = ScrapedProduct(**validated_data)
    product = Product.objects.filter(
        pharmacy=pharmacy, name=scraped_product.name
    ).first()

    if product is None:
        return _create_scraped_product(
            pharmacy=pharmacy,
            last_scraped_at=last_scraped_at,
            scraped_product=scraped_product,
            category_name=category_name,
        )
    else:
        return _update_scraped_product(
            product=product,
            scraped_product=scraped_product,
            pharmacy_name=pharmacy.name,
            last_scraped_at=last_scraped_at,
            category_name=category_name,
        )


def base_products_qs() -> QuerySet[Product]:
    """Return public products queryset with annotated field discount_percent"""

    return (
        Product.objects.select_related("pharmacy", "brand", "group")
        .filter(is_reviewed=True)
        .only(
            "id",
            "name",
            "price",
            "discount_price",
            "pharmacy__name",
            "brand__name",
            "group",
            "url",
            "last_scraped_at",
        )
        .annotate(discount_percent=Round((1 - F("discount_price") / F("price")) * 100))
    )


def search_products(*, q: str, has_limit: bool = True) -> QuerySet[Product]:
    if not q:
        raise exceptions.ProductSearchQueryEmptyAPIError

    latin_q = transliterate_cyrillic_to_latin(q.strip())

    if len(latin_q) < 2:
        raise exceptions.ProductSearchQueryShortAPIError

    base_qs = base_products_qs()
    q_len = len(latin_q)

    if q_len <= 4:
        qs = base_qs.filter(normalized_name__icontains=latin_q)

    elif q_len <= 15:
        qs = (
            base_qs.annotate(
                similarity=TrigramSimilarity("normalized_name", latin_q),
                contains_boost=Case(
                    When(
                        Q(normalized_name__icontains=latin_q),
                        then=Value(0.3),
                    ),
                    default=Value(0.0),
                    output_field=FloatField(),
                ),
            )
            .filter(Q(similarity__gt=0.1) | Q(normalized_name__icontains=latin_q))
            .order_by(-(F("similarity") + F("contains_boost")))
        )

    else:
        # Long query
        qs = (
            base_qs.annotate(similarity=TrigramSimilarity("normalized_name", latin_q))
            .filter(similarity__gt=0.1)
            .order_by("-similarity")
        )

    if has_limit:
        return qs[:20]

    return qs


def list_discounted_products() -> QuerySet[Product]:
    """Return a product queryset containing 10 or less products with highest discount_percent"""

    return (
        base_products_qs()
        .filter(discount_price__isnull=False)
        .order_by("-discount_percent", "-price")[:10]
    )


HUMAN_QUERY_TO_KEYWORDS_SYSTEM_PROMPT = """
You are a supplement search keyword generator for a pharmacy catalog search engine.

Your task:
Given a natural language query describing a health goal, symptom, or specific supplement,
generate a list of supplement name strings that will be used for fuzzy text matching
against a product catalog.

Rules:
1. Output ONLY a valid JSON array of strings — no explanation, markdown, or extra text.
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
8. If the query is entirely unrelated to health, medicine, or supplements, return [].

Examples:
- Query: "I need magnesium 400mg for sleep"
  → ["magnesium", "magnesium glycinate", "magnesium citrate", "magnesium oxide",
     "melatonin", "l-theanine", "5-htp"]

- Query: "za spienie" (Macedonian transliteration of "for sleep")
  → ["melatonin", "magnesium", "magnesium glycinate", "l-theanine", "5-htp",
     "valerian", "chamomile"]

- Query: "bolki vo zglobovite" (Macedonian transliteration of "joint pain")
  → ["glucosamine", "chondroitin", "msm", "collagen", "turmeric", "curcumin", "boswellia"]

- Query: "coq10"
  → ["coq10", "coenzyme q10", "ubiquinol", "ubiquinone"]
"""


SMART_SEARCH_SYSTEM_PROMPT = """
You are a product search ranking engine for a pharmacy supplement catalog.

Your task:
Given a natural language search query and a list of candidate products,
return the IDs of the products that are relevant to the query, ranked best match first.

Each product has: id, name, form_with_count, dosage.

Output rules:
- Output ONLY a valid JSON array of integers — no explanation, markdown, or extra text.
- Example output: [12, 4, 87]
- Never output keys or wrappers like {"results": [...]}.
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
- If a specific dosage is mentioned (e.g. "400mg"), prefer products with that dosage
  but still include other dosages of the same supplement.
- If a specific form is mentioned (e.g. "syrup", "capsule"), prefer that form
  but do not exclude other forms of the same supplement.
- If the query is vague or general, return ALL products that are plausibly relevant.
- Only omit a product if it is clearly unrelated to the query.
- Never invent or hallucinate product IDs — only use IDs from the provided list.
"""


def _convert_human_query_to_keywords_with_openai(*, q: str) -> list[str]:
    """Return list of strings keywords by transforming the human query with openai"""

    latin_q = transliterate_cyrillic_to_latin(q)

    data = {"query": latin_q}

    results = openai_service.get_openai_response(
        system_prompt=HUMAN_QUERY_TO_KEYWORDS_SYSTEM_PROMPT, input=data
    )

    return [r.strip() for r in results]


def _get_smart_search_candidates(*, keywords: list[str]) -> QuerySet[Product]:
    """
    Return smart search product queryset candidates by taking the greatest similarity
    from the keywords per product
    """

    similarity_expressions = [
        TrigramSimilarity("normalized_name", kw) for kw in keywords
    ]

    # Greatest requires at least 2 expressions
    if len(similarity_expressions) == 1:
        similarity_expressions.append(TrigramSimilarity("normalized_name", keywords[0]))

    return (
        base_products_qs()
        .annotate(similarity=Greatest(*similarity_expressions))
        .filter(similarity__gt=0.15)
        .order_by("-similarity")
    )


def _product_ids_from_openai(*, query: str, candidates: list[dict]) -> list[int]:
    """Return product ids from openai which match the smart search query"""

    latin_q = transliterate_cyrillic_to_latin(query)

    data = {
        "query": latin_q,
        "products": candidates,
    }

    result = openai_service.get_openai_response(
        system_prompt=SMART_SEARCH_SYSTEM_PROMPT, input=data
    )

    return [int(r) for r in result]


def get_smart_seached_products(*, validated_data: dict) -> QuerySet[Product]:
    """Return smart searched product queryset based on human query and optional filtering
    by pharmacies
    """

    query = validated_data.get("query")
    pharmacies = validated_data.get("pharmacies")

    supplement_keywords = _convert_human_query_to_keywords_with_openai(q=query)

    if not supplement_keywords:
        return Product.objects.none()

    candidates = _get_smart_search_candidates(keywords=supplement_keywords)

    if pharmacies:
        candidates = candidates.filter(pharmacy__in=pharmacies)

    qs_values_for_openai = list(
        candidates.values("id", "name", "form_with_count", "dosage")[:200]
    )

    openai_product_ids = _product_ids_from_openai(
        query=query, candidates=qs_values_for_openai
    )

    return base_products_qs().filter(id__in=openai_product_ids)


def get_normalized_product_name(*, product_name: str, brand_name: str | None) -> str:

    lowercase_product_name = product_name.lower()
    latin_product_name = transliterate_cyrillic_to_latin(lowercase_product_name)
    brand_name_to_remove = brand_name.lower() if brand_name else ""

    product_name_without_brand = latin_product_name.replace(
        brand_name_to_remove, "", count=1
    ).strip()

    normalized = product_name_without_brand
    for char in [" x ", "/", "(", ")", ","]:
        normalized = normalized.replace(char, " ")

    return re.sub(r"\s+", " ", normalized).strip()
