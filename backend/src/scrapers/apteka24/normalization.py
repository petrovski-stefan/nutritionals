import re


def normalize_price_str(price_str: str) -> float | None:
    """
    Extract just the numeric value from the price string.
    Return None if the string is empty/None
    """

    if not price_str:
        return None

    # 11,460 ден
    # 2,640 ден

    match = re.search(r"\d{1,3},?\d{1,5}\s?ден", price_str)
    if not match:
        return None

    return match.group(0).strip().replace(",", "").replace("ден", "")
