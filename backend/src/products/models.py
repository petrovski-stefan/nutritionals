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
