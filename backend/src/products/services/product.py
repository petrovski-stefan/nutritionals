import logging
import re
from dataclasses import dataclass

from common.utils import transliterate_cyrillic_to_latin
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Case, F, FloatField, Q, QuerySet, Value, When
from django.db.models.functions import Round
from django.utils import timezone

from .. import exceptions
from ..ai.supplement_enrichment import enrich_supplement
from ..models import Pharmacy, Product
from . import category as category_service
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

    form_with_count, dosage, ai_categories = enrich_supplement(
        name=scraped_product.name, categories=category_service.list_category_names()
    )

    categories = category_service.get_unique_categories(
        ai_categories=ai_categories, catalog_category=category_name
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
