from typing import TYPE_CHECKING, Self, TypeVar

from django.db.models import Count, QuerySet

from .expressions import discount_percent

if TYPE_CHECKING:
    from .models import Product, ProductGroup


# The querysets are generic like Django's QuerySet, so mypy keeps the attributes
# added by annotate() on the rows they return
_ProductT = TypeVar("_ProductT", bound="Product", covariant=True)
_ProductRowT = TypeVar("_ProductRowT", covariant=True, default=_ProductT)
_GroupT = TypeVar("_GroupT", bound="ProductGroup", covariant=True)
_GroupRowT = TypeVar("_GroupRowT", covariant=True, default=_GroupT)


class ProductQuerySet(QuerySet[_ProductT, _ProductRowT]):
    def public(self) -> Self:
        """Keep the products shown on the site"""

        return self.filter(is_reviewed=True)

    def with_discount_percent(self) -> Self:
        """Annotate discount_percent"""

        return self.annotate(discount_percent=discount_percent())


class ProductGroupQuerySet(QuerySet[_GroupT, _GroupRowT]):
    def public(self) -> Self:
        """Keep the groups shown on the site. A public group may have no public products"""

        return self.filter(is_reviewed=True)

    def with_product_count(self) -> Self:
        """
        Annotate product_count with every product in the group, public or not.
        After a filter on product, it counts only the matching products
        """

        return self.annotate(product_count=Count("product", distinct=True))
