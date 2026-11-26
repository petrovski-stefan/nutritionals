# Nutriceni

Nutriceni compares supplement prices across pharmacies in North Macedonia. It scrapes four pharmacy chains, groups listings of the same product from different stores, and shows them side by side so you can see which store is cheapest.

Live at [nutritionals-ceni.com](https://nutritionals-ceni.com). The interface is in Macedonian.

<!-- Add 2–3 screenshots here: home (light), compare prices (dark), smart search results -->
<!-- ![Home](docs/screenshots/home.png) -->

## Features

- **Search and compare.** Results show up as you type. The Compare page filters by brand and category, sorts by price or discount, and marks prices that haven't been refreshed recently.
- **Smart search.** Describe a goal such as "better sleep" and get matching supplements from the catalog. The OpenAI API turns the goal into supplement names, which are then fuzzy-matched against the products. Signed-in users only.
- **Lists.** Signed-in users can save products to lists and see each one's latest price.

## Stack

- **Backend:** Python 3.13, Django 5.2, Django REST Framework, SimpleJWT, Celery, BeautifulSoup, Pydantic, PostgreSQL, Redis
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, React Hook Form with zod, React Router
- **Deployment:** Docker Compose, nginx, gunicorn

Both sides are strictly typed and linted. The frontend runs ESLint `strictTypeChecked`, Knip and a strict `tsc` build. The backend runs ruff, mypy, deptry, complexipy, pyscn and pytest. GitHub Actions runs all of it on every pull request.

## How it works

Celery Beat starts a scrape of every pharmacy catalog on a schedule. Each pharmacy is its own package under `backend/src/scrapers/` and implements the same small interface, so adding a store doesn't touch the others. When a scrape finds a product it hasn't seen before, an OpenAI call assigns it categories.

A grouping task then puts each new product into an existing group or starts a new one. Candidate groups share its brand and a category, and the best one is chosen by trigram similarity of the normalized names (Postgres `pg_trgm`) plus matching dosage, form and count (e.g. "60 capsules").

The Django REST API wraps every response in one envelope, `{"success": true, "data": ...}`. Errors carry machine-readable codes, which the React frontend maps to Macedonian messages.

## Running locally

You need Docker and Node 22. The backend runs only in Docker Compose. The frontend runs on the host.

```sh
cp backend/.env.template backend/.env        # needs an OPENAI_API_KEY
docker compose -f compose.dev.yaml up        # web, postgres, redis, celery worker and beat, flower
docker compose -f compose.dev.yaml exec web uv run manage.py migrate

cd frontend
cp .env.example .env
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API (base path) | http://localhost:8000/api/v1/ |
| Django admin | http://localhost:8000/admin/ |
| Silk (request profiler) | http://localhost:8000/silk/ |
| Flower (Celery monitoring) | http://localhost:5555 |

Postgres and Redis are reachable only from inside the Compose network.

## Checks

```sh
# frontend/
npm run lint && npm run knip && npm run build

# backend/
uv run ruff check && uv run ruff format --check
uv run mypy src --config-file=setup.cfg
uv run deptry src && uv run complexipy
uv run pyscn check --select complexity,deadcode,deps src
```

The tests need Postgres, so they run inside the `web` container. With the stack up, from the repo root:

```sh
docker compose -f compose.dev.yaml exec web uv run pytest
```

## Layout

```
backend/src/
  core/          settings, URLs, Celery app
  common/        response renderer, auth mixins, base model
  integrations/  OpenAI client
  products/      products, groups, brands, categories, search, smart search
  mylists/       user lists
  users/         registration and JWT login
  scrapers/      one package per pharmacy, plus the scrape tasks
frontend/src/
  features/      auth, products, my-lists, pharmacies
  components/    shared UI
  context/       auth and theme
  shared/        hooks, utils, types, axios instance
  pages/         one component per route
nginx/           production reverse proxy
```
