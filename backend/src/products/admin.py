from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["title", "pharmacy"]
    readonly_fields = ["created_at", "updated_at"]
