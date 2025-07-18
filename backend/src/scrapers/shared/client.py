import requests


def make_request(url: str, headers: dict | None = None) -> str:
    response = requests.get(url=url, headers=headers)

    if response.status_code != 200:
        raise requests.exceptions.HTTPError

    return response.text
