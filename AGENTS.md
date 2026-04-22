# AGENTS.md

## Purpose
- This repository is a **Cucumber-first** TypeScript E2E framework for the Books Inventory UI; the primary runner is `cucumber-js`, not native Playwright specs (`package.json`, `cucumber.js`, `README.md`).
- Use `README.md` + runtime config files as source of truth; `README.md` references `docs/` files that are not present in this checkout.

## Architecture map (what to understand first)
- Feature specs live in `features/**`; Cucumber imports all framework code from `e2e-tests/config|utils|support|steps/**/*.ts` (`cucumber.js`).
- Scenario lifecycle is in `e2e-tests/support/hooks.ts`: one global browser per worker (`BeforeAll`), fresh context/page per scenario (`Before`), screenshot-on-failure + trace capture in `After`.
- Scenario state is centralized in `e2e-tests/support/world.ts` (`CustomWorld` fields like `createdBook`, `activeBookFormName`, `activeNegativeLoginExample`).
- Page objects are accessed via `e2e-tests/pages/page-manager.ts` lazy getters; step files should use `this.pm.getXPage()` instead of constructing pages directly.
- Navigation and environment resiliency is handled in `e2e-tests/pages/base-page.ts` via `navigateWhenResponsive()` (HEAD/GET warmup probes + cache TTL) before routing.

## Runtime/config model
- Env resolution is in `e2e-tests/config/env.config.ts`: load `.env` then `.env.example`, resolve `TEST_ENV` (`dev|staging|prod`) to base URL, expose route aliases (`landing/login/books/addBook/editBook`).
- Browser/context defaults come from `e2e-tests/config/browser.config.ts` and `e2e-tests/utils/BrowserFactory.ts`.
- Important toggles: `HEADLESS`, `BROWSER`, `CUCUMBER_TIMEOUT_MS`, `NAVIGATION_TIMEOUT_MS`, `CUCUMBER_REGRESSION_PARALLEL`, `LOG_LEVEL`.

## Test execution workflows
- Baseline local run: `npm run test:e2e`.
- Useful packs map to Cucumber profiles in `cucumber.js`: `test:smoke`, `test:regression`, `test:security`, `test:performance`, `test:workflow`, `test:ui-contract`, `test:bug`, `test:dry-run`.
- Regression parallelism is profile-scoped and controlled by `CUCUMBER_REGRESSION_PARALLEL` (default 2).
- Reports: `npm run report:cucumber`, `npm run allure:generate`; artifacts under `e2e-tests/reports/**` and `allure-results/**`.

## Project-specific conventions (follow these)
- Keep orchestration/actions in `*Steps.ts` and assertion-heavy checks in `*Assertions.ts` (pattern used across `e2e-tests/steps/*`).
- Reuse helpers instead of raw assertions/waits: `AssertionHelpers`, `InteractionWaitHelpers`, `TableValidator`.
- Prefer route/page aliases in steps (`I navigate to "login" page`) backed by `e2e-tests/utils/stepSupport.ts` alias maps.
- Keep known product gaps tagged `@bug`; default profile excludes them (`tags: 'not @bug'` in `cucumber.js`).
- Keep logs structured through `e2e-tests/utils/Logger.ts` (pid-tagged, optional file output in `e2e-tests/reports/logs`).

## Integration boundaries
- CI: `azure-devops-pipeline.yml` (`TEST_ENV=dev`) and `azure-devops-test-plan-pipeline.yml` (`TEST_ENV=staging`) run lint + `ci:azure:e2e:reports` and publish artifacts.
- Jenkins: `JenkinsFile` runs install/lint/e2e/report and archives `e2e-tests/reports/**/*` + `allure-results/**/*`.
- Containers: `Dockerfile` + `docker-compose.yml` run headless Cucumber with report generation (`npm run test:e2e:report`).

## Safe change checklist for agents
- When adding scenarios, update both `features/**` and matching step definitions in `e2e-tests/steps/**`; reuse existing page objects first.
- If adding page behavior, expose it in the relevant page class and wire through `PageManager`.
- Preserve artifact paths and hook behavior in `hooks.ts`; CI pipelines expect current report locations.
- Do not assume Playwright Test runner is active unless explicitly working on `npm run test:playwright` flows.

