# Backend

Django 5.2 + DRF, Python 3.13, Postgres, Redis and Celery, managed with **uv**. Source is in `src/`.

## Running

The Docker Compose commands are in the root `CLAUDE.md`.

- `web` runs `migrate` and `collectstatic` on startup.
- `manage.py` defaults to `core.settings.development`. Settings are in `core/settings/`: `django.py` (base), `development.py`, `production.py` and `celery.py`.
- Env file: `backend/.env` (template: `backend/.env.template`). Settings require `OPENAI_API_KEY`.

## Checks

Run on the host, from `backend/`:

```sh
uv run flake8 --config=setup.cfg
uv run mypy src --config-file=setup.cfg
```

- Both tools have a backlog of pre-existing errors, so only errors in code you touched count as regressions. The baseline is in `.claude/skills/check/SKILL.md`.
- flake8 line length is 100. Migrations and settings are excluded from flake8 and mypy.
- There are no tests yet: every `tests.py` is a stub.

## Apps

| Path (in `src/`) | Responsibility |
|---|---|
| `core/` | Settings, root URLs, Celery app |
| `common/` | `BaseModel`, auth mixins, response renderer, transliteration util |
| `integrations/` | OpenAI client. A plain package, not a Django app |
| `products/` | Products, groups, brands, categories, pharmacies, search, smart search (`ai/`), grouping task |
| `mylists/` | User shopping lists |
| `users/` | Registration and JWT login |
| `scrapers/` | Per-pharmacy packages, `shared/` helpers, scrape tasks |

Imports between apps go one way: `mylists` and `scrapers` → `products` → `integrations`. Every app may use `common`.

## Layering

```
thin view (APIView or DRF generics) → services/ function modules
```

Most flows have one entry point and one service call, so extra layers would add files without adding value.

- Reads and writes both live in `services/`. Do not add `use_cases/` or `selectors/`.
- Reusable query pieces are QuerySet methods in the app's `querysets.py`, attached with `as_manager()`, such as `Product.objects.public()`. Each method adds one filter or one annotation. Joins, `.only()`, prefetches, ordering and limits belong to the service function for one endpoint, so read functions don't share a built queryset. Keep the default manager unfiltered. ORM expressions shared across querysets and services, such as `discount_percent()`, go in the app's `expressions.py`.
- `users/use_cases/register_user.py` is the one leftover. It will be folded into `users/services/user.py`, so don't copy the pattern.
- Orchestration is a service calling other services. Keep the import graph acyclic.
- Views contain no ORM calls.
- Services are imported under an alias: `from .services import product as product_service`. New public functions take keyword-only arguments.
- When a service module mixes workflows and gets hard to work in, split it by workflow inside `services/` (for example `ingest.py`, `grouping.py`).
- Don't refactor existing code to match these rules unless asked.

## Conventions

- **Auth:** SimpleJWT via `common/mixins.py`. Use `JWTAuthMixin` for user endpoints and `NoAuthMixin` for public ones. `OptionalAuthMixin` exists, but no view uses it.
- **Errors:** define `APIException` subclasses with a `default_code` in the app's `exceptions.py`, and raise them from services.
- **Models:** `common.models.BaseModel` provides `created_at` and `updated_at`. `updated_at` is `auto_now`, so list it in `update_fields` or it won't be written.
- **Serializers:** naming differs by app. `users` and `products` use `*InputSerializer` for input, and `mylists` uses per-action names such as `MyListCreateSerializer`. Match the app you're editing.
- **OpenAI:** only `integrations/openai.py` imports the SDK. Call `get_response()` and handle `AIResponseError`. Calling code for smart search and enrichment lives in `products/ai/`.

## Scrapers and Celery

- Each pharmacy is a package under `scrapers/`, loaded by name through `shared/imports.load_pharmacy_fns`. To add one, use the `/add-scraper` skill.
- Scrape flow: `schedule_pharmacy_catalogs_scrape` → `schedule_catalog_page_scrape` → `scrape_pharmacy_page` → `create_or_update_scraped_product` (in `products/services/product.py`).
- Creating a new product makes an OpenAI enrichment call.
- `products/tasks.py: group_products` assigns products to groups.
- `Pharmacy` and `PharmacyCatalog` are in `products.models` and are managed through Django admin.
- Beat uses `DatabaseScheduler`, so schedules live in the database, not in code.
