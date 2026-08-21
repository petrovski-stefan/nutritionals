import logging

from common.utils import transliterate_cyrillic_to_latin
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import (
    Count,
    F,
    Max,
    Min,
    Prefetch,
    Q,
    QuerySet,
    Subquery,
)
from django.db.models.functions import Coalesce, Greatest, Round

from ..models import Category, Product, ProductGroup, ProductGroupCategory
from . import openai as openai_service
from . import product as product_service
from . import productgroupcategory as productgroupcategory_service

logger = logging.getLogger(__name__)


def list_productgroups(*, q: str | None = None) -> QuerySet:
    base_qs = ProductGroup.objects.filter(is_reviewed=True)

    if q:
        matching_products_qs = product_service.search_products(
            q=q,
            has_limit=False,
        ).values("pk")

        base_qs = base_qs.filter(product__in=Subquery(matching_products_qs)).distinct()

    return (
        base_qs.annotate(product_count=Count("product", distinct=True))
        .select_related("brand")
        .prefetch_related(
            Prefetch(
                "product_set",
                queryset=product_service.base_products_qs(),
            )
        )
        .prefetch_related("categories")
        .order_by("-product_count")
    )


DISCOUNTED_GROUPS_LIMIT = 12


def list_discounted_groups(
    *, category: Category | None = None
) -> QuerySet[ProductGroup]:
    """
    Return the groups with the best member discount, annotated with the best discount
    percent, the lowest current price and the total number of offers
    """

    discounted = Q(product__is_reviewed=True, product__discount_price__isnull=False)
    reviewed = Q(product__is_reviewed=True)

    qs = (
        ProductGroup.objects.filter(is_reviewed=True)
        .annotate(
            best_discount_percent=Max(
                Round((1 - F("product__discount_price") / F("product__price")) * 100),
                filter=discounted,
            ),
            lowest_price=Min(
                Coalesce("product__discount_price", "product__price"), filter=reviewed
            ),
            offer_count=Count("product", distinct=True, filter=reviewed),
        )
        .filter(best_discount_percent__isnull=False)
    )

    if category is not None:
        # Filter through a subquery instead of joining categories, so the annotations
        # above are not computed over a product x category cartesian product
        qs = qs.filter(
            id__in=ProductGroupCategory.objects.filter(category=category).values(
                "group_id"
            )
        )

    return (
        qs.select_related("brand")
        .prefetch_related(
            Prefetch("product_set", queryset=product_service.base_products_qs())
        )
        .order_by("-best_discount_percent", "-lowest_price")[:DISCOUNTED_GROUPS_LIMIT]
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

Each product has: id, name.

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
    Return smart search group queryset candidates by taking the greatest similarity
    from the keywords per product
    """

    similarity_expressions = [TrigramSimilarity("name", kw) for kw in keywords]

    # Greatest requires at least 2 expressions
    if len(similarity_expressions) == 1:
        similarity_expressions.append(TrigramSimilarity("name", keywords[0]))

    return (
        list_productgroups()
        .annotate(similarity=Greatest(*similarity_expressions))
        .filter(similarity__gt=0.15)
        .order_by("-similarity")
    )


def _group_ids_from_openai(*, query: str, candidates: list[dict]) -> list[int]:
    """Return group ids from openai which match the smart search query"""

    latin_q = transliterate_cyrillic_to_latin(query)

    data = {
        "query": latin_q,
        "products": candidates,
    }

    result = openai_service.get_openai_response(
        system_prompt=SMART_SEARCH_SYSTEM_PROMPT, input=data
    )

    return [int(r) for r in result]


def get_smart_searched_productgroups(*, validated_data: dict) -> QuerySet[ProductGroup]:
    """Return smart searched product group queryset, ordered by the best openai rank
    of any member product
    """

    query = validated_data.get("query")

    supplement_keywords = _convert_human_query_to_keywords_with_openai(q=query)

    if not supplement_keywords:
        return ProductGroup.objects.none()

    candidates = _get_smart_search_candidates(keywords=supplement_keywords)

    qs_values_for_openai = list(candidates.values("id", "name")[:200])

    openai_product_ids = _group_ids_from_openai(
        query=query, candidates=qs_values_for_openai
    )

    return list_productgroups().filter(id__in=openai_product_ids)


SCORE_THRESHOLD = 0.7


def assign_product_to_group(product: Product) -> None:  # noqa

    if product.group is not None:
        return

    product_brand_q = Q(brand=product.brand) if product.brand else Q(brand__isnull=True)
    product_category_ids = list(product.categories.values_list("id", flat=True))

    group_candidates = (
        list_productgroups()
        .filter(product_brand_q, product__categories__in=product_category_ids)
        .distinct()
    )

    best_group = None
    best_score = 0

    for group in group_candidates:
        pharmacy_count = group.product_set.filter(
            pharmacy=product.pharmacy, is_reviewed=True
        ).count()
        if pharmacy_count >= 2:
            continue

        for product_in_group in group.product_set.filter(is_reviewed=True).annotate(
            similarity=TrigramSimilarity("normalized_name", product.normalized_name)
        ):
            name_score = product_in_group.similarity
            form_with_count_score = (
                1 if product_in_group.form_with_count == product.form_with_count else 0
            )
            dosage_score = 1 if product_in_group.dosage == product.dosage else 0

            total_score = (
                name_score * 0.8 + form_with_count_score * 0.15 + dosage_score * 0.05
            )

            if total_score > best_score:
                best_score = total_score
                best_group = group

    if best_group and best_score >= SCORE_THRESHOLD:
        product.group = best_group
        product.save(update_fields=["group", "updated_at"])

        logger.info(
            f"Assigned {product.name} to group {best_group.name} with score {best_score}"
        )

    else:
        new_group = ProductGroup.objects.create(name=product.name, brand=product.brand)
        product.group = new_group
        product.save(update_fields=["group", "updated_at"])

        logger.info(f"Created group {new_group.name} for product {product.name}")

        best_group = new_group

    productgroupcategory_service.assign_unique_categories_to_group(
        category_ids=product_category_ids, group=best_group
    )


def filter_by_category_count(
    *, queryset: QuerySet[ProductGroup], category_count: int
) -> QuerySet[ProductGroup]:
    """Filter by exact number of annotated _category_count"""

    return queryset.annotate(_category_count=Count("categories", distinct=True)).filter(
        _category_count=category_count
    )
