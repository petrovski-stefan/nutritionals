import logging

import requests
from fake_useragent import UserAgent

logger = logging.getLogger(__name__)


def get_random_useragent() -> str:
    """Get random User Agent excluding mobile devices"""

    # TODO: check docs maybe there is better way to get a random ua
    browsers = ["Chrome", "Firefox", "Edge"]
    operating_systems = ["Windows", "Linux", "Ubuntu", "Chrome OS", "Mac OS X"]

    ua = UserAgent(browsers=browsers, os=operating_systems)

    return ua.random


def make_request_and_get_html(url: str, headers: dict | None = None) -> str:
    """Get html of the page as string. Raise HTTPError for 4xx status codes"""

    try:
        response = requests.get(url=url, headers=headers, timeout=15)
        response.raise_for_status()

        logger.info(f"Request succeed ({response.status_code}) - {url}")

        return response.text
    except requests.exceptions.HTTPError as e:
        logger.warning(f"Request failed ({e.response.status_code}) - {url}")

        raise e
