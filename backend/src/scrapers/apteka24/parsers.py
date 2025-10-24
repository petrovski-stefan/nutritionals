from bs4 import BeautifulSoup, ResultSet, Tag

from .selectors import (
    CATALOG_PAGE_NUMBERS_SELECTOR,
    PRODUCT_BRAND_SELECTOR,
    PRODUCT_CARD_IN_CATALOG_SELECTOR,
    PRODUCT_DESCRIPTION_SELECTOR,
    PRODUCT_DISCOUNT_PRICE_SELECTOR,
    PRODUCT_LINK_IN_CATALOG_PRODUCT_CARD_SELECTOR,
    PRODUCT_NAME_SELECTOR,
    PRODUCT_OUT_OF_STOCK_SELECTOR,
    PRODUCT_PRICE_SELECTOR,
    PRODUCT_PRICES_STRING_IN_CATALOG_PRODUCT_CARD_SELECTOR,
)


def _extract_page_num(page_num_el: Tag) -> int | None:
    try:
        return int(page_num_el.get_text(strip=True))
    except (ValueError, TypeError):
        return None


def extract_max_page_num(soup: BeautifulSoup) -> int:
    page_nums_elements = soup.select(CATALOG_PAGE_NUMBERS_SELECTOR)
    if len(page_nums_elements) == 0:
        raise ValueError(len(page_nums_elements))

    page_nums = [_extract_page_num(page_num_el) for page_num_el in page_nums_elements]

    return max(filter(lambda p: p is not None, page_nums))  # type: ignore


def extract_products_from_page(soup: BeautifulSoup) -> ResultSet[Tag]:
    product_cards = soup.select(PRODUCT_CARD_IN_CATALOG_SELECTOR)

    if len(product_cards) == 0:
        raise ValueError  # TODO: Improve error handling

    return [
        card
        for card in product_cards
        if _extract_and_validate_product_prices_from_catalog_product_card(card)
    ]


PRODUCT_FIELD_TO_SELECTOR_MAP = {
    "name": PRODUCT_NAME_SELECTOR,
    "brand": PRODUCT_BRAND_SELECTOR,
    "price": PRODUCT_PRICE_SELECTOR,
    "discount_price": PRODUCT_DISCOUNT_PRICE_SELECTOR,
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


def _extract_and_validate_product_prices_from_catalog_product_card(
    product_card: Tag,
) -> bool:
    prices = product_card.select_one(
        PRODUCT_PRICES_STRING_IN_CATALOG_PRODUCT_CARD_SELECTOR
    )

    try:
        prices_text = prices.get_text(strip=True)
        not_allowed_strings_in_price = ["-", "through", "range"]

        return all(string not in prices_text for string in not_allowed_strings_in_price)

    except Exception:
        return False


def extract_product_url_from_card(product_card: Tag) -> str:
    a_tag = product_card.select_one(PRODUCT_LINK_IN_CATALOG_PRODUCT_CARD_SELECTOR)

    try:
        return a_tag.get("href").strip()
    except TypeError:
        raise


def extract_product_detail_data(product_detail_html: Tag) -> dict:
    name = _extract_product_field(product_detail_html, "name")
    brand = _extract_product_field(product_detail_html, "brand")
    price = _extract_product_field(product_detail_html, "price")
    discount_price = _extract_product_field(product_detail_html, "discount_price")
    description = _extract_product_field(product_detail_html, "description")
    is_in_stock = _extract_product_field(product_detail_html, "is_out_of_stock") is None

    return {
        "name": name,
        "brand": brand,
        "price": price,
        "discount_price": discount_price,
        "description": description,
        "is_in_stock": is_in_stock,
    }
