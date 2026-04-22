# Books Inventory UI Automation Framework

TypeScript end-to-end automation framework for the Books Inventory application using Cucumber, Playwright, and Allure.

The active execution model is Cucumber-first:

- Cucumber is the primary test runner
- Playwright is the browser automation engine underneath the runner
- TypeScript provides typed page objects, runtime state, and helpers
- Allure and Cucumber HTML/JSON provide reporting

There are currently no checked-in native Playwright `.spec.ts` or `.test.ts` suites. `playwright.config.ts` exists, but the main regression path is `cucumber-js`.

## Current Scope

The suite currently covers:

- authentication and session behavior
- direct navigation and authorization checks
- books catalog visibility
- add, edit, and delete book flows
- negative validation and rejected submissions
- security-oriented login scenarios
- accessibility checks
- performance-oriented checks
- workflow examples under `features/workflow`

## Stack

- `@cucumber/cucumber`
- `@playwright/test`
- `typescript`
- `tsx`
- `allure-cucumberjs`
- `@faker-js/faker`

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Playwright browser dependencies for your machine

### Install

```bash
npm install
npx playwright install
```

### Configure

Copy `.env.example` to `.env` if you need local overrides.

Typical variables:

```env
BASE_URL=https://frontendui-librarysystem.onrender.com
TEST_USERNAME=
TEST_PASSWORD=
BROWSER=chromium
HEADLESS=false
SLOW_MO_MS=0
```

### Run

Full suite:

```powershell
npm.cmd run test:e2e
```

Headed:

```powershell
npm.cmd run test:e2e:headed
```

Dry-run step registration only:

```powershell
npm.cmd run test:dry-run
```

## Execution Profiles

Available Cucumber-focused runs:

- `npm.cmd run test:e2e`
- `npm.cmd run test:smoke`
- `npm.cmd run test:regression`
- `npm.cmd run test:bug`
- `npm.cmd run test:security`
- `npm.cmd run test:performance`
- `npm.cmd run test:workflow`
- `npm.cmd run test:ui-contract`
- `npm.cmd run test:debug`
- `npm.cmd run test:dry-run`

Notes:

- `test:regression` is the only pack configured for Cucumber parallel workers.
- `test:bug` is the pack for known product gaps tagged `@bug`.
- `test:ui-contract` is intended for brittle style/class assertions that should not block core functional regression.

To change the regression worker count:

```powershell
$env:CUCUMBER_REGRESSION_PARALLEL=4
npm.cmd run test:regression
```

## Reporting

Current report commands:

```powershell
npm.cmd run report:cucumber
npm.cmd run report:pdf
npm.cmd run allure:generate
npm.cmd run allure:open
```

`report:cucumber` now generates a multi-cucumber HTML report from JSON artifacts in
`e2e-tests/reports/cucumber-json`.

Current outputs:

- Cucumber HTML: `e2e-tests/reports/cucumber-html/cucumber-report.html`
- Multi-cucumber HTML index: `e2e-tests/reports/cucumber-html/index.html`
- Cucumber JSON: `e2e-tests/reports/cucumber-json/cucumber-report.json`
- copied HTML summary: `e2e-tests/reports/cucumber-report.html`
- screenshots: `e2e-tests/reports/screenshots`
- traces: `e2e-tests/reports/traces`
- Allure results: `allure-results`

## Architecture Summary

High-level flow:

1. Cucumber loads feature files from `features/`
2. `cucumber.js` imports config, support code, utils, and steps from `e2e-tests/`
3. `hooks.ts` launches one shared browser and creates a fresh context/page per scenario
4. `CustomWorld` stores scenario-scoped browser state and test state
5. `PageManager` provides page-object access
6. steps orchestrate actions and assertions
7. screenshots and traces are captured for diagnosis

Main framework areas:

- `features/`
- `e2e-tests/pages/`
- `e2e-tests/steps/`
- `e2e-tests/support/`
- `e2e-tests/config/`
- `e2e-tests/utils/`
- `e2e-tests/utils/`
- `scripts/`

## Repository Structure

```text
.
|-- scripts
|-- e2e-tests
|   |-- config
|   |-- data
|   |-- utils
|   |-- pages
|   |-- reports
|   |-- steps
|   |-- support
|   `-- utils
|-- features
|   |-- accessibility
|   |-- auth
|   |-- cookies-session
|   |-- create-book
|   |-- delete-book
|   |-- e2e
|   |-- edit-book
|   |-- performance
|   |-- security
|   |-- ui-test
|   |-- view-book
|   `-- workflow
|-- cucumber.js
|-- playwright.config.ts
`-- package.json
```

## Current Feature Inventory

Current feature files:

- `features/accessibility/tc-14-accessibility-audit.feature`
- `features/accessibility/tc-16-accessibility-checks.feature`
- `features/auth/tc-01-authorized-users-login.feature`
- `features/auth/tc-03-login.feature`
- `features/auth/tc-04-login-cookie-bypass.feature`
- `features/auth/tc-05-login-logout.feature`
- `features/auth/tc-22-login-keyboard-navigation.feature`
- `features/auth/tc-24-negative-login-examples.feature`
- `features/cookies-session/tc-02-cookie-bypass.feature`
- `features/create-book/tc-08-add-a-book.feature`
- `features/create-book/tc-09-add-book.feature`
- `features/create-book/tc-10-add-book-scenarios.feature`
- `features/delete-book/tc-11-delete-a-book.feature`
- `features/e2e/tc-12-books-crud-journey.e2e.feature`
- `features/e2e/tc-22-login-add-book-with-strict-page-assertions.feature`
- `features/e2e/tc-23-edit-book-validation-and-logout-retention.feature`
- `features/edit-book/tc-13-edit-book.feature`
- `features/performance/tc-15-page-load-performance.feature`
- `features/performance/tc-16-performance-checks.feature`
- `features/security/tc-06-login-security.feature`
- `features/security/tc-07-login-base64.feature`
- `features/ui-test/tc-17-link-validation.feature`
- `features/ui-test/tc-18-ui-pages.feature`
- `features/ui-test/tc-19-when-responsive.landing-page.feature`
- `features/view-book/tc-20-view-books-catalog.feature`
- workflow features under `features/workflow/`

## Key Conventions

- keep user actions and orchestration in `*Steps.ts`
- keep assertion-heavy checks in `*Assertions.ts`
- keep page objects UI-focused
- keep shared scenario state on `CustomWorld`
- use `PageManager` instead of direct page-object construction in steps
- prefer factories such as `BookFactory` and `LoginDataFactory` for reusable data
- keep known product gaps tagged `@bug`

## Logging

Framework logs now include the process ID to help diagnose parallel runs.

Recommended levels:

- `info` for scenario milestones and meaningful user actions
- `debug` for low-level framework details
- `warn` and `error` for anomalies and failures

Set debug logging locally when needed:

```powershell
$env:LOG_LEVEL='debug'
npm.cmd run test:e2e
```

## Additional Docs

- [docs/framework-architecture.md](C:/Users/benaz/Desktop/library/library-system/docs/framework-architecture.md:1)
- [docs/framework-roadmap.md](C:/Users/benaz/Desktop/library/library-system/docs/framework-roadmap.md:1)
- [docs/framework-contributing.md](C:/Users/benaz/Desktop/library/library-system/docs/framework-contributing.md:1)
- [docs/framework-improvement-backlog.md](C:/Users/benaz/Desktop/library/library-system/docs/framework-improvement-backlog.md:1)
- [docs/test-workflows.md](C:/Users/benaz/Desktop/library/library-system/docs/test-workflows.md:1)
