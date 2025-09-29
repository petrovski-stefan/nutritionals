from rest_framework import serializers

from .models import Product


class ProductReadListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "title", "brand", "price", "image_link", "pharmacy"]
        read_only_fields = fields


class ProductBrandReadListSerializer(serializers.Serializer):
    brand = serializers.CharField(read_only=True)
    products_by_brand_count = serializers.IntegerField(read_only=True)
