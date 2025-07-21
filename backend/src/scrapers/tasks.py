from celery import shared_task
from products.models import Product

from .shared.client import delay, get_random_useragent, make_request
from .shared.soup import get_soup


@shared_task
def scrape_apteka24() -> None:
    from .apteka24.constants import BASE_URL, DELAY_IN_SECONDS
    from .apteka24.parsers import (
        extract_max_page_num,
        extract_product_data,
        extract_products_from_page,
    )

    Product.objects.filter(
        pharmacy=Product.PharmacyChoices.APTEKA24
    ).delete()  # TODO: REMOVE before production

    max_page_num = None

    for page_num in range(1, 3):  # TODO: CHANGE 3 to MAX_PAGES before production
        url = f"{BASE_URL}{page_num}/"
        headers = {"User-Agent": get_random_useragent()}

        html = make_request(url, headers)
        soup = get_soup(html)

        if max_page_num is None:
            max_page_num = extract_max_page_num(soup)

        products_cards = extract_products_from_page(soup)
        products = [extract_product_data(p) for p in products_cards]

        # TODO: atomic transaction
        # TODO: create or update
        for product in products:
            product_obj = Product(pharmacy=Product.PharmacyChoices.APTEKA24, **product)
            product_obj.full_clean()
            product_obj.save()

        if page_num == max_page_num:
            break

    delay(DELAY_IN_SECONDS)
