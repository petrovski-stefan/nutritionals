def get_catalog_url_by_page(
    base_url: str, page_num: str | int, qs_str: str | None
) -> str:
    """Construct full url with base url, page num
    and optional query param str that begins with a '?'"""

    if qs_str:
        return f"{base_url}{page_num}/{qs_str}"

    return f"{base_url}{page_num}/"
