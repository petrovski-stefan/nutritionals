import pytest

from products.models import Brand
from products.services import brand as brand_service
from products.tests.factories import BrandFactory, ProductFactory, ProductGroupFactory


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("Solgar", "solgar"),
        ("Now Foods", "nowfoods"),
        ("  Doctor's   Best ", "doctor'sbest"),
        ("Солгар", "solgar"),
        ("", ""),
        (None, ""),
    ],
)
def test_get_normalized_brand_name(name: str | None, expected: str) -> None:
    assert brand_service.get_normalized_brand_name(name=name) == expected


@pytest.mark.django_db
class TestGetOrCreateBrandByName:
    def test_returns_none_without_a_name(self) -> None:
        assert brand_service.get_or_create_brand_by_name(name=None) is None
        assert not Brand.objects.exists()

    def test_creates_a_brand_with_its_normalized_name(self) -> None:
        brand = brand_service.get_or_create_brand_by_name(name="Now Foods")

        assert brand is not None
        assert (brand.name, brand.normalized_name) == ("Now Foods", "nowfoods")

    def test_reuses_a_brand_with_the_same_normalized_name(self) -> None:
        existing = BrandFactory(name="Now Foods", normalized_name="nowfoods")

        assert brand_service.get_or_create_brand_by_name(name="NOW  FOODS") == existing
        assert Brand.objects.count() == 1


@pytest.mark.django_db
class TestInferBrandFromProductName:
    def test_returns_none_without_names(self) -> None:
        assert (
            brand_service.infer_brand_from_product_name(
                product_name=None, normalized_product_name="x"
            )
            is None
        )
        assert (
            brand_service.infer_brand_from_product_name(
                product_name="x", normalized_product_name=None
            )
            is None
        )

    @pytest.mark.parametrize(
        ("product_name", "brand_name"),
        [
            ("Solgar Vitamin C 1000mg", "Solgar"),
            ("Now Foods Omega-3 180 caps", "Now Foods"),
            ("Солгар Витамин Ц", "Solgar"),
        ],
    )
    def test_matches_the_first_words(self, product_name: str, brand_name: str) -> None:
        brand = BrandFactory(name=brand_name)

        inferred = brand_service.infer_brand_from_product_name(
            product_name=product_name, normalized_product_name="vitamin"
        )

        assert inferred == brand

    def test_falls_back_to_a_public_product_with_the_same_normalized_name(self) -> None:
        brand = BrandFactory()
        ProductFactory(normalized_name="vitamin c 1000mg", brand=brand)

        inferred = brand_service.infer_brand_from_product_name(
            product_name="Vitamin C 1000mg", normalized_product_name="vitamin c 1000mg"
        )

        assert inferred == brand

    def test_ignores_unreviewed_products_in_the_fallback(self) -> None:
        ProductFactory(normalized_name="vitamin c 1000mg", brand=BrandFactory(), is_reviewed=False)

        inferred = brand_service.infer_brand_from_product_name(
            product_name="Vitamin C 1000mg", normalized_product_name="vitamin c 1000mg"
        )

        assert inferred is None


@pytest.mark.django_db
def test_list_brands_keeps_brands_with_public_products_ordered_by_name() -> None:
    zinc = BrandFactory(name="Zinc Co")
    alpha = BrandFactory(name="Alpha")
    ProductFactory(brand=zinc)
    ProductFactory(brand=alpha)
    ProductFactory(brand=alpha)
    ProductFactory(brand=BrandFactory(name="Only unreviewed"), is_reviewed=False)
    BrandFactory(name="No products")

    assert list(brand_service.list_brands()) == [
        {"id": alpha.pk, "name": "Alpha"},
        {"id": zinc.pk, "name": "Zinc Co"},
    ]


@pytest.mark.django_db
def test_with_counts_annotates_product_and_group_counts() -> None:
    brand = BrandFactory()
    ProductFactory(brand=brand, is_reviewed=True)
    ProductFactory(brand=brand, is_reviewed=False)
    ProductGroupFactory(brand=brand, is_reviewed=True)
    ProductGroupFactory(brand=brand, is_reviewed=False)
    ProductGroupFactory(brand=brand, is_reviewed=False)

    annotated = brand_service.with_counts(queryset=Brand.objects.all()).get()

    assert annotated.total_product_count == 2
    assert annotated.reviewed_product_count == 1
    assert annotated.total_group_count == 3
    assert annotated.reviewed_group_count == 1
