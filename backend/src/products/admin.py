from django.contrib import admin

from .models import (
    Brand,
    Pharmacy,
    Product,
    ProductDiscover,
)


@admin.register(ProductDiscover)
class ProductDiscoverAdmin(admin.ModelAdmin):
    list_display = [
        "url",
        "last_seen_at",
        "product_last_scraped_at",
        "is_active",
        "pharmacy",
        "created_at",
        "updated_at",
    ]
    readonly_fields = [
        "created_at",
        "updated_at",
    ]

    list_filter = ["product_last_scraped_at"]
    ordering = ["product_last_scraped_at"]


@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "created_at",
        "updated_at",
    ]
    readonly_fields = [
        "created_at",
        "updated_at",
    ]


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "created_at",
        "updated_at",
    ]
    readonly_fields = [
        "created_at",
        "updated_at",
    ]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "price",
        "discount_price",
        "brand__name",
        "is_in_stock",
        "created_at",
        "updated_at",
    ]

    list_select_related = ["brand"]

    readonly_fields = [
        "created_at",
        "updated_at",
    ]

    search_fields = ["name"]
    list_filter = [
        "is_in_stock",
        "created_at",
        "updated_at",
    ]
