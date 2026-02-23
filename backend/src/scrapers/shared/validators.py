from common.utils import transliterate_cyrillic_to_latin
from pydantic import (
    AfterValidator,
    BaseModel,
    BeforeValidator,
    HttpUrl,
    StringConstraints,
    model_validator,
)
from typing_extensions import Annotated, Self

from . import normalization


class BaseCatalogProduct(BaseModel):
    """Pydantic model with name, price, discount_price, brand and url"""

    name: Annotated[
        str,
        StringConstraints(min_length=2),
    ]
    price: Annotated[float, BeforeValidator(normalization.normalize_price_str)]
    discount_price: Annotated[
        float | None, BeforeValidator(normalization.normalize_price_str)
    ]
    brand: Annotated[
        str | None,
        BeforeValidator(normalization.normalize_brand_name),
        AfterValidator(transliterate_cyrillic_to_latin),
    ]
    url: HttpUrl

    @model_validator(mode="after")
    def check_prices(self) -> Self:
        if self.discount_price is not None and self.price < self.discount_price:
            raise ValueError("Discount price cannot be higher than the price")

        return self
