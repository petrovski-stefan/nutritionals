from django.db import models


class ScrapeEvent(models.Model):
    class ScrapeTypeChoices(models.TextChoices):
        PRODUCT_LIST = "product_list"
        PRODUCT_DETAIL = "product_detail"

    scraped_data = models.JSONField()
    scrape_type = models.CharField(max_length=20, choices=ScrapeTypeChoices.choices)
    url = models.URLField(max_length=500)

    created_at = models.DateTimeField()

    def __str__(self) -> str:
        return f"#{self.pk} - {self.scrape_type} - {self.created_at}"
