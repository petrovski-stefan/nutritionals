---
name: check
description: Run all quality gates for this repo — frontend lint + typecheck/build and backend flake8 + mypy. Use before declaring a change done or committing.
---

Run the checks relevant to what changed (both sets if the change spans frontend and backend). Run independent commands in parallel.

## Frontend (in `frontend/`)

```sh
npm run lint
npm run build      # runs tsc -b (the type check) then vite build
```

## Backend (in `backend/`)

```sh
uv run flake8 --config=setup.cfg
uv run mypy src --config-file=setup.cfg
```

Known issue: mypy's `setup.cfg` references `core.settings.shared`, which no longer exists (base settings live in `core/settings/django.py`). If mypy fails resolving settings, report that as the pre-existing config mismatch — don't try to fix it as part of an unrelated change.

Report each command's pass/fail. Fix failures caused by the current change; list pre-existing failures separately without fixing them unless asked.
