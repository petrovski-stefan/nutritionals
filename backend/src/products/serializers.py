from rest_framework import serializers

from .models import Brand, Pharmacy, Product


class ProductReadListSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(source="brand.name", default=None)
    pharmacy = serializers.CharField(source="productdiscover.pharmacy.name")
    url = serializers.CharField(source="productdiscover.url")

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "is_in_stock",
            "url",
            "brand",
            "pharmacy",
            "updated_at",
        ]
        read_only_fields = fields


class BrandReadListSerializer(serializers.ModelSerializer):
    products_by_brand_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Brand
        fields = ["id", "name", "products_by_brand_count"]
        read_only_fields = fields


class PharmacyReadListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = ["id", "name"]
        read_only_fields = fields
