from common.constants import MODEL_ADMIN_ITEMS_PER_PAGE
from django.contrib import admin
from django.db.models import QuerySet

from .models import (
    Brand,
    Category,
    Pharmacy,
    PharmacyCatalog,
    Product,
    ProductCategory,
    ProductGroup,
    ProductGroupCategory,
)
from .services import brand as brand_service
from .services import pharmacy as pharmacy_service
from .services import productgroup as productgroup_service


class PharmacyCatalogInline(admin.StackedInline):
    model = PharmacyCatalog

    fieldsets = [
        (
            "URL",
            {
                "fields": [
                    "url_without_page",
                    "page_numbering_starts_at_zero",
                    "queryparams_string",
                    "max_pages",
                ]
            },
        ),
        (
            "Category",
            {
                "fields": ["category"],
            },
        ),
        (
            "Moderation",
            {
                "fields": ["is_active"],
            },
        ),
        (
            "Description",
            {
                "classes": ["collapse"],
                "fields": ["short_description"],
            },
        ),
    ]

    extra = 0


@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
    inlines = [PharmacyCatalogInline]

    list_display = [
        "name",
        "catalogs_display",
        "total_pages_display",
        "created_at",
        "updated_at",
    ]
    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE

    fieldsets = [
        (
            None,
            {
                "fields": ["name", "homepage"],
            },
        ),
        (
            "Counts",
            {
                "fields": ["catalogs_display", "total_pages_display"],
            },
        ),
        (
            "Timestamps",
            {
                "fields": ["created_at", "updated_at"],
            },
        ),
    ]
    readonly_fields = [
        "created_at",
        "updated_at",
        "catalogs_display",
        "total_pages_display",
    ]

    search_fields = ["name"]
    search_help_text = "Search by pharmacy's name"

    def get_queryset(self, request) -> QuerySet:
        qs = super().get_queryset(request)

        return pharmacy_service.with_catalog_counts(queryset=qs)

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
        "total_product_count",
        "reviewed_product_count",
        "total_group_count",
        "reviewed_group_count",
        "created_at",
        "updated_at",
    ]
    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE

    fieldsets = [
        (
            None,
            {
                "fields": ["name", "normalized_name"],
            },
        ),
        (
            "Counts",
            {
                "fields": [
                    "total_product_count",
                    "reviewed_product_count",
                    "total_group_count",
                    "reviewed_group_count",
                ],
            },
        ),
        (
            "Timestamps",
            {
                "fields": ["created_at", "updated_at"],
            },
        ),
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
        "total_product_count",
        "reviewed_product_count",
        "total_group_count",
        "reviewed_group_count",
    ]

    search_fields = ["name", "normalized_name"]
    search_help_text = "Search by brand's name"

    def get_queryset(self, request) -> QuerySet:
        qs = super().get_queryset(request)

        return brand_service.with_counts(queryset=qs)

    @admin.display(description="Products")
    def total_product_count(self, obj) -> int:
        return obj.total_product_count

    @admin.display(description="Reviewed Products")
    def reviewed_product_count(self, obj) -> int:
        return obj.reviewed_product_count

    @admin.display(description="Groups")
    def total_group_count(self, obj) -> int:
        return obj.total_group_count

    @admin.display(description="Reviewed Groups")
    def reviewed_group_count(self, obj) -> int:
        return obj.reviewed_group_count


class ProductCategoryInline(admin.StackedInline):
    model = ProductCategory

    extra = 0


class ProductIsGroupedFilter(admin.filters.SimpleListFilter):
    title = "Is Grouped"
    parameter_name = "is_grouped"

    def lookups(self, request, model_admin) -> list[tuple[str, str]]:
        return [
            ("true", "Yes"),
            ("false", "No"),
        ]

    def queryset(self, request, queryset) -> QuerySet[ProductGroup]:

        value = self.value()

        if value is not None:
            value_bool = value == "true"

            return Product.objects.filter(group__isnull=value_bool)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductCategoryInline]

    list_display = [
        "name",
        "pharmacy__name",
        "brand__name",
        "is_reviewed",
        "is_grouped",
        "last_scraped_at",
        "created_at",
    ]
    list_select_related = [
        "brand",
        "pharmacy",
        "group",
    ]
    list_filter = [
        "is_reviewed",
        ProductIsGroupedFilter,
        "last_scraped_at",
        "created_at",
        "updated_at",
        "pharmacy",
        "categories",
        "brand",
    ]
    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE

    fieldsets = [
        (
            None,
            {
                "fields": ["name", "normalized_name"],
            },
        ),
        (
            "Source",
            {
                "fields": ["pharmacy", "url"],
            },
        ),
        (
            "Classification",
            {
                "fields": ["brand", "group", "categories_display"],
            },
        ),
        (
            "Moderation",
            {
                "fields": ["is_reviewed"],
            },
        ),
        (
            "Pricing, Form & Dosage",
            {
                "fields": ["price", "discount_price", "form_with_count", "dosage"],
            },
        ),
        (
            "Timestamps",
            {
                "fields": ["last_scraped_at", "created_at", "updated_at"],
            },
        ),
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
        "last_scraped_at",
        "categories_display",
    ]

    search_fields = ["name", "normalized_name"]
    search_help_text = "Search by product's name"
    autocomplete_fields = ["brand", "pharmacy", "group"]

    @admin.display(description="Is Grouped", boolean=True)
    def is_grouped(self, obj) -> bool:
        return obj.group is None

    @admin.display(description="Categories")
    def categories_display(self, obj) -> str:
        return (
            ", ".join(
                sorted(obj.categories.only("name").values_list("name", flat=True))
            )
            or "/"
        )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "created_at",
        "updated_at",
    ]
    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE

    fieldsets = [
        (
            None,
            {
                "fields": ["name"],
            },
        ),
        (
            "Timestamps",
            {
                "fields": ["created_at", "updated_at"],
            },
        ),
    ]
    readonly_fields = [
        "created_at",
        "updated_at",
    ]

    search_fields = ["name"]
    search_help_text = "Search by category's name"


class ProductGroupCategoryInline(admin.TabularInline):
    model = ProductGroupCategory

    extra = 0


class ProductInline(admin.StackedInline):
    model = Product

    readonly_fields = [
        "name",
        "brand",
        "price",
        "discount_price",
        "is_reviewed",
        "form_with_count",
        "dosage",
        "created_at",
        "updated_at",
    ]
    fields = [
        "name",
        "brand",
        "price",
        "discount_price",
        "is_reviewed",
        "form_with_count",
        "dosage",
        "created_at",
        "updated_at",
    ]

    extra = 0


class CategoryCountInProductGroupFilter(admin.SimpleListFilter):
    title = "Category Count"
    parameter_name = "category_count"

    def lookups(self, request, model_admin) -> list[tuple[str, str]]:
        return [
            ("0", "0"),
            ("1", "1"),
            ("2", "2"),
            ("3", "3"),
            ("4", "4"),
        ]

    def queryset(self, request, queryset) -> QuerySet[ProductGroup]:

        value = self.value()

        if value is not None:
            return productgroup_service.filter_by_category_count(
                queryset=queryset, category_count=int(value)
            )


@admin.register(ProductGroup)
class ProductGroupAdmin(admin.ModelAdmin):
    inlines = [ProductGroupCategoryInline, ProductInline]

    list_display = [
        "name",
        "is_reviewed",
        "brand__name",
        "categories_display",
    ]
    list_filter = [
        "created_at",
        "updated_at",
        CategoryCountInProductGroupFilter,
        "brand",
    ]
    list_select_related = ["brand"]
    list_per_page = MODEL_ADMIN_ITEMS_PER_PAGE

    fieldsets = [
        (
            None,
            {
                "fields": ["name"],
            },
        ),
        (
            "Classification",
            {
                "fields": ["brand", "categories_display"],
            },
        ),
        (
            "Moderation",
            {
                "fields": ["is_reviewed"],
            },
        ),
        (
            "Timestamps",
            {
                "fields": ["created_at", "updated_at"],
            },
        ),
    ]
    readonly_fields = ["created_at", "updated_at", "categories_display"]

    search_fields = ["name"]
    search_help_text = "Search by group's name"
    autocomplete_fields = ["brand"]

    @admin.display(description="Categories")
    def categories_display(self, obj) -> str:
        return (
            ", ".join(
                sorted(obj.categories.only("name").values_list("name", flat=True))
            )
            or "/"
        )
