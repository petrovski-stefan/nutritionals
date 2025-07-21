from django.db import models


class Product(models.Model):
    class PharmacyChoices(models.TextChoices):
        APTEKA24 = "apteka24"

    external_id = models.CharField(max_length=10, unique=True)
    title = models.CharField(max_length=300)
    brand = models.CharField(max_length=200, blank=True)
    price = models.CharField(max_length=100, blank=True)  # TODO: Convert to decimal
    link = models.URLField(blank=True)
    pharmacy = models.CharField(choices=PharmacyChoices.choices, max_length=15)
    # TODO: Add image

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.title} - {self.price} - {self.pharmacy}"
