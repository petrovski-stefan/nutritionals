def get_catalog_url_by_page(
    base_url: str,
    page_num: str | int,
    qs_str: str | None = None,
) -> str:
    """
    Construct full url with base url, page num and optional query param str.
    Zegin's base url already holds the filters after a '?', so the page is appended with '&'
    """

    return f"{base_url}{qs_str or ''}&page={page_num}"
