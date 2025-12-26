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
        "is_added_through_smart_search",
        "my_list__name",
        "created_at",
        "updated_at",
    )
    list_select_related = (
        "product",
        "my_list",
        "my_list__user",
    )
    list_filter = (
        "is_added_through_smart_search",
        "my_list__name",
        "my_list__user__username",
        "created_at",
        "updated_at",
    )
    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE

    search_fields = (
        "product__name",
        "my_list__name",
    )
    search_help_text = "Search by product's or mylist's name ..."

    fields = (
        "product",
        "my_list",
        "is_added_through_smart_search",
        "created_at",
        "updated_at",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )
