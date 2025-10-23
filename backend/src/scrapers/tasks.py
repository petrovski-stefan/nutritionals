import logging
from datetime import timedelta

from bs4 import BeautifulSoup
from celery import shared_task
from django.db.models import Q
from django.utils import timezone
from products.models import Brand, Pharmacy, Product, ProductDiscover
from pydantic import ValidationError as PydanticValidationError

from .shared.client import delay, get_random_useragent, make_request
from .shared.soup import get_soup
from .validators import Product as PydanticProduct

# -------------------------------
# Local helper functions
# -------------------------------


def validate_product_scraped_data(*, data: dict, logger: logging.Logger) -> dict | None:
    try:
        return PydanticProduct(**data).model_dump()

    except PydanticValidationError as e:
        logger.warning(f"Validation failed: {e.errors()}")

    except Exception as e:
        logger.warning(f"Exception while validating: {e}")

    return None


def get_or_create_brand_by_name(
    *, name: str | None, logger: logging.Logger
) -> Brand | None:
    if not name:
        return None

    brand, is_created = Brand.objects.get_or_create(name=name)
    log_action = "created" if is_created else "loaded"
    logger.info(f"Succesfully {log_action} brand ({brand.pk}) {brand.name} ...")

    return brand


def _create_scraped_product(
    *,
    product_discover: ProductDiscover,
    brand: Brand | None,
    validated_data: dict,
    product_last_scraped_at: timezone.datetime,
) -> Product:
    product = Product.objects.create(brand=brand, **validated_data)

    product_discover.product = product
    product_discover.product_last_scraped_at = product_last_scraped_at
    product_discover.save(update_fields=["product", "product_last_scraped_at"])

    return product


def _update_scraped_product(
    *,
    product: Product,
    product_discover: ProductDiscover,
    validated_data: dict,
    product_last_scraped_at: timezone.datetime,
) -> Product:
    product.price = validated_data.get("price")
    product.discount_price = validated_data.get("discount_price")
    product.is_in_stock = validated_data.get("is_in_stock")
    product.save(update_fields=["price", "discount_price", "is_in_stock", "updated_at"])

    product_discover.product_last_scraped_at = product_last_scraped_at
    product_discover.save(update_fields=["product_last_scraped_at"])

    return product


def create_or_update_scraped_product(
    *,
    product: Product | None,
    product_discover: ProductDiscover,
    brand: Brand | None,
    validated_data: dict,
    logger: logging.Logger,
) -> None:
    product_last_scraped_at = timezone.now()

    if product is None:
        product = _create_scraped_product(
            product_discover=product_discover,
            brand=brand,
            validated_data=validated_data,
            product_last_scraped_at=product_last_scraped_at,
        )

        logger.info(
            f"Successfully added a new product ({product.pk}) {product.name} ..."
        )
    else:
        product = _update_scraped_product(
            product=product,
            product_discover=product_discover,
            validated_data=validated_data,
            product_last_scraped_at=product_last_scraped_at,
        )
        logger.info(f"Successfully updated product ({product.pk}) {product.name} ...")


def update_or_create_many_product_discovers(
    *,
    pharmacy: Pharmacy,
    run_started_at: timezone.datetime,
    product_urls: list[str],
    logger: logging.Logger | None = None,
) -> None:
    if len(product_urls) == 0:
        return

    for url in product_urls:
        ProductDiscover.objects.update_or_create(
            url=url,
            pharmacy=pharmacy,
            defaults={
                "is_active": True,
                "last_seen_at": run_started_at,
            },
            create_defaults={
                "is_active": True,
                "last_seen_at": run_started_at,
            },
        )


def update_all_product_discovers_status_by_run_started_at(
    *,
    pharmacy: Pharmacy,
    run_started_at: timezone.datetime,
    logger: logging.Logger | None = None,
):
    ProductDiscover.objects.filter(
        pharmacy=pharmacy, last_seen_at__lt=run_started_at
    ).update(is_active=False)


def extract_data_from_product_by_pharmacy(
    *, pharmacy_name: str, url: str, soup: BeautifulSoup, logger: logging.Logger
) -> dict | None:
    data = None

    if pharmacy_name == "Apteka24":
        from .apteka24.parsers import extract_product_detail_data

        data = extract_product_detail_data(soup)
    # elif ...

    if data is not None:
        logger.info(f"From {url} extracted following raw data {data} ...")

        return data
    else:
        logger.warning(
            f"A parser for {pharmacy_name} not present and task is ending ..."
        )
        return None


# -------------------------------
# Celery Tasks
# -------------------------------


@shared_task  # TODO: Retry handling
def discover_apteka24() -> None:
    from .apteka24.parsers import (
        extract_max_page_num,
        extract_product_url_for_discover,
        extract_products_from_page,
    )

    logger = logging.getLogger("24APTEKA-DISCOVER")

    pharmacy = Pharmacy.objects.get(name="Apteka24")

    run_started_at = timezone.now()
    pagination_max_page_num = None
    total_urls = 0
    total_pages = 0
    failed_pages = []

    logger.info(f"Started discovering at {run_started_at} ...")

    for page_num in range(1, pharmacy.catalog_max_pages + 1):
        try:
            url = f"{pharmacy.catalog_base_url}{page_num}/"
            headers = {"User-Agent": get_random_useragent()}

            html = make_request(url=url, headers=headers, logger=logger)
            soup = get_soup(html)

            if pagination_max_page_num is None:
                pagination_max_page_num = extract_max_page_num(soup)
                logger.info(
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

            logger.info(
                f"Processed page {page_num}/{pagination_max_page_num}: {product_urls_len} URLs found."  # noqa
            )

            if page_num == pagination_max_page_num:
                break

            delay(pharmacy.catalog_scraping_delay_in_seconds)

        except Exception as e:  # TODO: list possible exceptions instead of base class
            logger.warning(f"Failed to process page {page_num}: {e}")
            failed_pages.append(page_num)

            continue

    # Finalize
    update_all_product_discovers_status_by_run_started_at(
        pharmacy=pharmacy, run_started_at=run_started_at
    )

    logger.info(
        f"[{run_started_at}] Discovery complete. "
        f"Pages processed: {total_pages}, URLs discovered: {total_urls}, "
        f"Failed pages: {failed_pages or 'none'}."
    )


@shared_task
def schedule_product_detail_scrape(limit: int = 15) -> None:
    from .shared.client import get_random_useragent

    logger = logging.getLogger("SCRAPE-SCHEDULER")

    cutoff = timezone.now() - timedelta(hours=24)
    next_for_scraping = ProductDiscover.objects.filter(
        Q(product_last_scraped_at__lte=cutoff) | Q(product_last_scraped_at__isnull=True)
    )[:limit]

    num_scheduled = next_for_scraping.count()
    if num_scheduled > 0:
        logger.info(f"Scheduled {num_scheduled} products for scraping ...")
    else:
        logger.info("No more products to be scheduled from scraping ...")
        return

    headers = {"User-Agent": get_random_useragent()}
    for d in next_for_scraping:
        scrape_product_detail.delay(d.url, headers)


@shared_task
def scrape_product_detail(url: str, headers: dict[str, str]) -> None:
    logger = logging.getLogger("PRODUCT-DETAIL-SCRAPE")

    product_discover = ProductDiscover.objects.select_related(
        "product", "pharmacy"
    ).get(url=url)
    product = product_discover.product
    pharmacy_name = product_discover.pharmacy.name

    try:
        html = make_request(url=url, headers=headers, logger=logger)
    except Exception:
        return  # TODO: trigger task retry

    soup = get_soup(html)
    data = extract_data_from_product_by_pharmacy(
        pharmacy_name=pharmacy_name, url=url, soup=soup, logger=logger
    )
    validated_data = validate_product_scraped_data(data=data, logger=logger)
    # create product scrape event
    if validated_data is None:
        return

    description = validated_data.pop("description")  # noqa

    brand_name = validated_data.pop("brand", None)
    brand = get_or_create_brand_by_name(name=brand_name, logger=logger)

    create_or_update_scraped_product(
        product=product,
        product_discover=product_discover,
        brand=brand,
        validated_data=validated_data,
        logger=logger,
    )


# Call openai for summarization of description if none
# and create product description with description + tags
# Or even submit a new child task
