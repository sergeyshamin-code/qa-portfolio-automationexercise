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

Runs the collection with Newman against [`api-tests/AutomationExercise.postman_environment.json`](api-tests/AutomationExercise.postman_environment.json) and writes an HTML report to `api-tests/newman-reports/report.html` (git-ignored; regenerated on every run).

**Data-driven example:** the "Data-driven: Search Product" folder runs the same request once per row of [`api-tests/data/search-terms.json`](api-tests/data/search-terms.json) via Newman's `-d` flag (`npm run test:api:data`). Each row also carries its *own* expected outcome (`expect_results`), not just an input — one term (`"jacket"`) legitimately returns zero matches, and the test asserts that's correct rather than failing on it. This folder is deliberately excluded from the default `test:api` run (it needs a data file to mean anything) via explicit `--folder` flags, not left to pass by coincidence.

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

[`.github/workflows/tests.yml`](.github/workflows/tests.yml) runs on every push and pull request to `main`: the API suite (Newman) and the UI suite (Playwright/Chromium) run as two parallel jobs, each uploading its HTML report as a downloadable build artifact.

## Screenshots

| API report (Newman) | UI report (Playwright) |
|---|---|
| ![Newman report](docs/screenshots/api-newman-report.png) | ![Playwright report](docs/screenshots/ui-playwright-report.png) |

| Test steps (Playwright trace) | CI run (GitHub Actions) |
|---|---|
| ![Playwright test detail](docs/screenshots/ui-playwright-test-detail.png) | ![GitHub Actions run](docs/screenshots/ci-github-actions.png) |

## Project Structure

```
api-tests/                 Postman collection, environment, Newman HTML reports (git-ignored)
ui-tests/
  pages/                   Page objects (HomePage, CartPage, CheckoutPage, ...)
  tests/                   Playwright specs, one file per scenario
  fixtures/                Shared helpers: API user setup/teardown, ad blocking, cookie consent
.github/workflows/         CI: tests.yml
docs/screenshots/          Report and CI screenshots (this README)
```

## Roadmap

- [x] **Phase 0 — Setup:** repository structure, `.gitignore`, `.env.example`, README
- [x] **Phase 1 — API tests:** Postman collection covering the public API endpoints, run with Newman
- [x] **Phase 2 — UI tests:** Playwright tests using the Page Object pattern
- [x] **Phase 3 — CI:** GitHub Actions workflow running API and UI tests on every push
- [x] **Phase 4 — Reporting and docs:** test reports, screenshots, final README
