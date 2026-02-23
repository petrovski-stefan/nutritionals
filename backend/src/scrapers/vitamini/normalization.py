import re


def normalize_price_str(price_str: str) -> float | None:
    """
    Extract just the numeric value from the price string.
    Return None if the string is empty/None
    """

    if not price_str:
        return None

    price_str = re.sub(r"Original price was:\s*", "", price_str, flags=re.I)

    match = re.search(r"([\d,.]+)", price_str)
    if not match:
        return None

    return match.group(0).replace(",00", "").replace(",", "").replace(".", "")
