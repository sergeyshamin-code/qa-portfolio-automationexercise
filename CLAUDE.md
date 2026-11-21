# CLAUDE.md — qa-portfolio-automationexercise

Public QA portfolio: API (Postman/Newman) + UI (Playwright, TypeScript) tests for
https://automationexercise.com, CI on GitHub Actions. Read README.md for the full
reasoning behind existing design decisions before changing anything.

## Commands

- `npm run test:api` — main Newman run (folders "Read-only endpoints" + "User account lifecycle")
- `npm run test:api:data` / `test:api:data:login` / `test:api:data:create-account` — DDT folders, one data file each
- `npm run test:ui` — Playwright (Chromium only); `npx playwright test <file>` for one spec
- `npx playwright test --repeat-each=3 <file>` — quick flakiness check for a new/changed spec

## Test pyramid (the point of this repo)

- API layer is the base: most cases live in the Postman collection.
- UI layer is intentionally small (target 8–10 specs): only end-to-end user journeys
  that add value *on top of* API coverage. Never re-test in UI what API already proves.
- Every new test must say which layer it belongs to and why.

## Hard rules learned live on this site (do not "fix" these away)

1. The API returns **HTTP 200 for everything**; the real status is `responseCode` in the
   JSON body. Assert both, like existing requests do.
2. `getUserDetailByEmail` (14): never send made-up/"garbage" emails — they can be real
   accounts with other people's PII on this shared public site. Only `14b`/`14c` style tests.
3. `createAccount` (11): any present-but-weird value just creates a real account. Only the
   missing-required-field matrix is safe. Every created account must be deleted.
4. Use unique throwaway users (`ae_ui_${Date.now()}@example.com` pattern) created via
   `ui-tests/fixtures/apiUser.ts`, with cleanup in `afterAll`/teardown that never throws.
5. Don't pin undocumented behaviour (e.g. the null-byte search result) into assertions —
   note it in README as an exploratory finding instead.
6. Ads/consent: rely on the network blocking in `ui-tests/fixtures/base.ts`. Always import
   `test`/`expect` from `../fixtures/base`, never from `@playwright/test` directly.
7. No `page.waitForTimeout`, no `{ force: true }`, no `test.only`. Use web-first assertions
   and retry the specific racing action if the site's JS races (see existing fixes).
8. Verify behaviour **live** before encoding an expectation. Don't guess the API's answer.

## Conventions

- UI: Page Object Model in `ui-tests/pages/` (readonly Locator fields set in constructor,
  action methods). One scenario per spec file in `ui-tests/tests/`. Header comment names the
  site's documented test case number (`// Test case #16 (...)`).
- API: numbered requests matching the site's `/api_list` numbering (`13b`, `14c` for extra
  negatives). Folder per DDT scenario + `api-tests/data/<scenario>.json` + its own
  `test:api:data:<scenario>` npm script + CI step.
- Collection variables keep working defaults so the collection runs standalone in Postman.
- Edit the collection JSON with a script (python/node read-modify-write), never by hand-retyping.
- Branch + PR per change; commit messages `test:`, `fix:`, `docs:`, `ci:`, `chore:`.
- Update README when test counts or coverage tables change.

## Agents (`.claude/agents/`)

- `coverage-analyst` — finds gaps, writes a prioritized backlog to `docs/coverage-backlog.md`. Read-only otherwise.
- `api-test-writer` — implements API backlog items in the Postman collection.
- `ui-test-writer` — implements UI backlog items as Playwright specs + page objects.
- `test-reviewer` — independent review of a change against the rules above. Never edits.

Flow: analyst → writer → reviewer → fix (max 2 rounds) → PR. See `/cover-gap`.
