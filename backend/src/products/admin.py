from common.constants import MODEL_ADMIN_ITEMS_PER_PAGE
from django.contrib import admin
from django.db.models import QuerySet

from .models import (
    Brand,
    Category,
    Pharmacy,
    PharmacyCatalog,
    Product,
    ProductGroup,
    ProductGroupCategory,
)
from .services import pharmacy as phamacy_service


class PharmacyCatalogInline(admin.StackedInline):
    model = PharmacyCatalog
    fields = [
        "url_without_page",
        "max_pages",
        "page_numbering_starts_at_zero",
        "queryparams_string",
        "is_active",
        "short_description",
        "category",
    ]

    extra = 0


@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "catalogs_display",
        "total_pages_display",
        "created_at",
        "updated_at",
    ]
    fields = [
        "name",
        "catalogs_display",
        "total_pages_display",
        "created_at",
        "updated_at",
    ]
    readonly_fields = [
        "created_at",
        "updated_at",
        "catalogs_display",
        "total_pages_display",
    ]
    inlines = [
        PharmacyCatalogInline,
    ]

    search_fields = [
        "name",
    ]
    search_help_text = "Search by pharmacy's name"

    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE

    def get_queryset(self, request) -> QuerySet:
        qs = super().get_queryset(request)

        return phamacy_service.with_catalog_counts(queryset=qs)

    @admin.display(description="Catalogs")
    def catalogs_display(self, obj) -> int:
        return obj.catalog_count

    @admin.display(description="Total Pages")
    def total_pages_display(self, obj) -> int:
        return obj.total_pages_count


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

    search_fields = ["name"]
    search_help_text = "Search by brand's name"

    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "pharmacy__name",
        "categories_display",
        "is_reviewed",
        "price",
        "discount_price",
        "form_with_count",
        "dosage",
        "brand__name",
        "last_scraped_at",
        "created_at",
        "updated_at",
    ]

    list_select_related = [
        "brand",
        "pharmacy",
    ]

    readonly_fields = [
        "categories_display",
        "created_at",
        "updated_at",
    ]

    search_fields = ["name"]
    search_help_text = "Search by product's name"

    list_filter = [
        "is_reviewed",
        "last_scraped_at",
        "created_at",
        "updated_at",
        "pharmacy",
        "categories",
        "brand",
    ]

    @admin.display(description="Categories")
    def categories_display(self, obj) -> str:
        return ", ".join(
            list(obj.categories.only("name").values_list("name", flat=True))
        )

    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    fields = [
        "name",
        "created_at",
        "updated_at",
    ]
    readonly_fields = [
        "created_at",
        "updated_at",
    ]
    list_display = [
        "name",
        "created_at",
        "updated_at",
    ]

    search_fields = [
        "name",
    ]
    search_help_text = "Search by category's name"

    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE


class ProductGroupCategoryInline(admin.TabularInline):
    model = ProductGroupCategory
    extra = 0


@admin.register(ProductGroup)
class ProductGroupAdmin(admin.ModelAdmin):
    inlines = [ProductGroupCategoryInline]
