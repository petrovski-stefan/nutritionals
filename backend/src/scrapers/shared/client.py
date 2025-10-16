import logging
import random
import time

import requests
from fake_useragent import UserAgent


def delay(base_delay_amount: int | float) -> None:
    delay_amount = base_delay_amount + random.randint(-5, 5)
    delay_amount = max(0, delay_amount)  # prevent negative sleep

    time.sleep(delay_amount)


def get_random_useragent() -> str:
    browsers = ["Chrome"]
    operating_systems = ["Linux"]

    ua = UserAgent(browsers=browsers, os=operating_systems)

    return ua.random


def make_request(
    *, url: str, headers: dict | None = None, logger: logging.Logger
) -> str:
    try:
        response = requests.get(url=url, headers=headers, timeout=15)
        response.raise_for_status()
        logger.info(
            f"Succesfully requested {url} with status code {response.status_code} ..."
        )
        return response.text
    except requests.exceptions.HTTPError as e:
        logger.warning(
            f"Failed to request {url} with status code {e.response.status_code}"
        )
        raise e
