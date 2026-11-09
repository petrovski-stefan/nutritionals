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
uv run ruff check
uv run ruff format --check
uv run mypy src --config-file=setup.cfg
uv run deptry src
uv run complexipy
uv run pyscn check --select complexity,deadcode,deps src
```

- ruff replaces flake8. Line length is 100, and migrations are excluded. Config is in `pyproject.toml` (ruff, deptry, complexipy, pyscn) and `setup.cfg` (mypy).
- complexipy fails on any function with cognitive complexity over 15. pyscn fails on dead code, circular imports and functions longer than 110 lines.
- Old code has violations that are frozen as backlog, so every check passes on a clean tree. New code must pass without new suppressions:
  - ruff: per-file `per-file-ignores` and `[tool.ruff.format] exclude` entries in `pyproject.toml`.
  - mypy: per-module `disable_error_code` sections in `setup.cfg`.
  - deptry: the `DEP003` ignore. pyscn: the 110-line threshold, which drops to 100 once `scrape_pharmacy_page` is split.
  - complexipy: `# complexipy: ignore` on `assign_product_to_group`.
- The backlog shrinks one step at a time. When a file is fixed, delete its backlog entry or ignore comment. Never add or widen one.
- Code clones are reported with `uv run pyscn check --select clones src`. The report is informational and is not part of the gate.
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
- Reusable query pieces are QuerySet methods in the app's `querysets.py`, attached with `as_manager()`, such as `Product.objects.public()`. Each method adds one filter or one annotation. Joins, `.only()`, prefetches, ordering and limits belong to the service function for one endpoint, so read functions don't share a built queryset. Keep the default manager unfiltered. ORM expressions shared across querysets and services, such as `discount_percent()`, go in the app's `expressions.py`. Conditions applied through a relation go there too, such as `public_product_q(prefix="product__")`. `.public()` uses the same helper, so each rule is defined once.
- Orchestration is a service calling other services. Keep the import graph acyclic.
- Views contain no ORM calls.
- Services are imported under an alias: `from .services import product as product_service`. New public functions take keyword-only arguments.
- When a service module mixes workflows and gets hard to work in, split it by workflow inside `services/` (for example `ingest.py`, `grouping.py`).
- Don't refactor existing code to match these rules unless asked.

## Conventions

- **Auth:** SimpleJWT via `common/mixins.py`. Use `JWTAuthMixin` for user endpoints and `NoAuthMixin` for public ones. `OptionalAuthMixin` exists, but no view uses it.
- **Errors:** define `APIException` subclasses with a `default_code` in the app's `exceptions.py`, and raise them from services.
- **Logging:** `logger = logging.getLogger(__name__)`. Pass values as `%s` arguments, never f-strings (ruff G004 fails the check). INFO and above also get `extra={...}` fields such as `product_id` or `pharmacy`, which the production JSON output makes queryable. `extra` keys must not reuse `LogRecord` attributes such as `created`, `name` or `msg`. Every line gets `request_id` and `task_id` from `common/log.py`. Use DEBUG for "nothing changed" lines, and `logger.exception` when a loop catches an error and moves on.
- **Models:** `common.models.BaseModel` provides `created_at` and `updated_at`. `updated_at` is `auto_now`, so list it in `update_fields` or it won't be written.
- **Serializers:** naming differs by app. `users` and `products` use `*InputSerializer` for input, and `mylists` uses per-action names such as `MyListCreateSerializer`. Match the app you're editing.
- **OpenAI:** only `integrations/openai.py` imports the SDK. Call `get_response()` and handle `AIResponseError`. Calling code for smart search and enrichment lives in `products/ai/`.

## Scrapers and Celery

- Each pharmacy is a package under `scrapers/`, loaded by name through `shared/imports.load_pharmacy_fns`. To add one, use the `/add-scraper` skill.
- Scrape flow: `schedule_pharmacy_catalogs_scrape` → `schedule_catalog_page_scrape` → `scrape_pharmacy_page` → `create_or_update_scraped_product` (in `products/services/product.py`).
- Creating a new product makes an OpenAI enrichment call.
- `products/tasks.py: group_products` assigns products to groups.
- `scrapers/tasks.py: check_scrape_freshness` logs an ERROR for each pharmacy with an active catalog that hasn't been scraped within `STALE_AFTER_HOURS`. It assumes the catalog scrape runs daily.
- `Pharmacy` and `PharmacyCatalog` are in `products.models` and are managed through Django admin.
- Flower monitors tasks (`flower` compose service, port 5555). It needs task events, which `core/settings/celery.py` turns on.
- Beat uses `DatabaseScheduler`, so schedules live in the database, not in code.
