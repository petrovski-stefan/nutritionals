from types import ModuleType

import pytest

from scrapers import annifarm, apteka24, vitamini, zegin
from scrapers.shared.exceptions import CardsNotFoundError
from scrapers.shared.soup import get_soup
from scrapers.tests.pages import ANNIFARM_PAGE, APTEKA24_PAGE, VITAMINI_PAGE, ZEGIN_PAGE


@pytest.mark.parametrize(
    ("package", "page", "expected"),
    [
        (
            annifarm,
            ANNIFARM_PAGE,
            {
                "name": "Solgar Vitamin C 1000mg",
                "brand": None,
                "price": 1200.0,
                "discount_price": None,
                "url": "https://annifarm.com.mk/p/vitamin-c/",
            },
        ),
        (
            apteka24,
            APTEKA24_PAGE,
            {
                "name": "Omega 3 1000mg",
                "brand": "Now Foods",
                "price": 1000.0,
                "discount_price": 800.0,
                "url": "https://apteka24.mk/p/omega-3/",
            },
        ),
        (
            vitamini,
            VITAMINI_PAGE,
            {
                "name": "NOW Magnesium",
                "brand": "Now",
                "price": 1200.0,
                "discount_price": 990.0,
                "url": "https://vitamini.mk/p/magnesium/",
            },
        ),
        (
            zegin,
            ZEGIN_PAGE,
            {
                "name": "Zinc 25 mg",
                "brand": None,
                "price": 1200.0,
                "discount_price": 990.0,
                "url": "https://zegin.com.mk/products/zinc-25",
            },
        ),
    ],
    ids=["annifarm", "apteka24", "vitamini", "zegin"],
)
def test_parses_a_catalog_page(package: ModuleType, page: str, expected: dict) -> None:
    cards = package.extract_cards_from_page(get_soup(page))

    [product] = package.get_products_from_cards(cards)

    assert {**product, "url": str(product["url"])} == expected


@pytest.mark.parametrize("package", [annifarm, apteka24, vitamini, zegin])
def test_raises_when_a_page_has_no_cards(package: ModuleType) -> None:
    with pytest.raises(CardsNotFoundError):
        package.extract_cards_from_page(get_soup("<main><p>Nothing found</p></main>"))


def test_apteka24_drops_cards_with_a_price_range() -> None:
    cards = apteka24.extract_cards_from_page(get_soup(APTEKA24_PAGE))

    names = [c.select_one("h2").get_text(strip=True) for c in cards]
    assert names == ["Omega 3 1000mg", "No price"]


@pytest.mark.parametrize(
    ("name", "brand"),
    [("Spirulina Pacifica 500mg", "Nutrex"), ("BioAstin 12mg", "Nutrex"), ("Omega 3", "Now")],
)
def test_vitamini_infers_the_brand_from_the_name(name: str, brand: str) -> None:
    page = f"""
    <main><div class="wd-product">
      <h3 class="wd-entities-title"><a href="https://vitamini.mk/p/1/">{name}</a></h3>
      <div class="product-wrapper"><span class="price">
        <span class="amount">700,00 ден</span>
      </span></div>
    </div></main>
    """

    [product] = vitamini.get_products_from_cards(vitamini.extract_cards_from_page(get_soup(page)))

    assert product["brand"] == brand


def test_vitamini_drops_a_card_without_a_price_and_keeps_the_rest() -> None:
    page = """
    <main>
      <div class="wd-product">
        <h3 class="wd-entities-title"><a href="https://vitamini.mk/p/1/">Omega 3</a></h3>
      </div>
      <div class="wd-product">
        <h3 class="wd-entities-title"><a href="https://vitamini.mk/p/2/">Zinc 25mg</a></h3>
        <div class="product-wrapper"><span class="price">
          <span class="amount">700,00 ден</span>
        </span></div>
      </div>
    </main>
    """

    cards = vitamini.extract_cards_from_page(get_soup(page))

    assert [p["name"] for p in vitamini.get_products_from_cards(cards)] == ["Zinc 25mg"]


def test_zegin_uses_the_original_price_when_not_discounted() -> None:
    page = ZEGIN_PAGE.replace('<div class="price--listed">1.200,00 ден.</div>', "")

    [product] = zegin.get_products_from_cards(zegin.extract_cards_from_page(get_soup(page)))

    assert (product["price"], product["discount_price"]) == (990.0, None)


@pytest.mark.parametrize("package", [annifarm, apteka24, vitamini])
def test_woocommerce_catalog_url(package: ModuleType) -> None:
    get_url = package.get_catalog_url_by_page

    assert get_url("https://x.mk/c/", 2, "?orderby=price") == "https://x.mk/c/page/2/?orderby=price"
    assert get_url("https://x.mk/c/", 3, "") == "https://x.mk/c/page/3/"
    assert get_url("https://x.mk/c/", 3, None) == "https://x.mk/c/page/3/"


def test_zegin_catalog_url() -> None:
    assert (
        zegin.get_catalog_url_by_page("https://zegin.com.mk/search", 3, "?q=vitamin")
        == "https://zegin.com.mk/search?q=vitamin&page=3"
    )
