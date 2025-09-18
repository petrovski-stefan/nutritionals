from celery import shared_task
from django.conf import settings
from products.models import Product

from .models import ScrapeEvent
from .services import create_scrape_event
from .shared.client import delay, get_random_useragent, make_request
from .shared.soup import get_soup


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


# def scrape_annifarm() -> None:
#     from .annifarm.constants import BASE_URL, DELAY_IN_SECONDS, MAX_PAGES
#     from .annifarm.parsers import extract_max_page_num

#     Product.objects.filter(
#         pharmacy=Product.PharmacyChoices.ANNIFARM
#     ).delete()  # TODO: REMOVE before production

#     max_page_num = None

#     for page_num in range(1, 3):
#         url = f"{BASE_URL}{page_num}/"
#         headers = {
#             "User-Agent": get_random_useragent(),
#             "Referer": "https://www.google.com/",
#             "Connection": "keep-alive",
#         }

#         html = make_request(url, headers)
#         soup = get_soup(html)

#         if max_page_num is None:
#             max_page_num = extract_max_page_num(soup)

#     print("MAX NUM", max_page_num)
