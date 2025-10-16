from bs4 import BeautifulSoup, ResultSet, Tag

from .selectors import (
    PAGE_NUMBERS_SELECTOR,
    PRODUCT_BRAND_SELECTOR,
    PRODUCT_CARD_SELECTOR,
    PRODUCT_DESCRIPTION_SELECTOR,
    PRODUCT_NAME_SELECTOR,
    PRODUCT_OUT_OF_STOCK_SELECTOR,
    PRODUCT_PRICE_SELECTOR,
)


def _extract_page_num(page_num_el: Tag) -> int | None:
    try:
        return int(page_num_el.get_text(strip=True))
    except (ValueError, TypeError):
        return None


def extract_max_page_num(soup: BeautifulSoup) -> int:
    page_nums_elements = soup.select(PAGE_NUMBERS_SELECTOR)
    if len(page_nums_elements) == 0:
        raise ValueError(len(page_nums_elements))

    page_nums = [_extract_page_num(page_num_el) for page_num_el in page_nums_elements]

    return max(filter(lambda p: p is not None, page_nums))  # type: ignore


def extract_products_from_page(soup: BeautifulSoup) -> ResultSet[Tag]:
    product_cards = soup.select(PRODUCT_CARD_SELECTOR)

    if len(product_cards) == 0:
        raise ValueError  # TODO: Improve error handling

    return product_cards


PRODUCT_FIELD_TO_SELECTOR_MAP = {
    "name": PRODUCT_NAME_SELECTOR,
    "brand": PRODUCT_BRAND_SELECTOR,
    "price": PRODUCT_PRICE_SELECTOR,
    "description": PRODUCT_DESCRIPTION_SELECTOR,
    "is_out_of_stock": PRODUCT_OUT_OF_STOCK_SELECTOR,
}


def _extract_product_field(product_detail_html: Tag, field: str) -> str | None:
    selector = PRODUCT_FIELD_TO_SELECTOR_MAP.get(field)

    element = product_detail_html.select_one(selector)

    try:
        return element.get_text(strip=True)
    except Exception:
        return None


def extract_product_url_for_discover(product_card: Tag) -> str:
    return product_card.get("href").strip()


def extract_product_detail_data(product_detail_html: Tag) -> dict:
    name = _extract_product_field(product_detail_html, "name")
    brand = _extract_product_field(product_detail_html, "brand")
    price = _extract_product_field(product_detail_html, "price")
    description = _extract_product_field(product_detail_html, "description")
    is_in_stock = _extract_product_field(product_detail_html, "is_out_of_stock") is None

    return {
        "name": name,
        "brand": brand,
        "price": price,
        "description": description,
        "is_in_stock": is_in_stock,
    }
