import logging
import re
from dataclasses import dataclass

from common.utils import transliterate_cyrillic_to_latin
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import F, QuerySet
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
- Assign each category a precision score between 0 and 1.
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
    "precision": <0-1>
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


def search_products(*, q: str) -> QuerySet[Product]:
    """Return a product queryset looked up by triagram similarity of the search query"""

    if not q:
        raise exceptions.ProductSearchQueryEmptyAPIError

    q_len = len(q)

    if q_len < 2:
        raise exceptions.ProductSearchQueryShortAPIError

    base_qs = base_products_qs()

    if q_len < 3:
        return base_qs.filter(name__icontains=q)[:20]

    return (
        base_qs.annotate(similarity=TrigramSimilarity("name", q))
        .filter(similarity__gt=0.2)
        .order_by("-similarity")[:20]
    )


def list_discounted_products() -> QuerySet[Product]:
    """Return a product queryset containing 10 or less products with highest discount_percent"""

    return (
        base_products_qs()
        .filter(discount_price__isnull=False)
        .order_by("-discount_percent", "-price")[:10]
    )


HUMAN_QUERY_TO_SUPPLEMENTS_SYSTEM_PROMPT = """
You are a supplement recommendation engine.

Your task:
Given a natural language query from a user describing a health goal, symptom, or specific supplement
(e.g., "improve sleep", "I need magnesium 400mg for sleep"):

Return:
- Exactly 7 relevant supplement names from a catalog.
- Prioritize supplements explicitly mentioned in the user query.
- Only output a JSON array of strings.
- Do NOT include any explanation, text, markdown, or formatting.
- Example: ["melatonin", "magnesium", "valerian", "chamomile", "L-theanine", "5-HTP", "vitamin D3"]

Rules:
- Include only supplements that exist in the catalog (do not make up new supplements).
- If fewer than 7 relevant supplements exist, fill the rest with the most generally
relevant ones for the health goal or symptom.
- Output must be valid JSON.
"""


SMART_SEARCH_SYSTEM_PROMPT = """
You are a product search ranking engine.

Your task:
Given:
- A natural language search query
- A list of products (each product has: id, name, form_with_count, dosage)

Return a JSON array containing ONLY the IDs of the products that best match the query.

Strict rules:
- Output MUST be a valid JSON array of integers.
- Do NOT include any explanation, text, markdown, or formatting.
- Do NOT include any keys (no {"results": ...}).
- Return only: [1, 5, 23]
- If no products match, return: []

Matching rules:
- Use semantic understanding, not only keyword matching.
- Consider synonyms and common medical terminology.
- Match dosage strength if mentioned (e.g., 500mg).
- Match form if mentioned (tablet, syrup, capsule, etc.).
- If the query is vague, return the most relevant products.
- If multiple products match, rank by relevance and return them in order of best match first.
- Do not hallucinate products — only use provided IDs.

Never output anything except a JSON array of integers.
"""


def _convert_human_query_to_keywords_with_openai(*, q: str) -> list[str]:
    """Return list of strings keywords by transforming the human query with openai"""

    data = {"query": q}

    results = openai_service.get_openai_response(
        system_prompt=HUMAN_QUERY_TO_SUPPLEMENTS_SYSTEM_PROMPT, input=data
    )

    return [r.strip() for r in results]


def _get_smart_search_candidates(*, keywords: list[str]) -> QuerySet[Product]:
    """
    Return smart search product queryset candidates by taking the greatest similarity
    from the keywords per product
    """

    similarity_expressions = [TrigramSimilarity("name", kw) for kw in keywords]

    return (
        base_products_qs()
        .annotate(similarity=Greatest(*similarity_expressions))
        .filter(similarity__gt=0.2)
        .order_by("-similarity")
    )


def _product_ids_from_openai(*, query: str, candidates: list[dict]) -> list[int]:
    """Return product ids from openai which match the smart search query"""

    data = {
        "query": query,
        "products": candidates,
    }

    result = openai_service.get_openai_response(
        system_prompt=SMART_SEARCH_SYSTEM_PROMPT, input=data
    )

    return [int(r) for r in result]


def get_smart_seached_products(*, validated_data: dict) -> QuerySet[Product]:
    """Return smart searched product queryset based on human query and optional filtering
    by categories and pharmacies
    """

    query = validated_data.get("query")
    pharmacies = validated_data.get("pharmacies")
    categories = validated_data.get("categories")

    supplement_keywords = _convert_human_query_to_keywords_with_openai(q=query)

    candidates = _get_smart_search_candidates(keywords=supplement_keywords)

    if pharmacies:
        candidates = candidates.filter(pharmacy__in=pharmacies)

    if categories:
        candidates = candidates.filter(categories__in=categories)

    qs_values_for_openai = list(
        candidates.values("id", "name", "form_with_count", "dosage")[:500]
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
