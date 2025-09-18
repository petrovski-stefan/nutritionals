from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["external_id", "title", "pharmacy"]
    readonly_fields = [
        "external_id",
        "title",
        "brand",
        "pharmacy",
        "price",
        "link",
        "image_link",
        "description",
        "created_at",
        "updated_at",
    ]
