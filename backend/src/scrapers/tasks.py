import logging
from datetime import timedelta

from celery import shared_task
from django.db.models import Q
from django.utils import timezone
from products.models import Pharmacy, ProductDiscover
from products.services import BrandService, ProductDiscoverService, ProductService

from .shared.client import delay, get_random_useragent, make_request_and_get_html
from .shared.imports import load_pharmacy_fns
from .shared.soup import get_soup
from .shared.validation import get_validated_product

logger = logging.getLogger(__name__)


@shared_task
def schedule_pharmacies_catalogue_scrape() -> None:
    pharmacies = list(Pharmacy.objects.values_list("name", flat=True))

    for pharmacy in pharmacies:
        headers = {"User-Agent": get_random_useragent()}
        scrape_pharmacy_catalog.delay(pharmacy, headers)

    logger.info(f"Scheduled catalog scrape for: {', '.join(pharmacies)} ...")


@shared_task  # TODO: Retry handling
def scrape_pharmacy_catalog(pharmacy_name: str, headers: dict) -> None:
    pharmacy = Pharmacy.objects.get(name=pharmacy_name)

    run_started_at = timezone.now()
    failed_pages_count = 0

    logger.info(f"Started pharmacy catalog scraping for {pharmacy_name} ...")

    try:
        (
            get_catalog_url_by_page,
            extract_cards_from_page,
            get_products_from_cards,
            _,
        ) = load_pharmacy_fns(pharmacy_name)

    except ImportError as e:
        logger.error(e)
        return

    end_page_num = pharmacy.catalog_max_pages

    for page_num in range(1, end_page_num + 1):
        url = get_catalog_url_by_page(
            pharmacy.catalog_base_url, page_num, pharmacy.catalog_url_queryparams_string
        )

        try:
            html = make_request_and_get_html(url, headers)
        except Exception as e:
            logger.warning(
                f"({pharmacy_name}) Failed to process page {page_num}: {e} ..."
            )
            failed_pages_count += 1

            continue

        soup = get_soup(html)

        try:
            cards = extract_cards_from_page(soup)
        except Exception as e:
            logger.warning(
                f"Extracting product cards failed: {e} ..."  # noqa
            )
            failed_pages_count += 1
            continue

        products = get_products_from_cards(cards)
        urls = [product["url"] for product in products]

        ProductDiscoverService.update_or_create_many_product_discovers(
            pharmacy=pharmacy,
            run_started_at=run_started_at,
            product_urls=urls,
        )

        if pharmacy.can_the_product_be_updated_from_catalog:
            logger.info(products)

        logger.info(
            f"({pharmacy_name}) Page: {page_num}/{end_page_num} Found: {len(urls)}"
        )

        delay(pharmacy.catalog_scraping_delay_in_seconds)

    # Finalize
    ProductDiscoverService.update_all_product_discovers_status_by_run_started_at(
        pharmacy=pharmacy, run_started_at=run_started_at
    )

    logger.info(
        f"({pharmacy_name}) Catalog scrape finished with {failed_pages_count} failed pages ... "
    )

    if failed_pages_count > 0:
        pass  # TODO: handle task retry


@shared_task
def schedule_product_detail_scrape(limit: int = 15) -> None:
    cutoff = timezone.now() - timedelta(hours=24)
    next_for_scraping = (
        ProductDiscover.objects.select_related("pharmacy")
        .filter(
            Q(product_last_scraped_at__lte=cutoff)
            | Q(product_last_scraped_at__isnull=True)
        )
        .filter(pharmacy__can_the_product_be_updated_from_catalog=False)[:limit]
    )

    headers = {"User-Agent": get_random_useragent()}
    for d in next_for_scraping:
        scrape_product_detail.delay(d.url, headers)

    logger.info(f"Scheduled {next_for_scraping.count()} products for scrape")


@shared_task
def scrape_product_detail(url: str, headers: dict[str, str]) -> None:
    product_discover = ProductDiscover.objects.select_related(
        "product", "pharmacy"
    ).get(url=url)
    product = product_discover.product
    pharmacy_name = product_discover.pharmacy.name
    (_, _, _, get_product_from_page) = load_pharmacy_fns(pharmacy_name)

    try:
        html = make_request_and_get_html(url, headers)
    except Exception:
        return  # TODO: trigger task retry

    soup = get_soup(html)
    data = get_product_from_page(soup=soup)

    validated_data = get_validated_product(data=data, klass=None)  # TODO: validation
    # create product scrape event
    if validated_data is None:
        return

    # description = validated_data.pop("description")  # noqa

    brand_name = validated_data.pop("brand", None)
    brand = BrandService.get_or_create_brand_by_name(name=brand_name)

    ProductService.create_or_update_scraped_product(
        product=product,
        product_discover=product_discover,
        brand=brand,
        validated_data=validated_data,
    )


# Call openai for summarization of description if none
# and create product description with description + tags
# Or even submit a new child task


##########
# V2
