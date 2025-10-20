from common.models import BaseModel
from django.db import models


class ProductDeprecated(models.Model):
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


class Pharmacy(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    catalog_base_url = models.URLField(unique=True)
    catalog_max_pages = models.PositiveSmallIntegerField()
    catalog_scraping_delay_in_seconds = models.FloatField()
    logo = models.ImageField(upload_to="pharmacy-logos")
    homepage = models.URLField()
    # delay between single product scrapes

    def __str__(self) -> str:
        return self.name


class Brand(BaseModel):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self) -> str:
        return self.name


class ProductDiscover(BaseModel):
    url = models.URLField(max_length=500, unique=True)
    last_seen_at = models.DateTimeField()
    is_active = models.BooleanField()
    pharmacy = models.ForeignKey(Pharmacy, null=True, on_delete=models.CASCADE)
    product = models.OneToOneField(
        "Product", null=True, blank=True, on_delete=models.SET_NULL
    )
    product_last_scraped_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        is_active_str = "Active" if self.is_active else "Not Active"
        return f"({is_active_str}) - {self.last_seen_at} - {self.url}"


class Product(BaseModel):
    name = models.CharField(max_length=400)
    price = models.CharField(max_length=100, blank=True)
    brand = models.ForeignKey(Brand, null=True, blank=True, on_delete=models.SET_NULL)
    is_in_stock = models.BooleanField()

    # description

    def __str__(self) -> str:
        return self.name
