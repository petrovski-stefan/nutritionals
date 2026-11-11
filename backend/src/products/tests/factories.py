import factory
from django.utils import timezone
from factory.django import DjangoModelFactory

from products.models import (
    Brand,
    Category,
    Pharmacy,
    PharmacyCatalog,
    Product,
    ProductGroup,
)


class PharmacyFactory(DjangoModelFactory[Pharmacy]):
    class Meta:
        model = Pharmacy

    name = factory.Sequence(lambda n: f"Pharmacy {n}")
    homepage = factory.Sequence(lambda n: f"https://pharmacy{n}.example.com/")


class CategoryFactory(DjangoModelFactory[Category]):
    class Meta:
        model = Category

    name = factory.Sequence(lambda n: f"Category {n}")


class BrandFactory(DjangoModelFactory[Brand]):
    class Meta:
        model = Brand

    name = factory.Sequence(lambda n: f"Brand {n}")
    normalized_name = factory.LazyAttribute(lambda o: o.name.lower().replace(" ", ""))


class PharmacyCatalogFactory(DjangoModelFactory[PharmacyCatalog]):
    class Meta:
        model = PharmacyCatalog

    url_without_page = factory.Sequence(lambda n: f"https://pharmacy.example.com/catalog{n}/")
    max_pages = 2
    pharmacy = factory.SubFactory(PharmacyFactory)


class ProductGroupFactory(DjangoModelFactory[ProductGroup]):
    """Pass categories=[...] to attach categories"""

    class Meta:
        model = ProductGroup
        skip_postgeneration_save = True

    name = factory.Sequence(lambda n: f"Group {n}")

    @factory.post_generation
    def categories(self, create: bool, extracted: list[Category] | None, **kwargs) -> None:
        if create and extracted:
            self.categories.add(*extracted)


class ProductFactory(DjangoModelFactory[Product]):
    """Pass categories=[...] to attach categories"""

    class Meta:
        model = Product
        skip_postgeneration_save = True

    name = factory.Sequence(lambda n: f"Vitamin C {n}")
    normalized_name = factory.LazyAttribute(lambda o: o.name.lower())
    price = 500.0
    discount_price = None
    pharmacy = factory.SubFactory(PharmacyFactory)
    url = factory.Sequence(lambda n: f"https://pharmacy.example.com/products/{n}/")
    last_scraped_at = factory.LazyFunction(timezone.now)
    form_with_count = "30 tableti"
    is_reviewed = True

    @factory.post_generation
    def categories(self, create: bool, extracted: list[Category] | None, **kwargs) -> None:
        if create and extracted:
            self.categories.add(*extracted)
