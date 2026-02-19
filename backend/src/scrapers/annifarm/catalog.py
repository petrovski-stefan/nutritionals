from bs4 import BeautifulSoup, ResultSet, Tag
from pydantic import ValidationError

from ..shared import exceptions
from . import selectors, validators

PRODUCT_FIELD_IN_PRODUCT_CARD_SELECTOR_MAP = {
    "name": selectors.CATALOG_PRODUCT_CARD_NAME,
    "price": selectors.CATALOG_PRODUCT_CARD_PRICE,
    "url": selectors.CATALOG_PRODUCT_CARD_URL,
}


def extract_cards_from_page(soup: BeautifulSoup) -> list[Tag]:
    """Return a list of cards on a single page. Raise exception if nothing found"""

    cards = soup.select(selectors.CATALOG_PRODUCT_CARD)

    if not cards:
        raise exceptions.CardsNotFoundError

    return cards


def _extract_field_from_card(field: str, card: Tag) -> str | list[str] | None:
    """Return a product card's field value performed by simply extracting the Tag's text"""

    selector = PRODUCT_FIELD_IN_PRODUCT_CARD_SELECTOR_MAP.get(field)

    element = card.select_one(selector)

    if not element:
        return None

    if field == "url":
        return element.get("href").strip()

    return element.get_text(strip=True)


def _get_card_data(card: Tag) -> dict[str, str | None]:
    """Return a dict containing all product extracted data"""

    name = _extract_field_from_card("name", card)
    price = _extract_field_from_card("price", card)
    url = _extract_field_from_card("url", card)

    return {
        "name": name,
        "brand": None,
        "price": price,
        "discount_price": None,
        "url": url,
    }


def get_products_from_cards(cards: ResultSet[Tag]) -> list[dict]:
    """Return pydantic validated products data list"""

    products = []

    for card in cards:
        data = _get_card_data(card)

        try:
            validated = validators.CatalogProduct(**data).model_dump()
            products.append(validated)
        except ValidationError:
            continue

    return products
