from typing import Literal

from django.db.models import (
    Count,
    F,
    Max,
    Min,
    OrderBy,
    OuterRef,
    Prefetch,
    Q,
    QuerySet,
    Subquery,
)
from django.db.models.functions import Coalesce

from ..expressions import discount_percent, public_product_q, search_match_score
from ..models import Category, Product, ProductGroup, ProductGroupCategory
from . import product as product_service


def public_products_prefetch() -> Prefetch:
    """Prefetch the public products of each group, as ProductListSerializer reads them"""

    return Prefetch(
        "product_set",
        queryset=Product.objects.public()
        .with_discount_percent()
        .select_related("pharmacy", "brand"),
    )


# "price": lowest current price first. "discount": best discount first
ProductGroupOrdering = Literal["price", "discount"]


def _lowest_price_subquery() -> Subquery:
    """
    The group's lowest current price over all its public products. A subquery, not an
    aggregate: when searching, the group's product join is narrowed to the matching products,
    but the price shown and sorted on is the cheapest of every offer
    """

    return Subquery(
        Product.objects.public()
        .filter(group=OuterRef("pk"))
        .annotate(current_price=Coalesce("discount_price", "price"))
        .order_by("current_price")
        .values("current_price")[:1]
    )


def _best_discount_subquery() -> Subquery:
    """The best discount percent among the group's public discounted products"""

    return Subquery(
        Product.objects.public()
        .filter(group=OuterRef("pk"), discount_price__isnull=False)
        .annotate(percent=discount_percent())
        .order_by("-percent")
        .values("percent")[:1]
    )


def _ordering_annotations(
    *, ordering: ProductGroupOrdering
) -> tuple[dict[str, Subquery], list[OrderBy | str]]:
    """What the ordering sorts on, and the order. Groups without a value go last; id breaks ties"""

    if ordering == "price":
        return (
            {"lowest_price": _lowest_price_subquery()},
            [F("lowest_price").asc(nulls_last=True), "id"],
        )

    return (
        {"best_discount_percent": _best_discount_subquery()},
        [F("best_discount_percent").desc(nulls_last=True), "id"],
    )


def list_productgroups(
    *, q: str | None = None, ordering: ProductGroupOrdering | None = None
) -> QuerySet[ProductGroup]:
    """
    Return public groups for the group list endpoint, ordered by product count, then id.
    With a non-blank q, keep only the groups holding a public product that matches q,
    ordered by their best matching product, then by how many products match.
    An explicit ordering (price, discount) replaces either default order
    """

    qs = ProductGroup.objects.public()
    # id breaks ties, so a group can't move between pages from one request to the next
    default_ordering: list[OrderBy | str] = ["-product_count", "id"]

    if q and q.strip():
        latin_q = product_service.normalize_search_query(q=q)
        matching_products_qs = product_service.list_matching_products(latin_q=latin_q).values("pk")

        # Annotations after this filter cover only the matching products,
        # so product_count counts matches and the score is the best match
        qs = (
            qs.filter(product__in=Subquery(matching_products_qs))
            .distinct()
            .annotate(best_match_score=Max(search_match_score(latin_q=latin_q, prefix="product__")))
        )
        default_ordering = ["-best_match_score", "-product_count", "id"]

    order_by: list[OrderBy | str] = default_ordering
    if ordering is not None:
        annotations, order_by = _ordering_annotations(ordering=ordering)
        qs = qs.annotate(**annotations)

    return (
        qs.with_product_count()
        .select_related("brand")
        .prefetch_related(public_products_prefetch(), "categories")
        .order_by(*order_by)
    )


DISCOUNTED_GROUPS_LIMIT = 12


def list_discounted_groups(*, category: Category | None = None) -> QuerySet[ProductGroup]:
    """
    Return the groups with the best member discount, annotated with the best discount
    percent, the lowest current price and the total number of offers
    """

    public = public_product_q(prefix="product__")
    discounted = public & Q(product__discount_price__isnull=False)

    qs = (
        ProductGroup.objects.public()
        .annotate(
            best_discount_percent=Max(discount_percent(prefix="product__"), filter=discounted),
            lowest_price=Min(Coalesce("product__discount_price", "product__price"), filter=public),
            offer_count=Count("product", distinct=True, filter=public),
        )
        .filter(best_discount_percent__isnull=False)
    )

    if category is not None:
        # Filter through a subquery instead of joining categories, so the annotations
        # above are not computed over a product x category cartesian product
        qs = qs.filter(
            id__in=ProductGroupCategory.objects.filter(category=category).values("group_id")
        )

    return (
        qs.select_related("brand")
        .prefetch_related(public_products_prefetch())
        .order_by("-best_discount_percent", "-lowest_price")[:DISCOUNTED_GROUPS_LIMIT]
    )


def filter_by_category_count(
    *, queryset: QuerySet[ProductGroup], category_count: int
) -> QuerySet[ProductGroup]:
    """Filter by exact number of annotated _category_count"""

    return queryset.annotate(_category_count=Count("categories", distinct=True)).filter(
        _category_count=category_count
    )
