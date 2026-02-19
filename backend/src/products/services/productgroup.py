import logging

from django.db.models import Prefetch, QuerySet

from ..models import ProductGroup
from . import product as product_service

logger = logging.getLogger(__name__)


def list_productgroups() -> QuerySet:
    return (
        ProductGroup.objects.filter(is_reviewed=True)
        .select_related("brand")
        .prefetch_related(
            Prefetch("product_set", queryset=product_service.base_products_qs())
        )
        .prefetch_related("categories")
    )
