import logging
from datetime import timedelta

import requests
from celery import shared_task
from django.utils import timezone
from products.models import Pharmacy, PharmacyCatalog
from products.services import pharmacy as pharmacy_service
from products.services.product import create_or_update_scraped_product

from .shared.client import get_random_useragent, make_request_and_get_html
from .shared.exceptions import CardsNotFoundError
from .shared.imports import load_pharmacy_fns
from .shared.soup import get_soup

logger = logging.getLogger(__name__)

# Assumes the catalog scrape is scheduled daily, so 36 hours means a run was missed.
# Raise it if the beat schedule runs less often
STALE_AFTER_HOURS = 36


@shared_task
def check_scrape_freshness() -> None:
    """Log an error for each pharmacy with an active catalog that wasn't scraped recently"""

    scraped_before = timezone.now() - timedelta(hours=STALE_AFTER_HOURS)
    stale_pharmacies = pharmacy_service.list_stale_pharmacies(scraped_before=scraped_before)

    for name, last_scraped_at in stale_pharmacies:
        logger.error(
            "(%s) Not scraped since %s, check its catalogs and scraper",
            name,
            last_scraped_at or "never",
            extra={"pharmacy": name, "last_scraped_at": last_scraped_at},
        )

    if not stale_pharmacies:
        logger.info(
            "Every pharmacy with an active catalog was scraped in the last %s hours",
            STALE_AFTER_HOURS,
        )


@shared_task
def schedule_pharmacy_catalogs_scrape() -> None:
    catalogs = list(
        PharmacyCatalog.objects.filter(is_active=True).values_list(
            "id", "pharmacy__name"
        )
    )

    for catalog_id, pharmacy_name in catalogs:
        schedule_catalog_page_scrape.delay(catalog_id, pharmacy_name)

    pharmacy_names = sorted({n for _, n in catalogs})
    logger.info(
        "Scheduled %s catalogs for: %s",
        len(catalogs),
        ", ".join(pharmacy_names),
        extra={"catalog_count": len(catalogs), "pharmacies": pharmacy_names},
    )


@shared_task
def schedule_catalog_page_scrape(catalog_id: int, pharmacy_name: str) -> None:
    catalog = PharmacyCatalog.objects.select_related("category").get(id=catalog_id)

    try:
        (
            get_catalog_url_by_page,
            *_,
        ) = load_pharmacy_fns(pharmacy_name)

    except ImportError:
        logger.exception(
            "(%s) Cannot load the scraper package", pharmacy_name, extra={"pharmacy": pharmacy_name}
        )
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
    page_context = {"pharmacy": pharmacy_name, "page": page_num, "url": url}

    pharmacy = Pharmacy.objects.get(name=pharmacy_name)

    try:
        (
            _,
            extract_cards_from_page,
            get_products_from_cards,
        ) = load_pharmacy_fns(pharmacy_name)

    except ImportError:
        logger.exception("(%s) Cannot load the scraper package", pharmacy_name, extra=page_context)

        return

    try:
        html = make_request_and_get_html(url, headers)
    except requests.RequestException as e:
        logger.warning(
            "(%s) Page %s request failed: %r - %s",
            pharmacy_name,
            page_num,
            e,
            url,
            extra=page_context,
        )

        return

    soup = get_soup(html)

    try:
        cards = extract_cards_from_page(soup)
    except CardsNotFoundError:
        cards = None

    # Logged outside the handler, since the traceback would only show the vendor's raise.
    # max_pages is set by hand, so pages past the real last page come back empty
    if cards is None:
        if is_first_page:
            logger.error(
                "(%s) Page %s has no product cards, check the site and the selectors - %s",
                pharmacy_name,
                page_num,
                url,
                extra=page_context,
            )
        else:
            logger.info(
                "(%s) Page %s has no product cards, end of catalog - %s",
                pharmacy_name,
                page_num,
                url,
                extra=page_context,
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
            extra={**page_context, "card_count": len(cards)},
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
                extra={
                    **page_context,
                    "product_name": product_data["name"],
                    "product_url": str(product_data["url"]),
                },
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
        extra={
            **page_context,
            "card_count": len(cards),
            "valid_count": len(products),
            "created_count": created_count,
            "updated_count": updated_count,
            "failed_count": failed_count,
        },
    )
