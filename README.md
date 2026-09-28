# QA Portfolio: AutomationExercise

[![Tests](https://github.com/sergeyshamin-code/qa-portfolio-automationexercise/actions/workflows/tests.yml/badge.svg)](https://github.com/sergeyshamin-code/qa-portfolio-automationexercise/actions/workflows/tests.yml)

API and UI test automation for [AutomationExercise.com](https://automationexercise.com), a demo e-commerce site built for practicing test automation.

> Work in progress. This README is a placeholder and will be expanded as each phase is completed.

## Tech Stack

- **API tests:** Postman collections, run from the command line with Newman
- **UI tests:** Playwright
- **CI/CD:** GitHub Actions

## API Tests

A Postman collection covers the [public API](https://automationexercise.com/api_list) of AutomationExercise: product and brand listings, product search, and the full user account lifecycle (create, verify login, read, update, delete).

The API always responds with HTTP 200, even for errors; the real status lives in the JSON body as `responseCode`. Tests assert on that field rather than on the HTTP status.

**Setup:**

```bash
npm install
```

**Run:**

```bash
npm run test:api
```

This runs the collection with Newman against `api-tests/AutomationExercise.postman_environment.json` and writes an HTML report to `api-tests/newman-reports/report.html` (git-ignored; generated on every run).

## UI Tests

Playwright tests covering 5 of the site's [documented test cases](https://automationexercise.com/test_cases), using the Page Object pattern (`ui-tests/pages/`):

- Register a new user account (and delete it afterwards)
- Login with incorrect credentials
- Search for a product
- Add products to the cart as a guest
- A full checkout journey: log in, add to cart, check out, pay, get a confirmed order — using a throwaway account created via the API (see `ui-tests/fixtures/apiUser.ts`), deleted again at the end

The site serves real ads and a cookie-consent dialog through Google's ad stack, which would otherwise intercept clicks unpredictably; `ui-tests/fixtures/base.ts` blocks that traffic at the network level so tests run against the site's actual functionality instead of racing its ad timing.

**Setup:**

```bash
npm install
npx playwright install chromium
```

**Run:**

```bash
npm run test:ui
```

Add `--ui` for Playwright's interactive UI mode, or `--headed` to watch the browser. `npm run test:ui:report` opens the last HTML report (git-ignored; generated on every run).

## CI

[`.github/workflows/tests.yml`](.github/workflows/tests.yml) runs on every push and pull request to `main`: the API suite (Newman) and the UI suite (Playwright/Chromium) run as two parallel jobs, each uploading its HTML report as a downloadable build artifact.

## Roadmap

- [x] **Phase 0 — Setup:** repository structure, `.gitignore`, `.env.example`, README
- [x] **Phase 1 — API tests:** Postman collection covering the public API endpoints, run with Newman
- [x] **Phase 2 — UI tests:** Playwright tests using the Page Object pattern
- [x] **Phase 3 — CI:** GitHub Actions workflow running API and UI tests on every push
- [ ] **Phase 4 — Reporting and docs:** test reports, screenshots, final README
