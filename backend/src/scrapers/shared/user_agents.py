from fake_useragent import UserAgent


def get_random_useragent() -> str:
    browsers = ["Chrome"]
    operating_systems = ["Linux"]

    ua = UserAgent(browsers=browsers, os=operating_systems)

    return ua.random
