from rest_framework import serializers

from .models import Product


class ProductReadListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "title", "brand", "price", "image_link"]
        read_only_fields = fields
