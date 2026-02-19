def get_catalog_url_by_page(
    base_url: str,
    page_num: str | int,
    qs_str: str | None = None,
) -> str:
    """Construct full url with base url, page num
    and optional query param str that begins with a '?'"""

    return f"{base_url}page/{page_num}/{qs_str or ''}"
