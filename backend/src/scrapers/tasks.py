import logging

from celery import shared_task
from products.models import Pharmacy, PharmacyCatalog
from products.services.product import create_or_update_scraped_product

from .shared.client import get_random_useragent, make_request_and_get_html
from .shared.imports import load_pharmacy_fns
from .shared.soup import get_soup

logger = logging.getLogger(__name__)


@shared_task
def schedule_pharmacy_catalogs_scrape() -> None:
    catalogs = list(
        PharmacyCatalog.objects.filter(is_active=True).values_list(
            "id", "pharmacy__name"
        )
    )

    for catalog_id, pharmacy_name in catalogs:
        schedule_catalog_page_scrape.delay(catalog_id, pharmacy_name)

    unique_pharmacy_names = {n for _, n in catalogs}
    logger.info(f"Scheduled catalog scrape for: {', '.join(unique_pharmacy_names)}")


@shared_task
def schedule_catalog_page_scrape(catalog_id: int, pharmacy_name: str) -> None:
    catalog = PharmacyCatalog.objects.select_related("category").get(id=catalog_id)

    try:
        (
            get_catalog_url_by_page,
            *_,
        ) = load_pharmacy_fns(pharmacy_name)

    except ImportError as e:
        logger.error(e)
        return

    start = 0 if catalog.page_numbering_starts_at_zero else 1
    end_page_num = catalog.max_pages

    for i in range(end_page_num):
        page_num = start + i

        url = get_catalog_url_by_page(
            catalog.url_without_page,
            page_num,
            catalog.queryparams_string,
        )
        headers = {"User-Agent": get_random_useragent()}

        category_name = catalog.category.name if catalog.category is not None else ""

        scrape_pharmacy_page.delay(pharmacy_name, url, headers, page_num, category_name)


@shared_task
def scrape_pharmacy_page(
    pharmacy_name: str, url: str, headers: dict, page_num: int, category_name: str
) -> None:
    pharmacy = Pharmacy.objects.get(name=pharmacy_name)

    try:
        (
            _,
            extract_cards_from_page,
            get_products_from_cards,
        ) = load_pharmacy_fns(pharmacy_name)

    except ImportError as e:
        logger.error(e)

        return

    try:
        html = make_request_and_get_html(url, headers)
    except Exception as e:
        logger.warning(f"({pharmacy_name}) Failed to process page {page_num}: {e}")

        return

    soup = get_soup(html)

    try:
        cards = extract_cards_from_page(soup)
    except Exception as e:
        logger.warning(f"({pharmacy_name}) Failed extracting cards: {e}")

        return

    products = get_products_from_cards(cards)
    to_db = []

    for product_data in products:
        p = create_or_update_scraped_product(
            pharmacy=pharmacy, validated_data=product_data, category_name=category_name
        )
        to_db.append(p)

    logger.info(
        f"({pharmacy_name}) Page: {page_num} Found: {len(products)} To DB: {len(to_db)}"
    )
