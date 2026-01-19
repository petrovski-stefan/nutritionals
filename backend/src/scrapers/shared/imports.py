import importlib
from types import ModuleType
from typing import Callable

from bs4 import BeautifulSoup, ResultSet, Tag

type ExtractProductsFromPageCallable = Callable[[BeautifulSoup], ResultSet[Tag]]


REQUIRED_FNS = [
    "get_catalog_url_by_page",
    "extract_cards_from_page",
    "get_products_from_cards",
    "get_product_from_page",
]


def _load_pharmacy_module(pharmacy_name: str) -> ModuleType:
    """Dynamically import a pharmacy module"""

    module_path = f"scrapers.{pharmacy_name.lower()}"
    try:
        return importlib.import_module(module_path)
    except ModuleNotFoundError as e:
        raise ImportError(
            f"Parser module not found for pharmacy '{pharmacy_name}'"
        ) from e


def load_pharmacy_fns(pharmacy_name: str) -> tuple:
    """Return a tuple of required fns as a tuple. Raises ImportError if missing"""
    module = _load_pharmacy_module(pharmacy_name)

    missing = [fn for fn in REQUIRED_FNS if not hasattr(module, fn)]
    if missing:
        raise ImportError(
            f"Missing required functions in '{pharmacy_name}.parsers': {', '.join(missing)}"
        )

    return tuple(getattr(module, fn) for fn in REQUIRED_FNS)
