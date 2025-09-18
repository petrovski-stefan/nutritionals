from bs4 import BeautifulSoup, ResultSet, Tag
from django.utils import timezone

from .selectors import (
    PAGE_NUMBERS_SELECTOR,
    PRODUCT_BRAND_IN_PRODUCT_CARD_SELECTOR,
    PRODUCT_CARD_SELECTOR,
    PRODUCT_IMAGE_IN_PRODUCT_CARD_SELECTOR,
    PRODUCT_LINK_IN_PRODUCT_CARD_SELECTOR,
    PRODUCT_PRICE_IN_PRODUCT_CARD_SELECTOR,
    PRODUCT_TITLE_IN_PRODUCT_CARD_SELECTOR,
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


def _extract_product_external_id(product_card: Tag) -> str | None:
    product_classes = product_card.get_attribute_list("class")

    for product_class in product_classes:
        if product_class.startswith("post-"):
            return product_class

    return None


FIELD_TO_SELECTOR_MAP = {
    "title": PRODUCT_TITLE_IN_PRODUCT_CARD_SELECTOR,
    "brand": PRODUCT_BRAND_IN_PRODUCT_CARD_SELECTOR,
    "link": PRODUCT_LINK_IN_PRODUCT_CARD_SELECTOR,
    "price": PRODUCT_PRICE_IN_PRODUCT_CARD_SELECTOR,
    "image_link": PRODUCT_IMAGE_IN_PRODUCT_CARD_SELECTOR,
}


def _extract_product_field(product_card: Tag, field: str) -> str:
    selector = FIELD_TO_SELECTOR_MAP.get(field)
    if selector is None:
        raise ValueError

    element = product_card.select_one(selector)

    try:
        if field == "link":
            return element.get("href").strip()

        if field == "image_link":
            return element.get("src").strip()

        return element.get_text(strip=True)

    except Exception:
        return ""


def extract_product_data(product_card: Tag, url: str) -> dict:
    external_id = _extract_product_external_id(product_card)
    if not external_id:
        raise ValueError("External ID not found")

    title = _extract_product_field(product_card, "title")
    brand = _extract_product_field(product_card, "brand")
    price = _extract_product_field(product_card, "price")
    link = _extract_product_field(product_card, "link")
    image_link = _extract_product_field(product_card, "image_link")

    scraped_data = {
        "external_id": external_id,
        "title": title,
        "brand": brand,
        "price": price,
        "link": link,
        "image_link": image_link,
        "url": url,
        "created_at": timezone.now(),
    }

    return scraped_data
