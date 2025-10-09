from django.contrib import admin

from .models import Pharmacy, Product, ProductDiscover


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["external_id", "title", "pharmacy", "brand"]
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


@admin.register(ProductDiscover)
class ProductDiscoverAdmin(admin.ModelAdmin):
    list_display = ["url", "last_seen_at", "is_active", "pharmacy"]


@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "catalog_base_url",
        "catalog_max_pages",
        "catalog_scraping_delay_in_seconds",
    ]
