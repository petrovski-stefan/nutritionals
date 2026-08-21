from rest_framework import serializers

from .models import Brand, Category, Pharmacy, Product, ProductGroup


class BrandListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name"]
        read_only_fields = fields


class PharmacyListSerializer(serializers.ModelSerializer):
    num_products = serializers.IntegerField()
    last_scraped_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Pharmacy
        fields = ["id", "name", "homepage", "num_products", "last_scraped_at"]
        read_only_fields = fields


class ProductListSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source="pharmacy.name")
    brand_name = serializers.CharField(
        source="brand.name", default=None, allow_null=True
    )
    discount_percent = serializers.FloatField(
        read_only=True, default=None, allow_null=True
    )
    similarity = serializers.FloatField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "discount_price",
            "discount_percent",
            "pharmacy_name",
            "brand_name",
            "url",
            "last_scraped_at",
            "similarity",
        ]
        read_only_fields = fields


class ProductSmartSearchInputSerializer(serializers.Serializer):
    query = serializers.CharField(min_length=3, max_length=100, write_only=True)


class CategoryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]
        read_only_fields = fields


class DiscountedCategorySerializer(serializers.ModelSerializer):
    group_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "group_count"]
        read_only_fields = fields


class DiscountedProductGroupsInputSerializer(serializers.Serializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        required=False,
        write_only=True,
    )


class ProductGroupListSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(
        source="brand.name", default=None, allow_null=True
    )

    products = ProductListSerializer(many=True, source="product_set")
    categories = CategoryListSerializer(many=True)

    class Meta:
        model = ProductGroup
        fields = ["id", "name", "brand_name", "categories", "products"]


class DiscountedProductGroupSerializer(serializers.ModelSerializer):
    """Home page deal card — deliberately omits categories, which nothing there renders"""

    brand_name = serializers.CharField(
        source="brand.name", default=None, allow_null=True
    )

    products = ProductListSerializer(many=True, source="product_set")

    best_discount_percent = serializers.FloatField(read_only=True)
    lowest_price = serializers.FloatField(read_only=True)
    offer_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProductGroup
        fields = [
            "id",
            "name",
            "brand_name",
            "products",
            "best_discount_percent",
            "lowest_price",
            "offer_count",
        ]
