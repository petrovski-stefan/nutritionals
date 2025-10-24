import importlib
from typing import Callable

from bs4 import BeautifulSoup, ResultSet, Tag

type ExtractMaxPageNumCallable = Callable[[BeautifulSoup], int]
type ExtractProductUrlForDiscoverCallable = Callable[[Tag], str]
type ExtractProductsFromPageCallable = Callable[[BeautifulSoup], ResultSet[Tag]]


CATALOG_PARSING_REQUIRED_FNS = [
    "extract_max_page_num",
    "extract_product_url_from_card",
    "extract_products_from_page",
]

PRODUCT_PARSING_REQUIRED_FNS = []


def _load_pharmacy_module(pharmacy_name: str):
    """
    Dynamically import a pharmacy parser module.
    Expected module path: scrapers.<pharmacy_name>.parsers
    """

    module_path = f"scrapers.{pharmacy_name.lower()}.parsers"
    try:
        module = importlib.import_module(module_path)
        return module
    except ModuleNotFoundError as e:
        raise ImportError(
            f"Parser module not found for pharmacy '{pharmacy_name}'"
        ) from e


def load_pharmacy_functions(
    pharmacy_name: str,
) -> tuple[
    ExtractMaxPageNumCallable,
    ExtractProductUrlForDiscoverCallable,
    ExtractProductsFromPageCallable,
]:
    """
    Import and return the three expected parser functions as a tuple.
    """
    module = _load_pharmacy_module(pharmacy_name)

    missing = [fn for fn in CATALOG_PARSING_REQUIRED_FNS if not hasattr(module, fn)]
    if missing:
        raise ImportError(
            f"Missing required functions in '{pharmacy_name}.parsers': {', '.join(missing)}"
        )

    return (
        module.extract_max_page_num,
        module.extract_product_url_from_card,
        module.extract_products_from_page,
    )
