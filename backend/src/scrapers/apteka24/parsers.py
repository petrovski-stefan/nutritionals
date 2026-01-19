from bs4 import Tag

from .selectors import (
    PRODUCT_BRAND,
    PRODUCT_DESCRIPTION,
    PRODUCT_DISCOUNT_PRICE,
    PRODUCT_NAME,
    PRODUCT_PRICE,
    PRODUCT_TAGS,
)

PRODUCT_FIELD_TO_SELECTOR_MAP = {
    "name": PRODUCT_NAME,
    "brand": PRODUCT_BRAND,
    "price": PRODUCT_PRICE,
    "discount_price": PRODUCT_DISCOUNT_PRICE,
    "description": PRODUCT_DESCRIPTION,
}


def _extract_product_field_from_product_page(
    product_page_tag: Tag, field: str
) -> str | None:
    selector = PRODUCT_FIELD_TO_SELECTOR_MAP.get(field)

    try:
        element = product_page_tag.select_one(selector)
        return element.get_text(strip=True)
    except Exception:
        return None


def extract_product_detail_data(product_detail_html: Tag) -> dict:
    name = _extract_product_field_from_product_page(product_detail_html, "name")
    brand = _extract_product_field_from_product_page(product_detail_html, "brand")
    price = _extract_product_field_from_product_page(product_detail_html, "price")
    discount_price = _extract_product_field_from_product_page(
        product_detail_html, "discount_price"
    )
    tags = _extract_product_tags_from_product_page(product_detail_html)
    description = _extract_product_field_from_product_page(
        product_detail_html, "description"
    )

    return {
        "name": name,
        "brand": brand,
        "price": price,
        "discount_price": discount_price,
        "tags": tags,
        "description": description,
    }


def _extract_product_tags_from_product_page(product_page: Tag) -> str:
    tags = product_page.select(PRODUCT_TAGS)

    return " ".join(t.get_text(strip=True).lower() for t in tags)
