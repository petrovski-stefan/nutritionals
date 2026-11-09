import logging

import requests
from celery import shared_task
from products.models import Pharmacy, PharmacyCatalog
from products.services.product import create_or_update_scraped_product

from .shared.client import get_random_useragent, make_request_and_get_html
from .shared.exceptions import CardsNotFoundError
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

        scrape_pharmacy_page.delay(
            pharmacy_name, url, headers, page_num, category_name, is_first_page=(i == 0)
        )


@shared_task
def scrape_pharmacy_page(
    pharmacy_name: str,
    url: str,
    headers: dict,
    page_num: int,
    category_name: str,
    is_first_page: bool = False,
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
    except requests.RequestException as e:
        logger.warning(
            "(%s) Page %s request failed: %r - %s", pharmacy_name, page_num, e, url
        )

        return

    soup = get_soup(html)

    try:
        cards = extract_cards_from_page(soup)
    except CardsNotFoundError:
        # max_pages is set by hand, so pages past the real last page come back empty
        if is_first_page:
            logger.error(
                "(%s) Page %s has no product cards, check the site and the selectors - %s",
                pharmacy_name,
                page_num,
                url,
            )
        else:
            logger.info(
                "(%s) Page %s has no product cards, end of catalog - %s",
                pharmacy_name,
                page_num,
                url,
            )

        return

    products = get_products_from_cards(cards)

    if cards and not products:
        logger.warning(
            "(%s) Page %s: none of the %s cards passed validation, check the selectors - %s",
            pharmacy_name,
            page_num,
            len(cards),
            url,
        )

        return

    created_count = 0
    updated_count = 0
    failed_count = 0

    for product_data in products:
        try:
            _, created = create_or_update_scraped_product(
                pharmacy=pharmacy, validated_data=product_data, category_name=category_name
            )
        except Exception:
            # One bad product must not drop the rest of the page
            logger.exception(
                "(%s) Page %s: failed to save product %r - %s",
                pharmacy_name,
                page_num,
                product_data["name"],
                product_data["url"],
            )
            failed_count += 1

            continue

        if created:
            created_count += 1
        else:
            updated_count += 1

    logger.info(
        "(%s) Page %s: %s cards, %s valid, %s created, %s updated, %s failed",
        pharmacy_name,
        page_num,
        len(cards),
        len(products),
        created_count,
        updated_count,
        failed_count,
    )
