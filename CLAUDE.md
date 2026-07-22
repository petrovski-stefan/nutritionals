# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

Monorepo: `backend/` (Django 5.2 + DRF, Python 3.13, managed with **uv**) and `frontend/` (React 19 + TypeScript + Vite, managed with **npm**). Docker Compose orchestrates everything.

## Dev workflow

The backend runs **only via Docker Compose** — do not run `manage.py` or Postgres/Redis locally:

```sh
docker compose -f compose.dev.yaml up                 # web, database, redis, celery_worker, celery_worker_beat
docker compose -f compose.dev.yaml exec web uv run manage.py <command>   # migrate, makemigrations, test, ...
```

Frontend runs locally: `npm run dev` in `frontend/`.

Env files: `backend/.env` (template: `backend/.env.template`) and `frontend/.env` (example: `frontend/.env.example`). `OPENAI_API_KEY` is required by backend settings (smart search / category inference).

## Checks

There is no CI — run these before considering a change done:

- Frontend (in `frontend/`): `npm run lint` and `npm run build` (runs `tsc -b`, which is the type check).
- Backend (in `backend/`): `uv run flake8 --config=setup.cfg` and `uv run mypy src --config-file=setup.cfg`.

Note: mypy has a backlog of pre-existing errors (~97 across scrapers/products/users as of 2026-07-18) from the period its settings config was broken — treat only errors in code you touched as regressions.

## Code style

- Frontend formatting via Prettier (`.prettierrc`): single quotes, width 100, one JSX attribute per line, Tailwind class sorting. There's no npm script — use `npx prettier --write <file>`.
- ESLint uses `strictTypeChecked` + sonarjs + simple-import-sort; tsconfig has `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`. Expect stricter errors than typical React projects.
- Backend: flake8 line length 100; migrations and settings are excluded from lint/mypy.

## Architecture conventions

- Backend apps (`users`, `products`, `mylists`) are moving toward: thin class-based `APIView` → `use_cases/` (orchestration) → `services/` as **function modules** (e.g. `user_service.create_user(...)`), with input/output serializers split (`UserRegisterInputSerializer`). This refactor is **still evolving**: follow the pattern where it already exists, but don't refactor old code to match unless asked.
- All API responses are wrapped by `common/renderers.StandardizedJSONRenderer` as `{"success": true, "data": ...}` — the frontend unwraps `.data.data`.
- Auth uses SimpleJWT via mixins in `common/mixins.py` (`JWTAuthMixin`, `NoAuthMixin`, `OptionalAuthMixin`).
- `APPEND_SLASH = False` — API URLs must match exactly, no trailing-slash fallback.
- Frontend is feature-sliced: `src/features/<feature>/` with flat `api.ts`, `types.ts`, `schemas.ts` (zod), `errorMessages.ts`, `queries.ts` (query-key factory), plus `components/` and `hooks/` — a flat file may become a same-named directory (`api/`, `types/`) when it genuinely needs splitting (see `products`). Feature `api.ts` files map camelCase form fields → snake_case payloads. UI text is written inline in components (no locale files).
- **Feature dependency rule**: features import other features in one documented direction only — currently `products → my-lists` — and cycles are forbidden. Anything two features need lives in `src/shared/` (`hooks/`, `lib/`, `types/`, `utils/`) — the single home for cross-feature code (the axios instance is `src/shared/lib/axios.ts`).
- Imports use the `@/` alias for anything outside the current directory; only sibling `./` imports stay relative. No `../` paths.
- Data fetching via TanStack Query; every feature defines its query keys in a `queries.ts` factory (`myListKeys`, `productKeys`, `pharmacyKeys`) — never inline key arrays in hooks.
- User-facing UI text is in **Macedonian** — keep new UI strings in Macedonian.

## Git

- Commit directly on `v2-dev` (the active development branch). `main` is for releases.
- Use Conventional Commits: `feat(frontend): ...`, `refactor(backend): ...`, `chore: ...`.
