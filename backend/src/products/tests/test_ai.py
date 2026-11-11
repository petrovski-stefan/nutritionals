from unittest.mock import MagicMock

import pytest
from pytest_mock import MockerFixture

from integrations.openai import AIResponseError
from products.ai import smart_search, supplement_enrichment
from products.ai.supplement_enrichment import SupplementEnrichment


def test_enrichment_schema_cleans_the_model_output() -> None:
    result = SupplementEnrichment.model_validate(
        {
            "categories": [{"name": "  витамини ", "confidence": 0.9}],
            "status": True,
            "dosage": "1000 МГ",
            "form_count": None,
        }
    )

    assert result.categories[0].name == "Витамини"
    assert result.dosage == "1000 mg"
    assert result.form_count == ""


class TestEnrichSupplement:
    @pytest.fixture
    def get_response(self, mocker: MockerFixture) -> MagicMock:
        return mocker.patch.object(supplement_enrichment, "get_response")

    def test_returns_the_enrichment(self, get_response: MagicMock) -> None:
        get_response.return_value = SupplementEnrichment(
            categories=[{"name": "Vitamini", "confidence": 0.9}],
            status=True,
            dosage="1000 mg",
            form_count="60 kapsuli",
        )

        result = supplement_enrichment.enrich_supplement(
            name="Vitamin C", categories=["Vitamini", "Minerali"]
        )

        assert result == ("60 kapsuli", "1000 mg", [{"name": "Vitamini", "confidence": 0.9}])
        kwargs = get_response.call_args.kwargs
        assert kwargs["input"] == {"name": "Vitamin C"}
        assert kwargs["schema"] is SupplementEnrichment
        assert "1. Vitamini\n2. Minerali" in kwargs["instructions"]

    def test_returns_empty_values_when_the_ai_fails(self, get_response: MagicMock) -> None:
        get_response.side_effect = AIResponseError("down")

        assert supplement_enrichment.enrich_supplement(name="X", categories=["A"]) == ("", "", [])

    def test_skips_the_ai_without_categories(self, get_response: MagicMock) -> None:
        assert supplement_enrichment.enrich_supplement(name="X", categories=[]) == ("", "", [])
        get_response.assert_not_called()


@pytest.fixture
def smart_search_get_response(mocker: MockerFixture) -> MagicMock:
    return mocker.patch.object(smart_search, "get_response")


def test_convert_query_to_tags_strips_keywords(smart_search_get_response: MagicMock) -> None:
    smart_search_get_response.return_value = smart_search.TagList(keywords=[" melatonin ", "5-htp"])

    assert smart_search.convert_query_to_tags(latin_query="za spienje") == ["melatonin", "5-htp"]
    assert smart_search_get_response.call_args.kwargs["input"] == {"query": "za spienje"}


def test_smart_search_returns_the_ranked_ids(smart_search_get_response: MagicMock) -> None:
    smart_search_get_response.return_value = smart_search.RankedProductIds(product_ids=[3, 1])
    candidates = [{"id": 1, "name": "A"}, {"id": 3, "name": "B"}]

    assert smart_search.smart_search(latin_query="sleep", candidates=candidates) == [3, 1]
    assert smart_search_get_response.call_args.kwargs["input"] == {
        "query": "sleep",
        "products": candidates,
    }
