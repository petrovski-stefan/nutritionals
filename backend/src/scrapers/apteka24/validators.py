from pydantic import (
    AfterValidator,
    BaseModel,
    BeforeValidator,
    HttpUrl,
    StringConstraints,
)
from typing_extensions import Annotated


def none_to_empty_string(value) -> str:
    if value is None:
        return ""

    return value


def price_format(value: str) -> str:
    if "Original price was: " in value:
        return value.split("Original price was: ")[-1]

    return value


def discount_price_format(value: str | None) -> str:
    if "Current price is: " in value:
        return value.split("Current price is: ")[-1]

    return value


def clear_dot_from_price(value: str) -> str:
    if value is None:
        return value

    if value.endswith("."):
        return value[:-1]

    return value


class CatalogProduct(BaseModel):
    name: Annotated[
        str,
        StringConstraints(min_length=2),
    ]
    price: Annotated[
        str,
        StringConstraints(min_length=2),
        AfterValidator(clear_dot_from_price),
        AfterValidator(price_format),
    ]
    discount_price: Annotated[
        str | None,
        BeforeValidator(none_to_empty_string),
        AfterValidator(clear_dot_from_price),
        AfterValidator(discount_price_format),
    ]
    brand: str | None
    tags: Annotated[
        str | None,
        StringConstraints(max_length=150),
        BeforeValidator(none_to_empty_string),
    ]
    url: HttpUrl
