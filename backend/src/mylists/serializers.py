from products.models import Product
from rest_framework import serializers

from .models import MyList, MyListItem


class MyListItemListSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id")
    product_name = serializers.CharField(source="product.name")
    product_price = serializers.CharField(source="product.price")
    product_discount_price = serializers.CharField(source="product.discount_price")
    product_name = serializers.CharField(source="product.name")
    product_url = serializers.CharField(source="product.productdiscover.url")
    product_updated_at = serializers.DateTimeField(source="product.updated_at")

    product_brand_name = serializers.CharField(source="product.brand", default=None)

    pharmacy_logo = serializers.ImageField(
        source="product.productdiscover.pharmacy.logo", default=None
    )

    class Meta:
        model = MyListItem
        fields = (
            "id",
            "is_added_through_smart_search",
            "product_id",
            "product_name",
            "product_price",
            "product_discount_price",
            "product_url",
            "product_updated_at",
            "product_brand_name",
            "pharmacy_logo",
            "created_at",
        )


class MyListItemCreateSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=Product.objects.all(), write_only=True
    )

    class Meta:
        model = MyListItem
        fields = ("product_id", "is_added_through_smart_search")


class MyListCreateSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(source="products.count", default=0)

    class Meta:
        model = MyList
        fields = ("id", "name", "items_count", "created_at", "updated_at")


class MyListListSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(source="products.count")

    class Meta:
        model = MyList
        fields = ("id", "name", "items_count", "created_at", "updated_at")


class MyListRetrieveSerializer(serializers.ModelSerializer):
    items = MyListItemListSerializer(many=True, source="mylistitem_set")

    class Meta:
        model = MyList
        fields = ("id", "name", "items", "created_at", "updated_at")


class MyListUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyList
        fields = ("id", "name", "created_at", "updated_at")
