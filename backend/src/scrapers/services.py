from .models import ScrapeEvent


def create_scrape_event(scraped_data: dict, scrape_type: str) -> ScrapeEvent:
    url = scraped_data.pop("url")
    created_at = scraped_data.pop("created_at")

    return ScrapeEvent.objects.create(
        scraped_data=scraped_data,
        scrape_type=scrape_type,
        url=url,
        created_at=created_at,
    )
