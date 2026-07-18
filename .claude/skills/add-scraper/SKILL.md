---
name: add-scraper
description: Add a new pharmacy scraper vendor package under backend/src/scrapers/. Use when asked to support scraping a new pharmacy website.
---

Scrapers are per-pharmacy packages loaded dynamically by name: `shared/imports.load_pharmacy_fns(pharmacy_name)` imports `scrapers.<pharmacy_name.lower()>` and requires exactly these three functions to be exported. The Celery tasks in `scrapers/tasks.py` drive everything.

## Steps

1. Study an existing vendor package first (`vitamini/` is the simplest; `annifarm/`, `apteka24/`, `zegin/` are the others) and mirror its structure.

2. Create `backend/src/scrapers/<pharmacy>/` with these modules:
   - `selectors.py` — CSS selector constants for the catalog page (product card, name, prices, URL).
   - `url.py` — `get_catalog_url_by_page(base_url, page_num, qs_str=None) -> str` building the paginated catalog URL.
   - `normalization.py` — vendor-specific string cleanup (e.g. `normalize_price_str`); reuse `shared/normalization.py` helpers where possible.
   - `validators.py` — a pydantic `CatalogProduct(shared.validators.BaseCatalogProduct)` with `BeforeValidator`s applying the normalizers.
   - `catalog.py` — `extract_cards_from_page(soup) -> list[Tag]` (raise `shared.exceptions.CardsNotFoundError` when no cards) and `get_products_from_cards(cards) -> list[dict]` returning `CatalogProduct(**data).model_dump()` per card, skipping cards that fail validation. Read tag attributes (e.g. `href`) via `get_stripped_attribute` from `shared/soup.py` — never `element.get("href").strip()`, which crashes the whole page task when the attribute is missing.
   - `__init__.py` — re-export the three required functions:
     `get_catalog_url_by_page`, `extract_cards_from_page`, `get_products_from_cards` (see `shared/imports.REQUIRED_FNS`).

3. Each product dict must provide the `BaseCatalogProduct` fields (check `shared/validators.py` for the current set: name, brand, price, discount_price, url).

4. Wire up data (no code registration needed): a `Pharmacy` row whose `name` matches the package name (case-insensitive) and one or more active `PharmacyCatalog` rows (URL without page, `max_pages`, `page_numbering_starts_at_zero`, optional category and query-param string). These live in `products.models` and are managed via Django admin.

5. Verify by fetching a real catalog page and running the extraction functions against its soup (e.g. via `docker compose -f compose.dev.yaml exec web uv run manage.py shell`), then run `/check` backend gates.
