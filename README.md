# Nutriceni 💊

**A full-stack price aggregator for dietary supplements across Macedonian pharmacies** — scrapes live prices, groups identical products from different stores, and helps users find the best deal, with an AI assistant that recommends supplements from a plain-language health goal.

![React](https://img.shields.io/badge/React_19-087EA4?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)
![Django](https://img.shields.io/badge/Django_5.2-092E20?logo=django&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.13-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-37814A?logo=celery&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?logo=docker&logoColor=white)

<!-- Add 2–3 screenshots here: home (light), compare prices (dark), smart search results -->
<!-- ![Home](docs/screenshots/home.png) -->

## What it does

Supplement prices in North Macedonia vary significantly between pharmacies, and no single place lets you compare them. Nutriceni solves that:

- 🔍 **Instant search** — type a product name, get matching products grouped across pharmacies right in the dropdown, each expandable to its live per-pharmacy offers starting from the lowest price
- ⚖️ **Price comparison** — identical products from different pharmacies are grouped side by side, filterable by brand and category, with discount badges and stale-price warnings
- 🤖 **Smart search (AI)** — describe a health goal in plain language (*"stronger immunity"*) and get supplement recommendations powered by the OpenAI API, grouped and ready for price comparison
- 📋 **My Lists** — registered users build and manage shopping lists, tracking each product's price and availability over time
- 🌙 **Dark mode**, fully responsive UI (360 px → ultrawide), localized in Macedonian

Price data is collected by **scheduled scrapers for 4 pharmacy chains** (Zegin, Apteka24, Vitamini, Annifarm), run as Celery tasks on a beat schedule, so listed prices stay fresh without manual intervention.

## Architecture

```
                    ┌─────────────────────────── backend (Django 5.2 + DRF) ───┐
 pharmacy sites ──▶ │ scrapers (per-vendor packages, BeautifulSoup)            │
                    │   └─ Celery workers + beat schedule ── Redis (broker)    │
                    │ products / mylists / users apps                          │
                    │   └─ thin APIView → use cases → service modules          │
                    │ PostgreSQL                                               │
                    └───────────────▲──────────────────────────────────────────┘
                                    │ REST (standardized JSON envelope, JWT auth)
                    ┌───────────────┴──────────────────────────────────────────┐
                    │ frontend (React 19 + TypeScript + Vite)                  │
                    │ feature-sliced: auth / products / my-lists / pharmacies  │
                    │ TanStack Query · React Hook Form + zod · Tailwind v4     │
                    └──────────────────────────────────────────────────────────┘
                     nginx + gunicorn in production, everything in Docker Compose
```

### Engineering highlights

**Frontend**
- **Feature-sliced architecture with an enforced dependency rule** — features may depend on each other in one documented direction only, no cycles; cross-feature code lives in a single `shared/` home
- **Design system built on semantic CSS tokens** (Tailwind v4 CSS-first config) — one source of truth for color, radius, shadow, and type scale; dark mode is a token flip, not per-component overrides
- **Strict type safety end to end**: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, ESLint `strictTypeChecked` + SonarJS — stricter than typical React codebases
- **Disciplined server state**: TanStack Query with per-feature query-key factories, `queryOptions`, and targeted cache invalidation
- Forms with React Hook Form + zod resolvers, including mapping backend validation error codes onto the right form fields

**Backend**
- Layered request flow: thin class-based views → use cases (orchestration) → **services as function modules**, with input/output serializers split per direction
- **Every API response wrapped in a standardized envelope** (`{"success": true, "data": ...}`) with machine-readable error codes (`drf-standardized-errors`) the frontend maps to localized messages
- **Pluggable scraper design** — each pharmacy is an isolated vendor package behind a common interface, so adding a chain doesn't touch existing ones
- JWT auth (SimpleJWT) via reusable view mixins (`JWTAuthMixin`, `OptionalAuthMixin`), category inference and smart search via the OpenAI API

**Infrastructure**
- Docker Compose for dev and prod (web, PostgreSQL, Redis, Celery worker + beat), nginx + gunicorn + WhiteNoise in production
- Python tooling with **uv**, linted with flake8 + mypy; frontend gated by ESLint + `tsc` strict builds

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query v5, React Hook Form, zod v4, React Router 7, Axios |
| Backend | Python 3.13, Django 5.2, Django REST Framework, SimpleJWT, Celery 5, BeautifulSoup4, OpenAI API, Pydantic |
| Data & infra | PostgreSQL, Redis, Docker Compose, nginx, gunicorn, Flower (task monitoring) |
| Quality | ESLint (strictTypeChecked, SonarJS), Prettier, flake8, mypy, uv |

## Running locally

Requires Docker and Node 20+.

```sh
# backend — everything runs in containers
cp backend/.env.template backend/.env        # fill in values (incl. OPENAI_API_KEY)
docker compose -f compose.dev.yaml up        # web, postgres, redis, celery worker + beat

docker compose -f compose.dev.yaml exec web uv run manage.py migrate

# frontend — runs on the host
cd frontend
cp .env.example .env
npm install
npm run dev                                  # http://localhost:5173
```

**Quality checks**

```sh
# frontend
npm run lint && npm run build                # eslint + tsc strict build

# backend
uv run flake8 --config=setup.cfg
uv run mypy src --config-file=setup.cfg
```

## Project structure

```
├── backend/src/
│   ├── core/            # settings, celery app
│   ├── common/          # renderers (response envelope), auth mixins
│   ├── users/           # JWT auth, registration (use cases + services)
│   ├── products/        # products, groups, brands, categories, smart search
│   ├── mylists/         # user shopping lists
│   └── scrapers/        # per-pharmacy vendor packages + Celery tasks
├── frontend/src/
│   ├── components/      # design-system primitives (Button, Modal, Field, ...)
│   ├── features/        # auth / products / my-lists / pharmacies slices
│   ├── shared/          # cross-feature hooks, utils, axios instance
│   └── pages/           # route-level composition
├── nginx/               # production reverse proxy
├── compose.dev.yaml
└── compose.prod.yaml
```

---

Built by **Stefan Petrovski** · [GitHub](https://github.com/petrovski-stefan)
