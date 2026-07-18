from bs4 import BeautifulSoup, Tag


def get_soup(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "html.parser")


def get_stripped_attribute(element: Tag, attribute: str) -> str | None:
    """Return the element's attribute value stripped, or None if missing or not a string"""

    value = element.get(attribute)

    return value.strip() if isinstance(value, str) else None
