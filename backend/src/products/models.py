from common.models import BaseModel
from django.db import models


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

    class Meta:
        verbose_name_plural = "Pharmacies"


class Brand(BaseModel):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self) -> str:
        return self.name

    class Meta:
        verbose_name_plural = "Brands"


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

    class Meta:
        verbose_name_plural = "Product discoveries"


class Product(BaseModel):
    name = models.CharField(max_length=400)
    price = models.CharField(max_length=100)
    discount_price = models.CharField(max_length=100, blank=True)
    brand = models.ForeignKey(Brand, null=True, blank=True, on_delete=models.SET_NULL)
    is_in_stock = models.BooleanField()

    # description

    def __str__(self) -> str:
        return self.name

    class Meta:
        verbose_name_plural = "Products"
