---
name: design-polish
description: UI/UX rules for polishing the frontend's visual design, states, motion and copy. Use when changing how a page or component looks or behaves, or when asked to audit or scan the UI for design problems.
---

Adapted from the community "design-taste-frontend" skill. Only the rules that fit this project are kept: a Vite + React 19 single-page app with Tailwind v4 tokens and a Macedonian interface.

## Ground rules

- `frontend/src/index.css` is the design system. Its top comment sets radius, shadow, type ramp, spacing and focus. Follow it, and change a rule there before using a new value anywhere else.
- Colors come only from the semantic tokens (`bg-surface`, `text-text-muted`, `border-border`, `text-accent`, ...). No raw palette classes (`text-gray-600`, `border-slate-200`), no `dark:` variants and no arbitrary radii. Text on a filled `bg-primary`/`bg-danger`/... background uses `text-on-fill`. Existing exceptions: `text-white` and `bg-white/*` inside the always-dark header, and `bg-black/50` on the modal backdrop.
- Change a color by editing its token in `index.css`, in both `:root` and `.dark`. Text needs at least 4.5:1 contrast against its surface, and icons and borders that carry meaning need 3:1.
- Icons come from `lucide-react` (already installed), at the sizes already used (`h-4 w-4` in small controls, `h-5 w-5` in regular ones). Don't add a second icon set.
- No new dependencies (animation libraries, UI kits, fonts) without asking the user first. Tailwind and CSS cover everything below.
- `frontend/CLAUDE.md` still applies: one component per file, plain React, and no `useId`. User-facing text stays in Macedonian.

## Settings for this project

These defaults hold unless the user asks for something else in chat:

- **Layout variety 3 of 10:** predictable, scannable layouts. People here compare prices, so keep grids regular and aligned. No masonry and no deliberately asymmetric layouts.
- **Motion 3 of 10:** short transitions on hover, press, enter and exit. No animations that loop on their own, apart from loading indicators.
- **Density 5 of 10:** normal app spacing from the `index.css` ramp. Catalog pages may be denser, as `max-w-[96rem]` already allows.

## States: every data view has all four

Every view that shows data from a query handles four states: loading, empty, error and success. Use TanStack Query's `isPending`, `isError` and `isSuccess`.

1. **Loading:** a skeleton with the same size and layout as the content, so nothing jumps when data arrives. Build it from `components/ui/Skeleton.tsx`, put one `components/ui/LoadingStatus.tsx` in the loading region so screen readers hear that it's loading, and give each card or row its own `<Name>Skeleton.tsx` with the same frame. Spinners are only for inline actions: a pending button, or a mutation inside a modal.
2. **Empty:** say why the view is empty and what to do next. Put the action right there, for example a "Креирај листа" button when the user has no lists.
3. **Error:** shown inline where the data would be, in plain language, with `components/ui/RetryButton.tsx` passed as `StateMessage` children when retrying makes sense (`refetch`, or the same mutation again). Form errors go below their field.
4. **Success:** content that is laid out well with real data of every length. Check long Macedonian product names, missing brands and 0 offers.

## Interaction and motion

- **Press feedback:** buttons, rows and clickable cards get `active:scale-[0.98]`; icon buttons and chips get `active:scale-95`. Use `enabled:active:` on anything that can be disabled. Don't press with `translate`: positioned controls (like the button inside `PasswordInput`) already use `-translate-y-1/2`, and the two would clash.
- **Animate only `transform` and `opacity`.** Never animate `top`, `left`, `width` or `height`. List the properties (`transition-[opacity,transform]`, `transition-colors`), never `transition-all`.
- **Durations:** `duration-150` for hover and press, `duration-200` for enter and exit, with `ease-out`. No spring or bounce effects.
- **Enter animations without JavaScript:** use Tailwind v4's `starting:` variant (`@starting-style`), for example `transition-[opacity,transform] duration-200 starting:opacity-0 starting:scale-95`. Use it on modals, dropdowns and tooltips.
- **Reduced motion:** pair every animation with `motion-reduce:` (`motion-reduce:transition-none`, `motion-reduce:animate-none`).
- **Nothing moves forever.** No carousels or marquees that move on their own, and no cursor-following effects, magnetic buttons or tilt cards.
- **Focus:** every interactive element keeps the `focus-visible:outline-*` from `index.css`. Never remove an outline without replacing it.

## Layout

- Page containers follow `index.css`: `mx-auto w-full max-w-7xl px-4 sm:px-6`.
- Use CSS grid for page and card structure. No `calc()` percentage widths.
- Below `md`, layouts fall back to a single column with no horizontal scroll. Check at 375px wide.
- Use `min-h-dvh` for full-height wrappers, not `min-h-screen` or `h-screen`.
- `z-index` only for real layers: sticky header, modal, dropdown, tooltip. Don't add one to fix an overlap; fix the layout instead.
- Use a card only when the boundary means something: a product group, a modal, a filter panel. Inside a card, separate rows with `divide-y` or spacing, not with more cards.

## Typography and numbers

- Keep the type ramp from `index.css`. Show hierarchy through weight and color first, size second. The first heading on a page stays at the h1 size of the ramp.
- Body text stays under about 70 characters per line (`max-w-prose`) on reading pages such as About and HowToUse.
- **Prices and counts use `tabular-nums`**, so that columns of prices line up.
- **Fonts:** the system font stack is the default. Any font proposed instead must cover Cyrillic, including the Macedonian letters Ѓ Ќ Ѕ Џ Љ Њ Ј, and must be self-hosted or loaded from Google Fonts. Check the glyphs before suggesting a font.

## Color use

- **One accent with one job.** Keep `accent` for savings (discount badges and discounted prices), so that it stands out. Don't use it for spinners, generic hovers or decoration.
- `primary` is for brand and main actions, `info` for links and "view" actions, `warning` for stale prices and `danger` for deletes and errors. This follows the semantic roles in `index.css`.
- No glows, neon or gradient text. Use the existing shadow ramp, and in dark mode get depth from `border-border` and `bg-surface-raised`.

## Forms

- Each label sits above its field and is linked to it: wrap the control in `<label>`, because `useId` is not allowed. Error text goes below the field (`text-danger text-sm`). Use the `components/ui/Field.tsx` pattern.
- Placeholders are examples, never a replacement for the label.
- While submitting, the submit button shows `isPending` and can't be clicked twice.

## Copy (Macedonian)

- Use concrete verbs on buttons ("Зачувај", "Спореди 3 понуди"), not vague ones ("Продолжи", "Потврди") when a specific word exists.
- Error messages say what happened and what to do next.
- No emoji in text, markup or alt text.

## Audit mode

When asked to scan or audit the UI, go through these and report findings by file and line, most important first. Don't fix anything until the user picks which to do.

1. States: a view that is missing loading, empty or error, or that uses a spinner where a skeleton fits.
2. Feedback: interactive elements without `active:`, `focus-visible:` or hover styles.
3. Motion: `transition-all`, animated layout properties, a missing `motion-reduce:`, elements that appear with no enter transition.
4. Tokens: raw palette classes, arbitrary values, radius or shadow outside the `index.css` rules, accent used for something other than savings.
5. Layout and accessibility: horizontal scroll at 375px, `min-h-screen` or `h-screen`, unlinked labels, prices without `tabular-nums`, `z-index` that isn't for a layer.

## Before calling a change done

1. Check the change in light and dark mode, at 375px and at desktop width.
2. Tab through it with the keyboard: focus is visible and the order makes sense.
3. Run the `/check` skill (frontend lint, knip and build).
