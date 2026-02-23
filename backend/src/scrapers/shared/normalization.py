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

    return match.group().replace(",00", "").replace(",", "").replace(".", "")


def normalize_brand_name(raw_brand_name: str | None) -> str | None:
    """
    If raw_brand_name is empty or None, return None.
    If raw_brand_name contains 1 brand and more sub-brands, return just the brand.
    If raw_brand_name is a brand with multiple words, make sure each first letter is uppercase.
    Remove the string "otc" from the normalized name
    """

    if not raw_brand_name:
        return None

    brand_name, *_ = raw_brand_name.split(",")
    words = re.split(r"\s+", brand_name.strip())
    normalized = " ".join(
        word.capitalize() for word in words if word and word.lower() != "otc"
    )

    return normalized or None
