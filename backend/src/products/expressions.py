from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Case, F, FloatField, Value, When
from django.db.models.expressions import CombinedExpression
from django.db.models.functions import Round


def discount_percent(*, prefix: str = "") -> Round:
    """
    Return the rounded discount percent of a product, None when it has no discount.
    Pass prefix="product__" to compute it from a model related to Product
    """

    return Round((1 - F(f"{prefix}discount_price") / F(f"{prefix}price")) * 100)


def search_match_score(*, latin_q: str, prefix: str = "") -> CombinedExpression:
    """
    Return how well a product's normalized name matches latin_q: its trigram similarity,
    plus 0.3 when the name contains latin_q. Pass prefix="product__" to score from a
    model related to Product
    """

    field = f"{prefix}normalized_name"
    contains_boost = Case(
        When(**{f"{field}__icontains": latin_q}, then=Value(0.3)),
        default=Value(0.0),
        output_field=FloatField(),
    )

    return TrigramSimilarity(field, latin_q) + contains_boost
