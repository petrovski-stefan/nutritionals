from collections.abc import Callable

import pytest

from scrapers.annifarm import normalization as annifarm
from scrapers.apteka24 import normalization as apteka24
from scrapers.shared import normalization as shared
from scrapers.vitamini import normalization as vitamini
from scrapers.zegin import normalization as zegin

# The functions return the digits as a string, which pydantic turns into a float


@pytest.mark.parametrize(
    ("normalize", "price_str", "expected"),
    [
        (shared.normalize_price_str, "1.200,00 ден", 1200),
        (shared.normalize_price_str, "Original price was: 990,00 ден.", 990),
        (vitamini.normalize_price_str, "1.200,00 ден", 1200),
        (vitamini.normalize_price_str, "Original price was: 990,00 ден.", 990),
        (annifarm.normalize_price_str, "1,200 ден", 1200),
        (annifarm.normalize_price_str, "450ден", 450),
        (apteka24.normalize_price_str, "11,460 ден", 11460),
        (apteka24.normalize_price_str, "Цена: 2,640 ден", 2640),
        (zegin.normalize_price_str, "1.200,00 ден.", 1200),
        (zegin.normalize_price_str, "990,00 ден.", 990),
    ],
)
def test_normalize_price_str(
    normalize: Callable[[str], object], price_str: str, expected: int
) -> None:
    assert float(str(normalize(price_str))) == expected


@pytest.mark.parametrize(
    "normalize",
    [
        shared.normalize_price_str,
        vitamini.normalize_price_str,
        annifarm.normalize_price_str,
        apteka24.normalize_price_str,
        zegin.normalize_price_str,
    ],
)
@pytest.mark.parametrize("price_str", ["", "ден", "по договор"])
def test_normalize_price_str_without_a_price(
    normalize: Callable[[str], object], price_str: str
) -> None:
    assert normalize(price_str) is None


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        (None, None),
        ("", None),
        ("now foods", "Now Foods"),
        ("Solgar, Vitamins, Minerals", "Solgar"),
        ("OTC Bayer", "Bayer"),
        ("otc", None),
        ("  natures   PLUS ", "Natures Plus"),
    ],
)
def test_normalize_brand_name(raw: str | None, expected: str | None) -> None:
    assert shared.normalize_brand_name(raw) == expected
