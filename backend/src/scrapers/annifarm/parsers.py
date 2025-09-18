from bs4 import BeautifulSoup, ResultSet, Tag

from .selectors import (
    PAGE_NUMBERS_SELECTOR,
    PRODUCT_BRAND_SELECTOR,
    PRODUCT_CARD_SELECTOR,
    PRODUCT_LINK_SELECTOR,
    PRODUCT_PRICE_SELECTOR,
    PRODUCT_TITLE_SELECTOR,
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


def extract_external_product_id(product_card: Tag) -> str | None:
    product_classes = product_card.get_attribute_list("class")

    for product_class in product_classes:
        if product_class.startswith("post-"):
            return product_class

    return None


def extract_product_data(product_card: Tag) -> dict:
    external_id = extract_external_product_id(product_card)
    if not external_id:
        raise ValueError("External id not found")

    title_element = product_card.select_one(PRODUCT_TITLE_SELECTOR)
    if not title_element:
        raise ValueError("Title not found")

    title = title_element.get_text(strip=True)

    brand_element = product_card.select_one(PRODUCT_BRAND_SELECTOR)
    if not brand_element:
        brand = ""
    else:
        brand = brand_element.get_text(strip=True)

    price_element = product_card.select_one(PRODUCT_PRICE_SELECTOR)
    if not price_element:
        price = ""
    else:
        price = price_element.get_text(strip=True)

    link_element = product_card.select_one(PRODUCT_LINK_SELECTOR)

    if not link_element:
        link = ""
    else:
        link = link_element.get("href")  # type: ignore

    return {
        "external_id": external_id,
        "title": title,
        "brand": brand,
        "price": price,
        "link": link,
    }
