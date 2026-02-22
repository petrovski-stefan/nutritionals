from celery import shared_task

from products.services import productgroup as productgroup_service

from .models import Product


@shared_task
def group_products() -> None:
    for p in Product.objects.filter(is_reviewed=True):
        try:
            productgroup_service.assign_product_to_group(p)
        except Exception:
            pass
