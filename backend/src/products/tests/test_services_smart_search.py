from unittest.mock import MagicMock

import pytest
from pytest_mock import MockerFixture

from products.models import ProductGroup
from products.services import smart_search as smart_search_service
from products.tests.factories import ProductFactory, ProductGroupFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def smart_search_ai(mocker: MockerFixture) -> MagicMock:
    return mocker.patch.object(smart_search_service, "smart_search_ai")


def magnesium_group(name: str) -> ProductGroup:
    group = ProductGroupFactory(name=name)
    ProductFactory(group=group, normalized_name=f"magnesium {name}")

    return group


class TestGetSmartSearchedProductgroups:
    def test_returns_nothing_without_keywords(self, smart_search_ai: MagicMock) -> None:
        smart_search_ai.convert_query_to_tags.return_value = []

        result = smart_search_service.get_smart_searched_productgroups(query="weather today")

        assert list(result) == []
        smart_search_ai.smart_search.assert_not_called()

    def test_keeps_the_ai_order_and_drops_unknown_and_repeated_ids(
        self, smart_search_ai: MagicMock
    ) -> None:
        first = magnesium_group("citrate")
        second = magnesium_group("oxide")
        magnesium_group("glycinate")
        smart_search_ai.convert_query_to_tags.return_value = ["magnesium"]
        smart_search_ai.smart_search.return_value = [second.pk, 999_999, first.pk, second.pk]

        result = smart_search_service.get_smart_searched_productgroups(query="za spienje")

        assert list(result) == [second, first]

    def test_offers_only_similar_public_groups_as_candidates(
        self, smart_search_ai: MagicMock
    ) -> None:
        similar = magnesium_group("citrate")
        hidden = ProductGroupFactory(is_reviewed=False)
        ProductFactory(group=hidden, normalized_name="magnesium oxide")
        ProductFactory(group=ProductGroupFactory(), normalized_name="omega 3 fish oil")
        smart_search_ai.convert_query_to_tags.return_value = ["magnesium", "magnesium citrate"]
        smart_search_ai.smart_search.return_value = []

        result = smart_search_service.get_smart_searched_productgroups(query="за спиење")

        assert list(result) == []
        smart_search_ai.convert_query_to_tags.assert_called_once_with(latin_query="za spienje")
        smart_search_ai.smart_search.assert_called_once_with(
            latin_query="za spienje", candidates=[{"id": similar.pk, "name": similar.name}]
        )
