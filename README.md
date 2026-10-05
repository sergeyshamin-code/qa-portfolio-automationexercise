# QA Portfolio: AutomationExercise

[![Tests](https://github.com/sergeyshamin-code/qa-portfolio-automationexercise/actions/workflows/tests.yml/badge.svg)](https://github.com/sergeyshamin-code/qa-portfolio-automationexercise/actions/workflows/tests.yml)

API and UI test automation for [AutomationExercise.com](https://automationexercise.com), a demo e-commerce site built for practicing test automation.

## Tech Stack

- **API tests:** Postman collections, run from the command line with Newman
- **UI tests:** Playwright (TypeScript, Page Object pattern)
- **CI/CD:** GitHub Actions

## What This Demonstrates

- **API testing beyond the happy path:** this API always responds with HTTP 200, even for errors — the real result lives in the JSON body. The suite asserts on that body, and covers a full account lifecycle (create → verify login → read → update → delete), not just isolated calls.
- **UI testing against a real, uncontrolled site:** AutomationExercise serves real ads, a cookie-consent dialog, and a randomly-timed full-page interstitial — all of which intercept clicks unpredictably. Rather than papering over that with `force` clicks, the suite blocks the ad stack at the network level (`ui-tests/fixtures/base.ts`) and retries actions that can race the site's own JS, so failures reflect real bugs, not ad timing.
- **Hybrid API + UI setup:** the checkout test creates its throwaway user via the API (reusing Phase 1's request logic) instead of relying on a fixed, persistent account or a bare `.env` credential — it also deletes it afterwards on the public site.
- **CI that was actually verified, not just written:** the workflow was tested live on a branch before merging, and a real CI-only failure (a click racing the site's JS, only visible on a slower runner) was diagnosed from its log and fixed — not guessed at.
- **Knowing when *not* to automate something:** investigating `getUserDetailByEmail` for data-driven testing surfaced real other people's PII — "garbage" emails like `""` and `<script>alert(1)</script>` turned out to be real accounts other users registered on this shared public demo site. That made the endpoint's outcomes genuinely unpredictable (not a test design problem to engineer around), so it got two ordinary negative tests instead of a DDT matrix — see [the full reasoning](#why-not-every-parameterized-endpoint-got-a-ddt-folder).

## API Tests

A Postman collection ([`api-tests/AutomationExercise.postman_collection.json`](api-tests/AutomationExercise.postman_collection.json)) covers the [public API](https://automationexercise.com/api_list): product and brand listings, product search, and the full user account lifecycle.

The collection carries sensible default values (`baseUrl`, `name`, `password`) as collection variables, so it also runs standalone straight after importing it into Postman — no environment needs to be selected first. Importing and selecting [`api-tests/AutomationExercise.postman_environment.json`](api-tests/AutomationExercise.postman_environment.json) as well overrides those defaults and matches exactly what Newman/CI run.

**Setup:**

```bash
npm install
```

**Run:**

```bash
npm run test:api
```

Runs the collection with Newman against [`api-tests/AutomationExercise.postman_environment.json`](api-tests/AutomationExercise.postman_environment.json) and writes an HTML report to `api-tests/newman-reports/report.html` (git-ignored; regenerated on every run). The collection also carries sensible defaults as collection-level variables, so it runs standalone straight after importing it into Postman — no environment needs to be selected first.

### Data-driven testing (DDT)

Data-driven folders are prefixed **`DDT:`** (e.g. `DDT: Search Product`), to tell them apart at a glance from the numbered, one-case-per-endpoint folders above. The request inside is prefixed with the number of the official endpoint it exercises (`5. POST To Search Product — {{search_term}}`) — the same `5` as `Read-only endpoints / 5. POST To Search Product` — so it's traceable to the endpoint it's testing a fuller input matrix for.

`DDT: Search Product` runs the same `searchProduct` request, parameterized by `{{search_term}}`:

```bash
npm run test:api:data
```

Runs once per row of [`api-tests/data/search-terms.json`](api-tests/data/search-terms.json) via Newman's `-d` flag — 22 terms, each carrying its *own* expected outcome (`expect_results`), not just an input. Beyond plain happy-path words, the rows cover distinct equivalence classes, cross-checked against standard boundary-value-analysis / input-validation checklists ([ISTQB](https://www.softwaretestinghelp.com/what-is-boundary-value-analysis-and-equivalence-partitioning/), [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)) and verified live before being added:

- **Case-insensitivity** — `"TOP"` matches the same 14 products as `"top"`.
- **No input trimming** — `"  top  "` (padded) matches nothing; the API doesn't sanitize whitespace.
- **Empty string** — matches the *entire* catalog (34/34): an empty substring is trivially contained in every product, not an error.
- **Whitespace-only is not treated as empty** — `"   "` (spaces, no real content) matches nothing, unlike a genuinely empty string — a distinct outcome from the row above.
- **Substring, not tokenized search** — `"blue top"` matches the one product literally named "Blue Top", but `"top dress"` (two individually-valid words concatenated) matches nothing: the API matches one literal substring, not "contains every word".
- **Field scope** — `"500"` and `"H&M"` both match nothing, even though a price like "Rs. 500" and the brand "H&M" appear in the data; search only looks at name/category, not price or brand.
- **Minimum-length boundary** — a single character (`"t"`) is accepted and matches normally (32 products), no minimum-length restriction.
- **Robustness** — an XSS-shaped string, a SQLi-shaped string, a 200-character string, Cyrillic text, an embedded newline, a literal `&` (a form-encoding separator character), and a literal `%` (the URL-encoding escape character itself) all return a normal empty `200` response, not an error.

**Deliberately not automated:** a literal null byte (`%00`) produces a real, interesting finding — `"top\0dress"` returns exactly 4 products (a strict subset of the 14 that match plain `"top"`), not 0, not 14, and not a crash. That's a different *mechanism* than simple substring matching (the backend evidently processes the null byte specially rather than just truncating the string, since truncating would reproduce the full 14), but pinning that exact count into an automated assertion would be testing an undocumented implementation detail rather than documented behavior — it could change for reasons unrelated to any real regression. Noted here as an exploratory finding rather than encoded as a brittle check.

It's deliberately **excluded** from the default `npm run test:api` run: `Read-only endpoints / 5.` already exercises the same endpoint's happy path (`search_term: "top"`) as part of the complete, numbered API coverage — including it in both commands would just fire the same live HTTP call twice. The DDT folder's reason to exist is the full parameterized matrix, which only `test:api:data` exercises; `npm run test:api` stays each request's single definitive run.

The test script reads both the search term and the expected outcome with `pm.variables.get(...)`, which resolves across scopes (iteration data → environment → collection defaults). The collection also carries `search_term`/`expect_results` as defaults, so the request still runs standalone with a single sensible case straight from Postman's "Send" button — without needing the data file or `-d` at all. One subtlety: Postman stores collection/environment variables as strings, but a value coming from a JSON data file (`-d`) keeps its real JSON type (`true`/`false`, a boolean) — comparing with `String(expectResults) === "true"` handles both consistently; a plain `==` comparison does not (`true == "true"` is `false` in JavaScript).

#### `DDT: Verify Login`

```bash
npm run test:api:data:login
```

An auth-robustness matrix for endpoints `7`/`10` (verifyLogin): 8 rows of malformed/malicious email+password combinations ([`api-tests/data/verify-login.json`](api-tests/data/verify-login.json)) — empty-but-present values, SQLi/XSS-shaped email, a 200-character password, Cyrillic text, a padded email. Unlike `DDT: Search Product`, every single row expects the *same* outcome: a safe `404 "User not found!"`, never a crash or a different error shape. That's a deliberate, different kind of data-driven suite — proving one invariant holds across many adversarial inputs, rather than mapping inputs to varied outcomes.

This is safe to run with made-up credentials specifically because matching here requires **both** email *and* password together — unlike `getUserDetailByEmail` (below), where email alone is the lookup key, a coincidental collision with a real stranger's account is not a realistic concern.

#### `DDT: Create Account (missing required field)`

```bash
npm run test:api:data:create-account
```

Endpoint `11` (createAccount) takes 16 fields; verified live which are actually required — missing any of **name, email, password, firstname, lastname, address1, country, zipcode, state, city, mobile_number** (11 fields) returns `400` before anything is created, while the other 6 (title, birth_date/month/year, company, address2) are optional. One row per required field ([`api-tests/data/create-account-missing-field.json`](api-tests/data/create-account-missing-field.json)), each omitting a *different* one.

This needed a technique beyond simple `{{variable}}` substitution: a **pre-request script** rebuilds the entire request body from a full valid set of values, minus whichever field that row names — since a data file can vary a value, but not which keys are present in a static Postman request body. Verified live (including cleaning up along the way) that every row really does 400 before any account is created — none of these 11 requests ever touches real data.

#### Why not every parameterized endpoint got a DDT folder

| Endpoint | Parameters | Treatment |
|---|---|---|
| 5/6 `searchProduct` | 1 (search term) | **DDT** — static catalog, rich distinct outcomes per input |
| 7/8/10 `verifyLogin` | 2 (email, password) | **DDT** — matching needs both fields, so garbage input is safe and predictable |
| 11 `createAccount` | 16 | **DDT** (missing-field matrix only) — any *present-but-weird* value (bad email format, XSS in a name field, etc.) just succeeds and creates a real account, confirmed live; only the missing-required-field case is both safe and deterministic |
| 12 `deleteAccount` | 2 (email, password) | One ordinary test (`12b`, non-existent account → `404`) — a broader garbage-input matrix would just re-prove the same "needs both fields to match" conclusion `DDT: Verify Login` already establishes |
| 13 `updateAccount` | 16 | One ordinary test (`13b`, non-existent account → `404`) — same reasoning as 12; it also validates in a different *order* than createAccount (checks email/password are present, then account existence, before any other field), discovered while investigating this |
| 14 `getUserDetailByEmail` | 1 (email) | Two ordinary tests (`14b` missing param, `14c` non-existent email), **not** DDT — discovered live that "garbage" emails (`""`, `"notanemail"`, even `"<script>alert(1)</script>"`) can be **real, pre-existing accounts** other people registered on this shared public demo site, complete with their name and address. A single-field lookup like this can't safely use made-up "equivalence class" strings the way a two-field check (login) can — the expected outcome isn't under this test suite's control, since anyone else using the site can register a new "garbage" email at any time. |
| 1–4, 9 (products/brands list, method checks) | none | Nothing to parameterize — no request body or query, just an endpoint and an HTTP method |

**Adding another DDT scenario:** this collection follows the common Postman pattern of one folder per scenario, each with its own data file and its own Newman invocation (Newman only accepts a single `-d` file per run, so scenarios with different datasets can't share one command). Add a `api-tests/data/<scenario>.json` file, a matching folder + numbered request in the collection, and a dedicated `test:api:data:<scenario>` npm script (plus a CI step, if it should run there too). If the folder's default case would duplicate an existing numbered request's happy path, leave it out of the default `test:api` run, same as here — and check first (live, not by assumption) whether the endpoint's "negative" inputs are actually safe and deterministic to automate, the way `getUserDetailByEmail` above turned out not to be.

## UI Tests

Playwright tests covering 5 of the site's [documented test cases](https://automationexercise.com/test_cases), using the Page Object pattern (`ui-tests/pages/`):

- Register a new user account (and delete it afterwards)
- Login with incorrect credentials
- Search for a product
- Add products to the cart as a guest
- A full checkout journey: log in, add to cart, check out, pay, get a confirmed order — using a throwaway account created via the API, deleted again at the end

**Setup:**

```bash
npm install
npx playwright install chromium
```

**Run:**

```bash
npm run test:ui
```

Add `--ui` for Playwright's interactive UI mode, or `--headed` to watch the browser. `npm run test:ui:report` opens the last HTML report (git-ignored; regenerated on every run).

## CI

[`.github/workflows/tests.yml`](.github/workflows/tests.yml) runs on every push and pull request to `main`: the API suite (Newman) and the UI suite (Playwright/Chromium) run as two parallel jobs.

- **Job summary:** each job parses its JSON reporter output and writes a pass/fail table straight into the Actions run's Summary tab ([`scripts/write-job-summary.js`](scripts/write-job-summary.js)) — the result is visible at a glance, with no download or extra click needed.
- **Build artifacts:** each job also uploads its full HTML report (14-day retention), for a detailed look when something fails.
- **Live report:** on every push to `main`, the Newman HTML report is published to GitHub Pages: **[sergeyshamin-code.github.io/qa-portfolio-automationexercise](https://sergeyshamin-code.github.io/qa-portfolio-automationexercise/)** — always reflects the latest run on `main`, no need to download an artifact or dig through Actions history to see it.

## Screenshots

| API report (Newman) | UI report (Playwright) |
|---|---|
| ![Newman report](docs/screenshots/api-newman-report.png) | ![Playwright report](docs/screenshots/ui-playwright-report.png) |

| Test steps (Playwright trace) | CI run (GitHub Actions) |
|---|---|
| ![Playwright test detail](docs/screenshots/ui-playwright-test-detail.png) | ![GitHub Actions run](docs/screenshots/ci-github-actions.png) |

## Project Structure

```
api-tests/
  data/                     Data files for data-driven scenarios (one JSON file per scenario)
  *.postman_collection.json / *.postman_environment.json
  newman-reports/           HTML reports (git-ignored)
ui-tests/
  pages/                   Page objects (HomePage, CartPage, CheckoutPage, ...)
  tests/                   Playwright specs, one file per scenario
  fixtures/                Shared helpers: API user setup/teardown, ad blocking, cookie consent
.github/workflows/         CI: tests.yml
scripts/                   CI helper scripts (job summary parsing)
docs/screenshots/          Report and CI screenshots (this README)
```

## Project Plan

This project was built with [Claude Code](https://claude.com/claude-code) following an explicit, phased plan, end to end:

- [x] **Phase 0 — Setup:** repository structure, `.gitignore`, `.env.example`, README
- [x] **Phase 1 — API tests:** Postman collection covering the public API endpoints, run with Newman
- [x] **Phase 2 — UI tests:** Playwright tests using the Page Object pattern
- [x] **Phase 3 — CI:** GitHub Actions workflow running API and UI tests on every push
- [x] **Phase 4 — Reporting and docs:** test reports, screenshots, final README

## Ongoing Enhancements

With the initial plan complete, work continues incrementally rather than as further numbered phases — each change goes through its own branch, AI self-review, and pull request (see the repo's merged PRs for the history). Current focus areas:

- **API tests:** broader data-driven coverage (equivalence classes, boundary values), beyond the existing [`DDT: Search Product`](#data-driven-testing-ddt) example.
- **UI tests:** more of the site's [documented test cases](https://automationexercise.com/test_cases) beyond the 5 currently covered.
- **Reporting:** the [live GitHub Pages report](#ci) and CI job summaries are the first step; next is tracking trends across runs rather than just the latest one.
