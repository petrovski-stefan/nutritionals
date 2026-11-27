import pytest

from products import exceptions
from products.services import product as product_service
from products.tests.factories import BrandFactory, ProductFactory


class TestNormalizeSearchQuery:
    def test_strips_and_transliterates(self) -> None:
        assert product_service.normalize_search_query(q="  магнезиум ") == "magnezium"

    def test_counts_length_after_transliteration(self) -> None:
        assert product_service.normalize_search_query(q="ж") == "zh"

    @pytest.mark.parametrize("q", ["", "   "])
    def test_rejects_an_empty_query(self, q: str) -> None:
        with pytest.raises(exceptions.ProductSearchQueryEmptyAPIError):
            product_service.normalize_search_query(q=q)

    def test_rejects_a_one_letter_query(self) -> None:
        with pytest.raises(exceptions.ProductSearchQueryShortAPIError):
            product_service.normalize_search_query(q=" a ")


@pytest.mark.django_db
class TestListMatchingProducts:
    def test_short_query_matches_brand_or_name_substrings(self) -> None:
        by_brand = ProductFactory(normalized_name="vitamin c", brand=BrandFactory(name="Solgar"))
        by_name = ProductFactory(normalized_name="omega solar")
        ProductFactory(normalized_name="zinc")

        assert set(product_service.list_matching_products(latin_q="sol")) == {by_brand, by_name}

    def test_medium_query_matches_by_similarity(self) -> None:
        match = ProductFactory(normalized_name="magnesium citrate 200mg")
        ProductFactory(normalized_name="omega 3 fish oil")

        assert list(product_service.list_matching_products(latin_q="magnezium")) == [match]

    def test_long_query_matches_by_similarity(self) -> None:
        match = ProductFactory(normalized_name="magnesium citrate 200mg")
        ProductFactory(normalized_name="omega 3 fish oil")

        result = product_service.list_matching_products(latin_q="magnesium citrate 400mg")

        assert list(result) == [match]

    def test_excludes_unreviewed_products(self) -> None:
        ProductFactory(normalized_name="vitamin c", is_reviewed=False)

        assert not product_service.list_matching_products(latin_q="vit").exists()
