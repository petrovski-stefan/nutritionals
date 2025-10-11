from rest_framework import serializers

from .models import ProductDeprecated


class ProductDeprecatedReadListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductDeprecated
        fields = ["id", "title", "brand", "price", "image_link", "pharmacy"]
        read_only_fields = fields


class ProductDeprecatedBrandReadListSerializer(serializers.Serializer):
    brand = serializers.CharField(read_only=True)
    products_by_brand_count = serializers.IntegerField(read_only=True)
