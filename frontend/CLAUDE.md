# Frontend

React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query v5, React Hook Form + zod v4, React Router 7 and Axios, managed with **npm**.

## Commands

Run from `frontend/`:

```sh
npm run dev
npm run lint
npm run build                 # tsc -b (the type check), then vite build
npx prettier --write <file>   # there is no npm script for Prettier
```

- Run `lint` and `build` before considering a change done. There is no test runner yet.
- Env file: `frontend/.env` (example: `frontend/.env.example`).

## Code style

- **Prettier:** single quotes, width 100, one JSX attribute per line, Tailwind class sorting. `.prettierrc` forces the TypeScript parser, so only run it on `.ts` and `.tsx` files.
- **ESLint:** `strictTypeChecked`, sonarjs, simple-import-sort and TanStack Query `flat/recommended-strict`.
- **tsconfig:** `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` and `noUncheckedSideEffectImports`. Expect stricter errors than in typical React projects.
- **Imports:** use the `@/` alias for anything outside the current directory. Only sibling `./` imports stay relative. No `../` paths.

## Structure

| Path (in `src/`) | Contents |
|---|---|
| `features/` | `auth`, `my-lists`, `pharmacies`, `products` |
| `components/` | `ui/` (design-system primitives), `layout/`, `header/`, `home/` |
| `context/` | `AuthContext`, `ThemeContext` |
| `shared/` | `hooks/`, `lib/` (axios instance), `types/`, `utils/` |
| `pages/`, `routes/` | Route-level composition and the router |

Imports go one way: `pages/` → `features/` → `components/`, `context/`, `shared/`. `components/`, `context/` and `shared/` never import from `features/`.

## Features

- A feature is `src/features/<feature>/` with flat `api.ts`, `types.ts`, `schemas.ts` (zod), `errorMessages.ts` and `queries.ts`, plus `components/` and `hooks/`. Include only the files it needs. A flat file may become a same-named directory (`api/`, `types/`) when it genuinely needs splitting, as in `products`.
- **Dependency rule:** features import other features in one documented direction only, currently `products → my-lists`. Cycles are forbidden. Anything two features need goes in `shared/` (logic), `components/` (UI) or `context/` (app-wide state).
- **API:** `api.ts` files map camelCase fields to snake_case payloads and unwrap the response. Hooks import them as a namespace: `import * as MyListService from '@/features/my-lists/api'`.
- **Data fetching:** use TanStack Query. Keys come from the feature's `queries.ts` factory (`myListKeys`, `productKeys`, `pharmacyKeys`). Never inline key arrays in hooks.
- **Auth token:** `shared/lib/axios.ts` has no interceptors, so `api.ts` functions take `accessToken` as an argument. It comes from `useAuthContext()`.
- **Forms:** use React Hook Form with a zod resolver. Map backend errors with `shared/hooks/useApiFormErrors` and the feature's `errorMessages.ts`, and display form-level errors with `getFormErrorMessage`.

## Components

- One component per `.tsx` file, including small private helpers. Put a sub-component in a sibling file.
- Components and hooks use default exports.
- Write plain, idiomatic React with context or explicit props. No `cloneElement`, `useId`, render-prop injection, inline HTML scripts or side-effect modules. When ARIA needs an ID, derive it from entity data (for example `group-offers-${id}`).
- New contexts follow `context/AuthContext.tsx`: React 19 `<Context value=...>` plus a `useXContext` hook that throws outside the provider.
- User-facing text is in **Macedonian**, written inline in components. There are no locale files.

## Styling

- `src/index.css` defines semantic tokens (`bg-surface`, `text-text-muted`, `border-border`, ...). The comment at the top of that file sets the rules for radius, shadow, type, spacing and focus.
- Dark mode flips token values under `.dark`. Components use no `dark:` variants and no raw palette colors such as `bg-gray-100`.
