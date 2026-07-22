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

Known issue: mypy exits non-zero due to a backlog of pre-existing errors (~97 across scrapers/products/users as of 2026-07-18, from the period its settings config was broken). Compare against that baseline: only errors in files the current change touched count as failures; also flag if the total rises above the baseline. Same for flake8's 6 pre-existing F401 warnings (unused imports in `tests.py` stubs, `users/admin.py`, `users/models.py`). Don't fix backlog items as part of an unrelated change.

Report each command's pass/fail. Fix failures caused by the current change; list pre-existing failures separately without fixing them unless asked.
