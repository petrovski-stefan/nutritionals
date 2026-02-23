import re


def normalize_price_str(price_str: str) -> float | None:
    """
    Extract just the numeric value from the price string.
    Return None if the string is empty/None
    """
    if not price_str:
        return None

    match = re.search(r"\d{1,3}\.?\d{1,5},00\s?ден\.", price_str)
    if not match:
        return None

    return match.group().strip().replace("ден.", "").replace(",00", "").replace(".", "")
