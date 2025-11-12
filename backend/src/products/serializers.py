from rest_framework import serializers

from .models import Brand, Pharmacy, Product, ProductCollection


class ProductReadListSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(source="brand.name", default=None)
    pharmacy = serializers.CharField(source="productdiscover.pharmacy.name")
    pharmacy_logo = serializers.ImageField(
        source="productdiscover.pharmacy.logo", default=None
    )
    url = serializers.CharField(source="productdiscover.url")

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "discount_price",
            "is_in_stock",
            "url",
            "brand",
            "pharmacy",
            "pharmacy_logo",
            "updated_at",
        ]
        read_only_fields = fields


class ProductInCollectionDetailSerializer(serializers.ModelSerializer):
    # # brand = serializers.CharField(source="brand.name", default=None)
    # pharmacy_logo = serializers.ImageField(
    #     source="productdiscover.pharmacy.logo", default=None
    # )
    # url = serializers.CharField(source="productdiscover.url")

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "discount_price",
            "is_in_stock",
            # "url",
            # "brand",
            # "pharmacy",
            # "pharmacy_logo",
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
        fields = ["id", "name", "homepage", "logo"]
        read_only_fields = fields


class ProductCollectionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCollection
        fields = ["id", "name"]


class ProductCollectionListSerializer(serializers.ModelSerializer):
    products = ProductInCollectionDetailSerializer(many=True)

    class Meta:
        model = ProductCollection
        fields = ["id", "name", "products"]
        read_only_fields = fields


class ProductCollectionRetrieveUpdateDestroySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCollection
        fields = ["id", "name"]
        read_only_fields = fields
