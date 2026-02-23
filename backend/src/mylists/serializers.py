from rest_framework import serializers

from .models import MyList, MyListItem


class MyListItemListSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id")
    product_name = serializers.CharField(source="product.name")
    product_price = serializers.FloatField(source="product.price")
    product_discount_price = serializers.FloatField(source="product.discount_price")
    product_discount_percent = serializers.FloatField(
        read_only=True, default=None, allow_null=True
    )
    product_url = serializers.URLField(source="product.url")
    product_last_scraped_at = serializers.DateTimeField(
        source="product.last_scraped_at"
    )

    product_brand_name = serializers.CharField(
        source="product.brand.name", default=None
    )

    product_pharmacy_name = serializers.CharField(source="product.pharmacy.name")

    class Meta:
        model = MyListItem
        fields = (
            "id",
            "is_added_through_smart_search",
            "created_at",
            "updated_at",
            "product_id",
            "product_name",
            "product_price",
            "product_discount_price",
            "product_discount_percent",
            "product_url",
            "product_last_scraped_at",
            "product_brand_name",
            "product_pharmacy_name",
        )


class MyListItemCreateSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = MyListItem
        fields = ("product_id", "is_added_through_smart_search")


class MyListCreateSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(source="products.count", default=0)

    class Meta:
        model = MyList
        fields = ("id", "name", "items_count", "created_at", "updated_at")


class MyListListSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField()

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
