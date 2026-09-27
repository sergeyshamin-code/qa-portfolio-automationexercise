# QA Portfolio: AutomationExercise

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

## Roadmap

- [x] **Phase 0 — Setup:** repository structure, `.gitignore`, `.env.example`, README
- [x] **Phase 1 — API tests:** Postman collection covering the public API endpoints, run with Newman
- [ ] **Phase 2 — UI tests:** Playwright tests using the Page Object pattern
- [ ] **Phase 3 — CI:** GitHub Actions workflow running API and UI tests on every push
- [ ] **Phase 4 — Reporting and docs:** test reports, screenshots, final README
