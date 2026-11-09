---
name: check
description: Run all quality gates for this repo — frontend lint + typecheck/build and backend ruff, mypy, deptry, complexipy and pyscn. Use before declaring a change done or committing.
---

Run the checks relevant to what changed (both sets if the change spans frontend and backend). Run independent commands in parallel.

## Frontend (in `frontend/`)

```sh
npm run lint
npm run build      # runs tsc -b (the type check) then vite build
```

## Backend (in `backend/`)

```sh
uv run ruff check
uv run ruff format --check
uv run mypy src --config-file=setup.cfg
uv run deptry src
uv run complexipy
uv run pyscn check --select complexity,deadcode,deps src
```

Report each command's pass/fail. Fix failures caused by the current change; list pre-existing failures separately without fixing them unless asked.

Backend checks pass on a clean tree because existing violations are frozen in config. A backend failure means the change added a violation: fix the code. Don't widen a backlog entry, and don't add a new one.
