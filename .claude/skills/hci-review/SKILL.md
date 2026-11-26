---
name: hci-review
description: Human-computer interaction review of the frontend - whether users can complete their tasks, understand what they see, find the interface natural, and trust the prices. Use for task flows, navigation, search and filtering behaviour, cognitive load, spatial efficiency, wording and tone, trust signals, or when asked to audit HCI or usability. Design tokens, states and motion belong to the design-polish skill.
---

**Evaluate the interface from the perspective of the person using it, not the developer who built it.** It should ask for as little mental effort as possible, make important information immediately perceivable, use the available space well, and make every interaction feel natural and predictable.

Nutriceni is a price aggregator for supplements, gym products and OTC items from Macedonian pharmacies. Its users want one answer: where is this product cheapest right now, and can I trust that price? Review everything against that job.

## Scope

Three layers, all in this skill:

1. **Functional:** can people operate the site efficiently? Navigation, interaction, accessibility, responsiveness, task completion, consistency, feedback, error handling.
2. **Cognitive:** does it work with human perception and thinking? Mental models, attention, load, Gestalt, decisions, trust, language.
3. **Visual and spatial:** is the layout composed so the task is easy? Hierarchy, use of space, density, balance, alignment across screen sizes.

**Boundary with design-polish:** design-polish owns the design system: color tokens, contrast, spacing scale, radius, type ramp, loading and empty states, motion and reduced motion, touch-target sizes. hci-review owns how layout and space serve the task: where things are, how much scrolling a task needs, whether whitespace helps or wastes, whether density suits comparison. When a finding is about a token or a visual rule, hand it to design-polish instead of repeating its checks.

Reviews are read-only. Fix nothing until the user picks findings.

## Core tasks

Every review walks these tasks, logged out and logged in, at the viewports below. A budget is the number of interactions (click, tap, Enter) a task should need. It's a trigger, not a pass/fail line: when a task goes over, explain what the extra steps cost the user (memory, hesitation, a detour, a dead end). When a task is under budget but still confusing, that's a finding too.

| Task | Start | Done when | Budget |
|---|---|---|---|
| A. Find the cheapest price for a named product | Home | The cheapest offer for that product is on screen | 3 |
| B. Browse today's best discounts | Home | The offers of a discounted product are open | 2 |
| C. Find supplements for a goal (smart search) | Home, logged out | Results for the goal are shown | 4 (sign-in included) |
| D. Save an offer to a list | A product card | Confirmation that it was added | 3 (list exists) |
| E. Check a saved list later | Any page | The list's items and prices are visible | 2 |
| F. Leave for the pharmacy to buy | An offer | The pharmacy's product page is open | 1 |

### Viewports

Check both sides of the breakpoints where this layout actually changes, not a generic list:

| Width | Why |
|---|---|
| 320 | Narrowest phones; also what 1280px at 400% zoom looks like (WCAG 1.4.10 reflow) |
| 375 | Standard phone; the in-store case |
| 639 / 640 | `sm`: Home deals and pharmacies switch from a 2-column grid, the deals cap and scrolling chip row end |
| 767 / 768 | `md`: Compare sidebar and filters button, My Lists list/detail switch |
| 1023 / 1024 | `lg`: header nav replaces the menu button, auth pages go two-column with the illustration, Smart Search results go to 3 columns |
| 1279 / 1280 | `xl`: Compare results go to 3 columns |
| 1440 | Large desktop: grid widths, empty side areas |

Re-check the breakpoints in the code before each review; they may have moved. Grep for `sm:`, `md:`, `lg:` and `xl:` used as prefixes; size keys named `md` or `lg` (in `Button`, `IconButton`, `Modal`) are not breakpoints.

## Domain principles

1. **Price first, with its source.** The price is the most prominent thing in an offer, and every price shows its pharmacy and when it was last updated.
2. **Comparable at a glance.** Offers use one layout, one order (cheapest first) and one column for prices, so the eye scans without re-reading.
3. **Familiar patterns (Jakob's law).** Search at the top, filters on the left (behind a button on mobile), sorting top-right, results in a grid. Users learned these on other comparison sites.
4. **Honest discounts.** Show the original price next to the discounted one. Never imply a discount is the best deal without comparing; the offers modal note ("Најниската цена не е секогаш кај аптеката со најголемо намалување") is the model.
5. **Neutral ranking.** Nothing looks paid or promoted. If anything ever is, it is labelled.
6. **Health caution.** No medical claims. Smart-search results explain why they match and keep the disclaimer near the results.
7. **In-store use.** Someone in a pharmacy checks a price on their phone, one-handed, on a weak signal. Task A must work fast at 375px.
8. **The outbound click is success.** Leaving for the pharmacy is the goal of most visits, so that link is obvious and marked as external.

## Method

1. **Cognitive walkthrough.** For every step of every core task ask: will users try to do the right thing; will they notice the control; will they connect it with their goal; will they see that it worked? A "no" is a finding.
2. **Lenses.** Apply the cognitive lenses (layer 2) to every screen a task passes through, collecting the evidence each one names.
3. **Heuristic pass.** Nielsen's 10 heuristics across the check catalog.
4. **Measurement.** Drive the app in headless Chrome and measure instead of guessing: interaction counts, scroll depth, first-screen content, response times, keyboard and screen-reader completion.
   - Install `puppeteer-core` in the session scratchpad, never in the project, and use the installed Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`).
   - The backend runs only via Docker Compose (see the root `CLAUDE.md`) and the frontend via `npm run dev` on :5173. Check both are up before measuring.
   - Logged-in tasks need a test user in the local dev database. Say which one you created, and clean up any data you add.
   - The accessibility tree (`page.accessibility.snapshot()`) shows what a screen reader gets.
5. **Feasibility gate.** Classify every finding before recommending a fix (next section).

## Feasibility gate: frontend, our backend, or not possible

Before recommending a change, check where it has to happen and label the finding.

1. **FE:** the frontend already receives the data. Check `src/features/*/types` and the API functions.
2. **FE + BE:** the data is in our database or can be computed from it, but the API doesn't expose it. The change happens in our own backend: serializers, services, filters, query parameters. Name the endpoint and files, and follow `backend/CLAUDE.md` (layering, checks, tests that assert on `errors[].code`). API contract rules from the root `CLAUDE.md` apply: snake_case payloads, trailing slashes, stable error codes. Both sides change in the same PR.
3. **Not possible:** it needs data the scrapers don't collect. Don't propose scraping more. Product images are excluded for copyright. Redesign the idea without that data, or drop it.

What exists today (check the code again before relying on it):

| Data | Status |
|---|---|
| Product name, price, discount price, discount %, pharmacy, brand, URL, last scraped date, categories | Exposed by the API |
| Group: name, brand, categories, its offers; discounted groups with best discount, lowest price, offer count | Exposed by the API |
| `Product.form_with_count` (e.g. "120 капсули") and `Product.dosage`, filled by our AI enrichment | In the database, not exposed. Usable for unit prices only if reliable enough; verify a sample first |
| Product-groups list: filters `q`, `brand`, `categories`; page size 6; fixed ordering | Sorting or a different page size needs a backend change |
| Images, descriptions, ingredients, stock, ratings, reviews | Not collected: not possible |

## Check catalog

Each check names how to verify it: **code** (read or grep), **browser** (measure in headless Chrome) or **walkthrough** (cognitive walkthrough of a task).

### Layer 1: Functional

- **Navigation and flow:** every core task is reachable from the header; no dead ends; Back returns to the previous place and scroll position; sign-in is reachable for returning users. *walkthrough, browser*
- **Interaction:** controls behave as their kind usually does: dropdowns and comboboxes take arrow keys and Escape and close on outside click; forms submit on Enter; modals trap nothing unexpected. *browser*
- **Consistency:** the same action looks and behaves the same everywhere: search, add to list, confirmations, empty states. *code, walkthrough*
- **Task efficiency:** each core task against its budget, with the cost of any extra steps explained. *browser*
- **Responsiveness:** at every viewport the layout adapts: nothing overflows, nothing important hides without a way to reach it, and controls don't change meaning between sizes. *browser*
- **Accessibility, task level:**
  - Every core task completes with the keyboard only, in an order that follows the screen. *browser*
  - The accessibility tree shows landmarks (`header`, `nav`, `main`, `footer`), a sensible heading outline, and accessible names on every control. Status changes (loading, added to list, errors) are announced. *browser*
  - Meaning never depends on color alone: stale prices, discounts and errors also carry text or an icon. *browser*
  - At 200% zoom and at 320px nothing is cut off or overlapping (WCAG 1.4.4, 1.4.10). *browser*
  - Contrast, reduced motion and touch-target size: owned by design-polish, so link to its checks rather than repeating them.
- **System status (Nielsen's response-time limits):** input is acknowledged within about 0.1 s (pressed state, spinner, skeleton); anything over about 1 s shows progress; anything that takes many seconds (smart search) says what is happening. Judge each operation by what users expect of it, not one global number. *browser*
- **Error prevention and recovery:** destructive actions confirm first; failures keep the user's input and offer a retry; limits are stated before users hit them (minimum search length, list-name length); an expired session leads to sign-in with an explanation, not generic errors; redirects say why (a logged-out user sent to sign-in for smart search or lists). *walkthrough, browser*

### Layer 2: Cognitive

Apply each lens with its evidence. A lens without evidence isn't a finding.

| Lens | Question | Evidence to collect |
|---|---|---|
| Cognitive load | Does the user have to hold or work out too much? | Elements and decisions per screen; things to remember between screens; repeated text (the same label on every row) |
| Attention | Does the screen lead the eye to what matters for the task? | What stands out first in a blurred screenshot; whether that is the task's key element |
| Perception | Can important elements be told apart at once? | Price vs. struck-through price vs. badge; primary vs. secondary actions; distinct states |
| Mental models | Does it behave as users expect from similar sites and from the rest of this site? | Deviations from common comparison-site patterns; two features that look alike but behave differently |
| Decision-making | Is comparing and choosing easy? | Can offers be compared without opening or remembering anything; is the best option marked; can results be sorted |
| Trust | Does it look credible and transparent? | Source and date per price; how data is collected is explained; external links marked; no fake urgency or hidden ranking |
| Cognitive friction | Are there unneeded mental steps? | Re-entering information; translating jargon; working out what an icon means; guessing why something happened |
| Emotional response | Would this feel reassuring, frustrating, overwhelming or confusing? | Only from observable signals: waiting without feedback, unexplained redirects, harsh or vague errors, dead ends, walls of options. Never a bare impression |

Also in this layer:

- **Gestalt:** proximity ties each price to its pharmacy; similar things look alike; a card groups only what belongs together. *browser*
- **Decision support (domain):** the cheapest offer is marked, not only sorted first; savings are shown against the dearest offer or the original price; results can be sorted (price, discount) and their total count is visible. *browser* (sorting is FE + BE today)
- **Cognitive fluency and language:** plain Macedonian, familiar words, consistent tone (see Language). *code*

### Layer 3: Visual and spatial

Whitespace is not waste. Space that groups, separates or gives text room to read improves understanding; don't recommend removing it. Recommend change only where space delays the task or holds nothing useful.

- **Visual hierarchy:** in each card the eye goes product, then cheapest price, then action. *browser*
- **Spatial efficiency:** measure, per task screen and viewport:
  - scroll distance to the first useful content (first result, first price);
  - the share of the first screen holding task content versus chrome and empty space;
  - the largest empty region, and whether it has a purpose (separation, reading width) or is left over.
  
  Then ask: could the content be reorganized to cut scrolling without crowding? *browser*
- **Density:** suited to the content: comparison lists can be denser than reading pages; cards neither cramped nor sparse. *browser*
- **Container sizing:** containers fit their content: no tall cards with little inside, no text running wider than about 70 characters. *browser*
- **Balance and alignment:** elements are distributed proportionally and line up; no lopsided layouts at any viewport. *browser*

## Language

- **Buttons and links:** short imperative, informal: Зачувај, Спореди, Избриши, Најави се, Креирај листа.
- **Sentences:** formal "Вие": Обидете се повторно, Изберете листа, Најавете се за да продолжите.
- **One word per concept:** суплемент (product), понуда (offer at one pharmacy), аптека, листа, паметно пребарување, попуст.
- Errors say what happened and what to do next. No emoji.
- **Sign-in notices** name the feature or action and say it is for logged-in users, in one pattern: "Паметното пребарување е достапно за најавени корисници.", "Зачувувањето суплементи во листа е достапно за најавени корисници." Not "За да ..., потребна е сметка."

## Severity

Rate every finding on Nielsen's scale and estimate the effort in minutes:

- **4: Blocks a core task** or misleads about a price.
- **3: Major:** a core task is slow, confusing or fails for some users (keyboard, screen reader, mobile, logged out).
- **2: Minor:** friction or inconsistency the user can work around.
- **1: Cosmetic.**

## Report format

1. One line first: how many findings, and the worst one.
2. Findings grouped by core task (A–F), then by layer for anything outside a task. Each finding gets:
   - severity
   - feasibility label (FE, FE + BE, Not possible)
   - layer and lens or check
   - file:line or page, viewport and state
   - one-line evidence (a measurement, a screenshot observation or the walkthrough step that failed)
   - suggested fix and effort
3. A suggested batch order, worst severity and lowest effort first.
4. Stop. Fix nothing until the user picks.

## After fixes

- Re-run the measurement that found the problem and report before and after.
- Run the design-polish checks when visuals changed, and the `/check` skill for each side that changed (frontend and, for FE + BE findings, backend).
