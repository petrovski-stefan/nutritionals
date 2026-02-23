def get_catalog_url_by_page(
    base_url: str,
    page_num: str | int,
    qs_str: str | None = None,  # noqa
) -> str:
    """Construct full url with base url, page num"""

    return f"{base_url}{qs_str}&page={page_num}"
