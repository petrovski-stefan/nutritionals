import logging

# from datetime import timedelta
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from products.models import Pharmacy, Product
from products.services import (
    update_all_product_discovers_status_by_run_started_at,
    update_or_create_many_product_discovers,
)

from .models import ScrapeEvent
from .services import create_scrape_event
from .shared.client import delay, get_random_useragent, make_request
from .shared.soup import get_soup

logger_24apteka = logging.getLogger("24APTEKA-DISCOVER")


@shared_task
def scrape_apteka24() -> None:
    from .apteka24.parsers import (
        extract_max_page_num,
        extract_product_data,
        extract_products_from_page,
    )

    if settings.DEBUG:
        Product.objects.filter(pharmacy=Product.PharmacyChoices.APTEKA24).delete()

    max_page_num = None

    for page_num in range(1, settings.APTEKA24_MAX_PAGES):
        url = f"{settings.APTEKA24_LIST_BASE_URL}{page_num}/"
        headers = {"User-Agent": get_random_useragent()}

        html = make_request(url, headers)
        soup = get_soup(html)

        if max_page_num is None:
            max_page_num = extract_max_page_num(soup)

        products_cards = extract_products_from_page(soup)
        products = [extract_product_data(p, url) for p in products_cards]

        # TODO: atomic transaction
        # TODO: create or update
        for product in products:
            create_scrape_event(product, ScrapeEvent.ScrapeTypeChoices.PRODUCT_LIST)
            product_obj = Product(pharmacy=Product.PharmacyChoices.APTEKA24, **product)
            product_obj.full_clean()
            product_obj.save()

        if page_num == max_page_num:
            break

    delay(settings.APTEKA24_DELAY_IN_SECONDS)


@shared_task  # TODO: Retry handling
def discover_apteka24() -> None:
    from .apteka24.parsers import (
        extract_max_page_num,
        extract_product_url_for_discover,
        extract_products_from_page,
    )

    pharmacy = Pharmacy.objects.get(name="Apteka24")

    run_started_at = timezone.now()
    pagination_max_page_num = None
    total_urls = 0
    total_pages = 0
    failed_pages = []

    logger_24apteka.info(f"Started discovering at {run_started_at} ...")

    for page_num in range(1, pharmacy.catalog_max_pages + 1):
        try:
            url = f"{pharmacy.catalog_base_url}{page_num}/"
            headers = {"User-Agent": get_random_useragent()}

            html = make_request(url=url, headers=headers, logger=logger_24apteka)
            soup = get_soup(html)

            if pagination_max_page_num is None:
                pagination_max_page_num = extract_max_page_num(soup)
                logger_24apteka.info(
                    f"Discovered total {pagination_max_page_num} pages in catalog."
                )

            product_cards = extract_products_from_page(soup)
            product_urls = [extract_product_url_for_discover(p) for p in product_cards]

            product_urls_len = len(product_urls)
            total_urls += product_urls_len
            total_pages += 1

            update_or_create_many_product_discovers(
                pharmacy=pharmacy,
                run_started_at=run_started_at,
                product_urls=product_urls,
            )

            logger_24apteka.info(
                f"Processed page {page_num}/{pagination_max_page_num}: {product_urls_len} URLs found."  # noqa
            )

            if page_num == pagination_max_page_num:
                break

            delay(pharmacy.catalog_scraping_delay_in_seconds)

        except Exception as e:  # TODO: list possible exceptions instead of base class
            logger_24apteka.warning(f"Failed to process page {page_num}: {e}")
            failed_pages.append(page_num)

            continue

    # Finalize
    update_all_product_discovers_status_by_run_started_at(
        pharmacy=pharmacy, run_started_at=run_started_at
    )

    logger_24apteka.info(
        f"[{run_started_at}] Discovery complete. "
        f"Pages processed: {total_pages}, URLs discovered: {total_urls}, "
        f"Failed pages: {failed_pages or 'none'}."
    )


# @shared_task
# def schedule_product_detail_scraping(batch_size: int = 10) -> None:
#     cutoff = timezone.now() - timedelta(hours=24)
#     stale = Product.objects.filter(updated_at__lt=cutoff)[:batch_size]

#     for product in stale:
#         print(product)


# def scrape_detail() -> None:
#     pass
