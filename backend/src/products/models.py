from django.db import models


class Product(models.Model):
    class PharmacyChoices(models.TextChoices):
        APTEKA24 = "apteka24"
        ANNIFARM = "annifarm"

    external_id = models.CharField(max_length=10)
    title = models.CharField(max_length=300)
    brand = models.CharField(max_length=200, blank=True)
    price = models.CharField(max_length=100, blank=True)  # TODO: Convert to decimal
    link = models.URLField(max_length=500, unique=True, blank=True)
    pharmacy = models.CharField(choices=PharmacyChoices.choices, max_length=15)
    description = models.TextField(blank=True)
    image_link = models.URLField(max_length=500, blank=True)  # TODO: POC

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"({self.external_id}) {self.title}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["external_id", "pharmacy"], name="unique_eid_pharmacy"
            )
        ]


class Pharmacy(models.Model):
    name = models.CharField(max_length=100, unique=True)
    catalog_base_url = models.URLField(unique=True)
    catalog_max_pages = models.PositiveSmallIntegerField()
    catalog_scraping_delay_in_seconds = models.FloatField()

    def __str__(self) -> str:
        return self.name


class ProductDiscover(models.Model):
    url = models.URLField(max_length=500, unique=True, blank=True)
    last_seen_at = models.DateTimeField()
    is_active = models.BooleanField()
    pharmacy = models.ForeignKey(Pharmacy, null=True, on_delete=models.CASCADE)

    def __str__(self) -> str:
        is_active_str = "Active" if self.is_active else "Not Active"
        return f"({is_active_str}) - {self.last_seen_at} - {self.url}"
