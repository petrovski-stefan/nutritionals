import time

from celery import shared_task
from products.models import Product

from .shared.client import make_request
from .shared.soup import get_soup
from .shared.user_agents import get_random_useragent


@shared_task
def scrape_apteka24() -> None:
    from .apteka24.constants import BASE_URL, DELAY_IN_SECONDS
    from .apteka24.parsers import extract_product_data, extract_products_from_page

    Product.objects.all().delete()  # TODO: remove after testing

    for i in range(2):  # TODO: add a stop condition
        url = f"{BASE_URL}/{i}/"
        headers = {"User-Agent": get_random_useragent()}

        html = make_request(url, headers)
        soup = get_soup(html)

        products_cards = extract_products_from_page(soup)
        products = [extract_product_data(p) for p in products_cards]

        for product in products:
            product_obj = Product(pharmacy=Product.PharmacyChoices.APTEKA24, **product)
            product_obj.full_clean()
            product_obj.save()

    time.sleep(DELAY_IN_SECONDS)
