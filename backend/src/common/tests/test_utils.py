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
        ("Њега", "Njega"),
        ("10 ќесички", "10 kjesichki"),
        ("Ќесе", "Kjese"),
        ("Ѓумбир", "Gjumbir"),
        ("леѓа", "legja"),
        ("Љубов", "Ljubov"),
        ("биљни", "biljni"),
        ("Ѕвезда", "Dzvezda"),
        ("ѕид", "dzid"),
    ],
)
def test_transliterates_cyrillic(cyrillic: str, latin: str) -> None:
    assert transliterate_cyrillic_to_latin(cyrillic) == latin


MACEDONIAN_ALPHABET = "АБВГДЃЕЖЗЅИЈКЛЉМНЊОПРСТЌУФХЦЧЏШ"


@pytest.mark.parametrize("letter", MACEDONIAN_ALPHABET + MACEDONIAN_ALPHABET.lower())
def test_maps_every_macedonian_letter_to_ascii(letter: str) -> None:
    latin = transliterate_cyrillic_to_latin(letter)

    assert latin is not None
    assert latin.isascii()
    assert latin[0].isupper() == letter.isupper()


def test_keeps_latin_digits_and_symbols() -> None:
    assert transliterate_cyrillic_to_latin("Omega-3 1000mg (60 капсули)") == (
        "Omega-3 1000mg (60 kapsuli)"
    )
