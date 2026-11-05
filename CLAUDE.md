# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

Monorepo orchestrated by Docker Compose. Each side has its own guidance file, which loads when files on that side are read:

- `backend/`: Django 5.2 + DRF, Python 3.13, managed with **uv**. See `backend/CLAUDE.md`.
- `frontend/`: React 19 + TypeScript + Vite, managed with **npm**. See `frontend/CLAUDE.md`.

## Running

The backend runs **only via Docker Compose**. Do not run `manage.py`, Postgres or Redis on the host:

```sh
docker compose -f compose.dev.yaml up                                    # web, database, redis, celery_worker, celery_worker_beat
docker compose -f compose.dev.yaml exec web uv run manage.py <command>   # migrate, makemigrations, shell, ...
```

The frontend runs on the host: `npm run dev` in `frontend/`.

## Checks

There is no CI and there are no tests. Before considering a change done, run the checks for each side you changed. The `/check` skill runs them, and the commands are in each side's `CLAUDE.md`.

## API contract

These rules span both sides, so change them together:

- `common/renderers.StandardizedJSONRenderer` wraps every response. Success is `{"success": true, "data": ...}`, and the frontend unwraps `.data.data`. Failure is `{"success": false, "type": ..., "errors": [{"code", "detail", "attr"}]}`, built by `drf-standardized-errors`.
- Error codes are part of the API. The frontend's `errorMessages.ts` files map them to Macedonian messages, so renaming a code breaks that mapping.
- `APPEND_SLASH = False` and every route ends in `/`, so URLs must match exactly.
- Payloads are snake_case. Frontend `api.ts` files map camelCase form fields to it.

## Git

- Changes go on a feature branch that PRs into `main`.
- Never commit or push. The user commits manually.
- Commit messages use Conventional Commits: `feat(frontend): ...`, `refactor(backend): ...`, `chore: ...`.
