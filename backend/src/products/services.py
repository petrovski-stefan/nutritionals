import logging

import openai
from django.conf import settings
from django.db.models import (
    BooleanField,
    Case,
    Count,
    Q,
    QuerySet,
    Value,
    When,
)
from django.utils import timezone

from .models import Brand, Pharmacy, Product, ProductDiscover

logger = logging.getLogger(__name__)


class SmartSearchService:
    @staticmethod
    def get_tags_from_openai(query: str) -> list[str]:
        try:
            # TODO:
            # openai.chat.completions
            return []
        except Exception as e:
            raise e


class ProductService:
    @staticmethod
    def get_smart_seached_products(query: str) -> QuerySet[Product]:
        sample_tags_from_openai = [
            "zinc",
            "vitamin c",
            "immunity",
        ]  # simulated tags returned from api

        tags = SmartSearchService.get_tags_from_openai(query)
        matched_products = Product.objects.filter(
            Q(tags__contains=tags[0])
            | Q(tags__contains=tags[1])
            | Q(tags__contains=tags[2])
        )
        # return matched_products
        return Product.objects.all()[:5]

    @staticmethod
    def _create_scraped_product(
        *,
        product_discover: ProductDiscover,
        brand: Brand | None,
        validated_data: dict,
        product_last_scraped_at: timezone.datetime,
    ) -> Product:
        product = Product.objects.create(brand=brand, **validated_data)

        product_discover.product = product
        product_discover.product_last_scraped_at = product_last_scraped_at
        product_discover.save(update_fields=["product", "product_last_scraped_at"])

        return product

    @staticmethod
    def _update_scraped_product(
        *,
        product: Product,
        product_discover: ProductDiscover,
        validated_data: dict,
        product_last_scraped_at: timezone.datetime,
    ) -> Product:
        product.price = validated_data.get("price")
        product.discount_price = validated_data.get("discount_price")
        product.is_in_stock = validated_data.get("is_in_stock")
        product.save(
            update_fields=["price", "discount_price", "is_in_stock", "updated_at"]
        )

        product_discover.product_last_scraped_at = product_last_scraped_at
        product_discover.save(update_fields=["product_last_scraped_at"])

        return product

    @staticmethod
    def create_or_update_scraped_product(
        *,
        product: Product | None,
        product_discover: ProductDiscover,
        brand: Brand | None,
        validated_data: dict,
    ) -> None:
        product_last_scraped_at = timezone.now()

        if product is None:
            product = ProductService._create_scraped_product(
                product_discover=product_discover,
                brand=brand,
                validated_data=validated_data,
                product_last_scraped_at=product_last_scraped_at,
            )

            logger.info(
                f"Successfully added a new product ({product.pk}) {product.name} ..."
            )
        else:
            product = ProductService._update_scraped_product(
                product=product,
                product_discover=product_discover,
                validated_data=validated_data,
                product_last_scraped_at=product_last_scraped_at,
            )

            logger.info(
                f"Successfully updated product ({product.pk}) {product.name} ..."
            )


class BrandService:
    @staticmethod
    def get_brands_with_product_count(name: str) -> QuerySet:
        return (
            Brand.objects.annotate(
                included=Case(
                    When(product__name__icontains=name, then=Value(True)),
                    default=Value(False),
                    output_field=BooleanField(),
                )
            )
            .values("id", "name")
            .annotate(
                products_by_brand_count=Count("included", filter=Q(included=True))
            )
            .order_by("name")
        )

    @staticmethod
    def get_or_create_brand_by_name(*, name: str | None) -> Brand | None:
        if not name:
            return None

        brand, is_created = Brand.objects.get_or_create(name=name)

        log_action = "created" if is_created else "loaded"
        logger.info(f"Succesfully {log_action} brand ({brand.pk}) {brand.name} ...")

        return brand


class ProductDiscoverService:
    # TODO: log
    @staticmethod
    def update_or_create_many_product_discovers(
        *,
        pharmacy: Pharmacy,
        run_started_at: timezone.datetime,
        product_urls: list[str],
    ) -> None:
        for url in product_urls:
            ProductDiscover.objects.update_or_create(
                url=url,
                pharmacy=pharmacy,
                defaults={
                    "is_active": True,
                    "last_seen_at": run_started_at,
                },
                create_defaults={
                    "is_active": True,
                    "last_seen_at": run_started_at,
                },
            )

    # TODO: log
    @staticmethod
    def update_all_product_discovers_status_by_run_started_at(
        *,
        pharmacy: Pharmacy,
        run_started_at: timezone.datetime,
    ) -> None:
        ProductDiscover.objects.filter(
            pharmacy=pharmacy, last_seen_at__lt=run_started_at
        ).update(is_active=False)
