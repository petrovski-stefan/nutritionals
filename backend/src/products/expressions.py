from django.db.models import F
from django.db.models.functions import Round


def discount_percent(*, prefix: str = "") -> Round:
    """
    Return the rounded discount percent of a product, None when it has no discount.
    Pass prefix="product__" to compute it from a model related to Product
    """

    return Round((1 - F(f"{prefix}discount_price") / F(f"{prefix}price")) * 100)
