from urllib.parse import parse_qs

from django.core.exceptions import ValidationError


def validate_catalog_queryparams_string(value: str) -> None:
    """Validate if the format is ?key=value"""

    if not value:
        return

    if not value.startswith("?"):
        raise ValidationError("Query params string should start with a '?' ")

    try:
        parse_qs(value[1:])
    except Exception as e:
        raise ValidationError(e)
