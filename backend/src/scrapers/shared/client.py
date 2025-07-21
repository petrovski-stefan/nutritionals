import random
import time

import requests
from fake_useragent import UserAgent


def delay(base_delay_amount: int) -> None:
    delay_amount = base_delay_amount + random.randint(-5, 5)
    time.sleep(delay_amount)


def get_random_useragent() -> str:
    browsers = ["Chrome"]
    operating_systems = ["Linux"]

    ua = UserAgent(browsers=browsers, os=operating_systems)

    return ua.random


def make_request(url: str, headers: dict | None = None) -> str:
    response = requests.get(url=url, headers=headers)

    if response.status_code != 200:
        raise requests.exceptions.HTTPError

    return response.text
