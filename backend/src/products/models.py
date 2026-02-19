from common.models import BaseModel
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.constraints import UniqueConstraint

from .validators import validate_catalog_queryparams_string

User = get_user_model()


class PharmacyCatalog(BaseModel):
    url_without_page = models.CharField(max_length=2048, unique=True)
    max_pages = models.PositiveSmallIntegerField()
    page_numbering_starts_at_zero = models.BooleanField(default=False)
    queryparams_string = models.CharField(
        max_length=256,
        blank=True,
        validators=[validate_catalog_queryparams_string],
        help_text="Enter query params starting with '?', e.g., '?key1=value1&key2=value2'",
    )
    is_active = models.BooleanField(default=True)
    short_description = models.TextField(blank=True)

    pharmacy = models.ForeignKey("Pharmacy", null=True, on_delete=models.SET_NULL)
    category = models.ForeignKey(
        "Category", blank=True, null=True, on_delete=models.SET_NULL
    )

    def __str__(self) -> str:
        return f"{self.short_description or '/'} - ({self.url_without_page or '/'})"  # noqa


class Category(BaseModel):
    name = models.CharField(max_length=128, unique=True)

    def __str__(self) -> str:
        return self.name

    class Meta:
        verbose_name_plural = "Categories"


class Pharmacy(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    homepage = models.URLField(unique=True)

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


class ProductCategory(BaseModel):
    product = models.ForeignKey("Product", on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["product", "category"], name="unique_together_product_category"
            )
        ]


class Product(BaseModel):
    name = models.CharField(max_length=400)

    price = models.FloatField()
    discount_price = models.FloatField(blank=True, null=True)

    brand = models.ForeignKey(Brand, null=True, blank=True, on_delete=models.SET_NULL)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE)
    group = models.ForeignKey(
        "ProductGroup", blank=True, null=True, on_delete=models.SET_NULL
    )
    categories = models.ManyToManyField(Category, through=ProductCategory)

    form_with_count = models.CharField(max_length=255, blank=True)
    dosage = models.CharField(max_length=255, blank=True)

    url = models.URLField(max_length=600, unique=True)
    last_scraped_at = models.DateTimeField(null=True, blank=True)

    is_reviewed = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.name

    class Meta:
        verbose_name_plural = "Products"


class ProductGroupCategory(BaseModel):
    group = models.ForeignKey("ProductGroup", on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["group", "category"], name="unique_together_group_category"
            )
        ]


class ProductGroup(BaseModel):
    name = models.CharField(max_length=400, unique=True)
    brand = models.ForeignKey(Brand, null=True, blank=True, on_delete=models.SET_NULL)

    categories = models.ManyToManyField(Category, through=ProductGroupCategory)

    is_reviewed = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.name

    class Meta:
        verbose_name_plural = "Product Groups"
