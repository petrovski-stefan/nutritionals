from django.contrib import admin

from .models import ScrapeEvent


@admin.register(ScrapeEvent)
class ScrapeEventAdmin(admin.ModelAdmin):
    list_display = ["pk", "scrape_type", "created_at"]
    fields = ["scrape_type", "url", "scraped_data", "created_at"]
    readonly_fields = ["scrape_type", "url", "scraped_data", "created_at"]
    list_filter = ["created_at", "scrape_type"]
