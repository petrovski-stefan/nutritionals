from pydantic import BeforeValidator
from typing_extensions import Annotated

from ..shared import validators
from . import normalization


class CatalogProduct(validators.BaseCatalogProduct):
    price: Annotated[float, BeforeValidator(normalization.normalize_price_str)]
    discount_price: Annotated[
        float | None, BeforeValidator(normalization.normalize_price_str)
    ]
