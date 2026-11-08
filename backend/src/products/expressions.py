from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Case, CharField, F, FloatField, Value, When
from django.db.models.expressions import CombinedExpression
from django.db.models.functions import Coalesce, Concat, Greatest, Lower, Round
from django.db.models.lookups import IContains


def discount_percent(*, prefix: str = "") -> Round:
    """
    Return the rounded discount percent of a product, None when it has no discount.
    Pass prefix="product__" to compute it from a model related to Product
    """

    return Round((1 - F(f"{prefix}discount_price") / F(f"{prefix}price")) * 100)


def product_search_text(*, prefix: str = "") -> Concat:
    """
    Return a product's lowercase brand name and normalized name joined by a space.
    Searching it finds a product by brand whether or not normalization cut the brand
    from normalized_name. Pass prefix="product__" to build it from a related model
    """

    return Concat(
        Coalesce(Lower(f"{prefix}brand__name"), Value("")),
        Value(" "),
        F(f"{prefix}normalized_name"),
        output_field=CharField(),
    )


def search_match_score(*, latin_q: str, prefix: str = "") -> CombinedExpression:
    """
    Return how well a product matches latin_q: the higher trigram similarity of its
    normalized name and its search text, plus 0.3 when the search text contains
    latin_q. Pass prefix="product__" to score from a model related to Product
    """

    search_text = product_search_text(prefix=prefix)
    similarity = Greatest(
        TrigramSimilarity(f"{prefix}normalized_name", latin_q),
        TrigramSimilarity(search_text, latin_q),
    )
    contains_boost = Case(
        When(IContains(search_text, latin_q), then=Value(0.3)),
        default=Value(0.0),
        output_field=FloatField(),
    )

    return similarity + contains_boost
