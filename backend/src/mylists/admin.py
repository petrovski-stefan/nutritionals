from common.constants import MODEL_ADMIN_ITEMS_PER_PAGE
from django.contrib import admin

from .models import MyList, MyListItem


@admin.register(MyList)
class MyListModelAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "name",
        "created_at",
        "updated_at",
    )
    list_select_related = ("user",)
    list_filter = (
        "created_at",
        "updated_at",
    )
    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE

    search_fields = ("name",)
    search_help_text = "Search by name ..."

    fields = (
        "name",
        "user",
        "created_at",
        "updated_at",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(MyListItem)
class MyListItemModelAdmin(admin.ModelAdmin):
    list_display = (
        "product__name",
        "product__pharmacy__name",
        "is_added_through_smart_search",
        "mylist__name",
        "created_at",
        "updated_at",
    )
    list_select_related = (
        "product",
        "product__pharmacy",
        "mylist",
    )
    list_filter = (
        "is_added_through_smart_search",
        "product__pharmacy",
        "created_at",
        "updated_at",
    )
    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE

    search_fields = (
        "product__name",
        "mylist__name",
    )
    search_help_text = "Search by product's or mylist's name ..."

    fields = (
        "product",
        "mylist",
        "is_added_through_smart_search",
        "created_at",
        "updated_at",
    )
    autocomplete_fields = ["product"]
    readonly_fields = (
        "created_at",
        "updated_at",
    )
