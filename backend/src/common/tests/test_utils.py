import pytest

from common.utils import transliterate_cyrillic_to_latin


@pytest.mark.parametrize("text", [None, ""])
def test_returns_none_for_empty_text(text: str | None) -> None:
    assert transliterate_cyrillic_to_latin(text) is None


@pytest.mark.parametrize(
    ("cyrillic", "latin"),
    [
        ("Магнезиум", "Magnezium"),
        ("ВИТАМИН", "VITAMIN"),
        ("жолчка", "zholchka"),
        ("Чај од џинџер", "Chaj od dzindzer"),
        ("Шипинка", "Shipinka"),
        ("коњак", "konjak"),
    ],
)
def test_transliterates_cyrillic(cyrillic: str, latin: str) -> None:
    assert transliterate_cyrillic_to_latin(cyrillic) == latin


def test_keeps_latin_digits_and_symbols() -> None:
    assert transliterate_cyrillic_to_latin("Omega-3 1000mg (60 капсули)") == (
        "Omega-3 1000mg (60 kapsuli)"
    )
