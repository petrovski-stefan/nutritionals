from urllib.parse import parse_qs

from common.models import BaseModel
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models

User = get_user_model()


def validate_catalog_queryparams_string(value: str) -> None:
    if not value:
        return

    if not value.startswith("?"):
        raise ValidationError("Query params string should start with a '?' ")

    try:
        parse_qs(value[1:])
    except Exception as e:
        raise ValidationError(e)


class Pharmacy(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to="pharmacy-logos")
    homepage = models.URLField()

    catalog_base_url = models.URLField(unique=True)
    catalog_url_queryparams_string = models.CharField(
        max_length=100,
        blank=True,
        validators=[validate_catalog_queryparams_string],
        help_text="Enter query params starting with '?', e.g., '?key1=value1&key2=value2'",
    )
    catalog_max_pages = models.PositiveSmallIntegerField()
    catalog_scraping_delay_in_seconds = models.FloatField()

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


class ProductInCollection(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    collection = models.ForeignKey("ProductCollection", on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"{self.product.name} in {self.collection.name}"


class ProductCollection(BaseModel):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    products = models.ManyToManyField(Product, through=ProductInCollection)

    def __str__(self) -> str:
        return f"{self.name} by {self.user.username}"
