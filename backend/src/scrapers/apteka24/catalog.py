from bs4 import BeautifulSoup, ResultSet, Tag
from pydantic import ValidationError

from ..shared import exceptions
from . import selectors, validators

PRODUCT_FIELD_IN_PRODUCT_CARD_SELECTOR_MAP = {
    "name": selectors.CATALOG_PRODUCT_CARD_NAME,
    "prices": selectors.CATALOG_PRODUCT_CARD_PRICES,
    "brand": selectors.CATALOG_PRODUCT_CARD_BRAND,
    "url": selectors.CATALOG_PRODUCT_CARD_URL,
}

PROHIBITED_STRINGS_IN_PRICE = ["-", "through", "range"]


def _validate_price_format(product_card: Tag) -> bool:
    """Return False if the card contains prices applicable to promotion and not a product"""

    prices = product_card.select_one(selectors.CATALOG_PRODUCT_CARD_PRICES)

    if not prices:
        return False

    prices_text = prices.get_text(strip=True)
    has_only_allowed_strings = all(
        s not in prices_text for s in PROHIBITED_STRINGS_IN_PRICE
    )

    spans = product_card.select(selectors.CATALOG_PRODUCT_CARD_SPANS_FOR_VALIDATION)
    has_only_allowed_spans = all(len(span.get_text(strip=True)) != 1 for span in spans)

    return has_only_allowed_strings and has_only_allowed_spans


def extract_cards_from_page(soup: BeautifulSoup) -> list[Tag]:
    """Return a validated list of cards on a single page. Raise exception if nothing found"""

    cards = soup.select(selectors.CATALOG_PRODUCT_CARD)

    if not cards:
        raise exceptions.CardsNotFoundError

    return [card for card in cards if _validate_price_format(card)]


def _extract_field_from_card(field: str, card: Tag) -> str | list[str] | None:
    """Return a product card's field value performed by simply extracting the Tag's text"""

    selector = PRODUCT_FIELD_IN_PRODUCT_CARD_SELECTOR_MAP.get(field)

    if field == "prices":
        return [c.get_text(strip=True) for c in card.select(selector, limit=2)]

    element = card.select_one(selector)

    if not element:
        return None

    if field == "url":
        return element.get("href").strip()

    return element.get_text(strip=True)


def _split_prices(
    prices: list[str] | None,
) -> tuple[None, None] | tuple[str, str] | tuple[str, None]:
    """Convert list of prices to tuple of 2 based on what is present"""

    if prices is None:
        return None, None

    if len(prices) == 1:
        return prices[0], None

    return prices[0], prices[1]


def _get_card_data(card: Tag) -> dict[str, str | None]:
    """Return a dict containing all product extracted data"""

    name = _extract_field_from_card("name", card)
    brand = _extract_field_from_card("brand", card)
    prices = _extract_field_from_card("prices", card)
    url = _extract_field_from_card("url", card)

    price, discount_price = _split_prices(prices)

    return {
        "name": name,
        "brand": brand,
        "price": price,
        "discount_price": discount_price,
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
