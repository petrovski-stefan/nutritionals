from bs4 import BeautifulSoup, ResultSet, Tag

from .list_selectors import (
    PRODUCT_BRAND_SELECTOR,
    PRODUCT_CARD_SELECTOR,
    PRODUCT_LINK_SELECTOR,
    PRODUCT_PRICE_SELECTOR,
    PRODUCT_TITLE_SELECTOR,
)


def extract_products_from_page(soup: BeautifulSoup) -> ResultSet[Tag]:
    product_cards = soup.select(PRODUCT_CARD_SELECTOR)

    if len(product_cards) == 0:
        raise ValueError  # TODO: Improve error handling

    return product_cards


def extract_product_data(product_card: Tag) -> dict:
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

    return {"title": title, "brand": brand, "price": price, "link": link}
