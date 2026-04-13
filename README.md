# Books Inventory UI Automation Framework

TypeScript UI automation framework for the Books Inventory application using Cucumber, Playwright, and Allure.

The suite is currently centered on Cucumber-driven end-to-end coverage. A Playwright configuration is present, but there
are no native `.spec.ts` or `.test.ts` files in the repository at the moment.

## Current Status

- Primary runner: `cucumber-js`
- Browser engine: Playwright
- Language: TypeScript with ESM
- Reporting: Cucumber HTML, Cucumber JSON, Allure, multi-cucumber HTML
- Active coverage focus: authentication, authorization, logout, add/edit/delete book flows, validation, session
  behavior,
  links, accessibility, and full CRUD journey coverage
- Current business-risk findings from the active suite:
    - unauthorized users can reach protected routes such as `/books` and `/add-book`
    - logout does not consistently revoke access to protected pages
    - add-book validation is not fully reliable for required fields and invalid values
- CI artifacts present: `Dockerfile`, `docker-compose.yml`, `JenkinsFile`, `azure-devops-pipeline.yml`,
  `azure-devops-test-plan-pipeline.yml`
- CI/CD status: pipeline files exist, but they are not yet aligned with the repo's real execution path
    - the framework is Cucumber-first
    - the current Azure DevOps and Jenkins examples are wired to `playwright test`
    - there is no native Playwright spec suite checked into this repository today
- Current framework boundary:
    - `e2e-tests/pages` contains locators, actions, and page state access
    - `e2e-tests/steps` contains assertions and scenario orchestration
    - assertion helpers now live alongside steps, not in page objects

## Tech Stack

- `@cucumber/cucumber`
- `@playwright/test`
- `typescript`
- `tsx`
- `allure-cucumberjs`
- `allure-playwright`
- `multiple-cucumber-html-reporter`
- `@faker-js/faker`

## Initial Setup

### Prerequisites

Make sure the following are available on your machine:

- Node.js 18+ recommended
- npm
- a supported browser runtime for Playwright
- network access to the target application URL

### 1. Clone and open the project

```bash
git clone <repo-url>
cd acceptance-test
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

If this is the first setup on the machine, install the Playwright browser binaries:

```bash
npx playwright install
```

If your environment also needs system dependencies:

```bash
npx playwright install --with-deps
```

### 4. Create environment configuration

Copy `.env.example` to `.env` and set any values needed for your environment.

Example starting point:

```env
BASE_URL=https://frontendui-librarysystem.onrender.com
TEST_USERNAME=
TEST_PASSWORD=
BROWSER=chromium
HEADLESS=false
SLOW_MO_MS=0
ACTION_TIMEOUT_MS=5000
DEFAULT_TIMEOUT_MS=60000
NAVIGATION_TIMEOUT_MS=120000
VIEWPORT_WIDTH=1280
VIEWPORT_HEIGHT=720
ACCEPT_DOWNLOADS=true
IGNORE_HTTPS_ERRORS=true
```

### 5. Run the suite

Run the default Cucumber suite:

```bash
npm run test:e2e
```

Run headed mode locally:

```bash
npm run test:e2e:headed
```

### 6. Generate reports

Generate the multi-cucumber HTML report:

```bash
npm run report:cucumber
```

Generate and open Allure:

```bash
npm run allure:generate
npm run allure:open
```

### First-run sanity check

For a clean first verification, this is the shortest useful path:

```bash
npm install
npx playwright install
npm run test:e2e
npm run report:cucumber
```

## Repository Structure

```text
.
|-- e2e-tests
|   |-- config
|   |   |-- browser.config.ts
|   |   `-- env.config.ts
|   |-- data
|   |   |-- books-inventory
|   |   `-- testData.json
|   |-- helperUtilities
|   |-- pages
|   |   |-- AddBookPage.ts
|   |   |-- BasePage.ts
|   |   |-- BookFormPage.ts
|   |   |-- BooksCatalogPage.ts
|   |   |-- EditBookPage.ts
|   |   |-- LandingPage.ts
|   |   |-- LoginPage.ts
|   |   |-- PageManager.ts
|   |   `-- TopNaviPage.ts
|   |-- reports
|   |   |-- cucumber-json
|   |   |-- diagnostics
|   |   |-- screenshots
|   |   `-- traces
|   |-- steps
|   |   |-- addBookAssertions.ts
|   |   |-- addBookSteps.ts
|   |   |-- booksCatalogAssertions.ts
|   |   |-- booksCatalogSteps.ts
|   |   |-- commonAssertSteps.ts
|   |   |-- commonNaviSteps.ts
|   |   |-- commonSteps.ts
|   |   |-- editBookAssertions.ts
|   |   |-- editBookSteps.ts
|   |   `-- ...
|   |-- support
|   |   |-- hooks.ts
|   |   `-- world.ts
|   `-- utils
|       |-- addBook.constants.ts
|       |-- book.types.ts
|       |-- bookFactory.ts
|       |-- BrowserFactory.ts
|       |-- Logger.ts
|       |-- TestData.ts
|       |-- wait.util.ts
|       `-- ...
|-- features
|   |-- auth
|   |-- create-book
|   |-- delete-book
|   |-- e2e
|   |-- edit-book
|   |-- accessibility
|   |-- performance
|   |-- ui-test
|   `-- view-book
|-- scripts
|   |-- generate-multi-cucumber-report.mjs
|   `-- suppress-warnings.mjs
|-- cucumber.js
|-- playwright.config.ts
|-- package.json
|-- package-lock.json
`-- README.md
```

## Framework Diagram

```text
                           +----------------------+
                           |    feature files     |
                           |      features/       |
                           +----------+-----------+
                                      |
                                      v
                           +----------------------+
                           |   step definitions   |
                           |   e2e-tests/steps    |
                           +----------+-----------+
                                      |
                    +-----------------+-----------------+
                    |                                   |
                    v                                   v
        +--------------------------+        +--------------------------+
        |   step assertion helpers |        |      page objects        |
        |   add/edit/catalog       |        |    e2e-tests/pages       |
        +------------+-------------+        +------------+-------------+
                     |                                   |
                     +-----------------+-----------------+
                                       |
                                       v
                           +----------------------+
                           |     PageManager      |
                           |  scenario page access|
                           +----------+-----------+
                                      |
                                      v
                           +----------------------+
                           |  Playwright browser  |
                           | context/page/actions |
                           +----------+-----------+
                                      |
                                      v
                           +----------------------+
                           |   Books Inventory    |
                           |     application      |
                           +----------------------+

   +---------------------------------------------------------------+
   | support and runtime                                           |
   | e2e-tests/support/hooks.ts                                    |
   | - browser lifecycle                                           |
   | - scenario context/page creation                              |
   | - tracing                                                     |
   | - screenshots on failure                                      |
   | - Allure metadata                                             |
   +---------------------------------------------------------------+

   +---------------------------------------------------------------+
   | shared configuration and utilities                            |
   | e2e-tests/config + e2e-tests/utils + e2e-tests/helperUtilities|
   | - env config                                                  |
   | - browser config                                              |
   | - test data factories                                         |
   | - logger/report helpers                                       |
   +---------------------------------------------------------------+
```

## Framework Design

### `features/`

Business-readable Gherkin scenarios.

All feature files are currently prefixed with a stable test-case ID in the format `TC-xx-...feature`.

Current feature areas:

- authentication
- cookie/session behavior
- create book
- delete book
- edit book
- view books catalog
- UI validation
- accessibility
- performance
- end-to-end CRUD journey

### `e2e-tests/steps/`

Glue code for feature execution. This is where scenario flow and assertions now belong.

Examples:

- page-specific step files such as `addBookSteps.ts`, `editBookSteps.ts`, `booksCatalogSteps.ts`
- reusable assertion modules such as `addBookAssertions.ts`, `editBookAssertions.ts`, `booksCatalogAssertions.ts`
- shared orchestration in `commonSteps.ts`

### `e2e-tests/pages/`

Page objects for locators and actions only.

This layer should not contain `expect(...)` assertions. Recent refactoring moved assertion logic out of the page layer
and into step-side helper modules.

Current page-layer roles:

- `BasePage.ts` provides shared navigation and element interaction helpers
- `BookFormPage.ts` provides shared add/edit book form field registration and fill logic
- `AddBookPage.ts` and `EditBookPage.ts` extend the shared form foundation
- `PageManager.ts` provides scenario-scoped page access

### `e2e-tests/support/`

Cucumber lifecycle and world state:

- `world.ts` defines `CustomWorld`
- `hooks.ts` handles browser/context/page setup, tracing, screenshots, Allure metadata, and teardown

### `e2e-tests/config/`

Runtime configuration for:

- base URL
- browser selection
- headless mode
- timeouts
- viewport
- download and HTTPS behavior

### `e2e-tests/utils/`

Shared framework utilities and typed test data helpers.

Notable current modules:

- `BrowserFactory.ts`
- `TestData.ts`
- `bookFactory.ts`
- `loginDataFactory.ts`
- `Logger.ts`
- `wait.util.ts`

## Execution Model

### Cucumber

The active automation flow is:

1. `cucumber-js` loads `.feature` files from `features/`
2. Cucumber imports support, config, utils, and step modules from `e2e-tests/`
3. `BeforeAll` launches one shared Playwright browser
4. `Before` creates a fresh browser context and page per scenario
5. `PageManager` provides page object access per scenario
6. step definitions perform actions and assertions
7. `After` captures failure evidence and always saves a Playwright trace

### Playwright Test

`playwright.config.ts` exists and points `testDir` at `./e2e-tests`, but the repo currently has no native Playwright
spec files. `npm run test:playwright` is therefore framework-ready but not currently the main test path.

## Current Feature Inventory

Current `.feature` files in the repo:

- `features/auth/TC-01-authorized-users-login.feature`
- `features/auth/cookies-session/TC-02-cookie-bypass.feature`
- `features/auth/TC-03-login.feature`
- `features/auth/TC-04-login-cookie-bypass.feature`
- `features/auth/TC-05-login-logout.feature`
- `features/auth/security/TC-06-login_security.feature`
- `features/auth/security/TC-07-login-base64.feature`
- `features/create-book/TC-08-add-a-book.feature`
- `features/create-book/TC-09-add-book.feature`
- `features/create-book/TC-10-add-book-scenarios.feature`
- `features/delete-book/TC-11-delete-a-book.feature`
- `features/e2e/TC-12-books-crud-journey.e2e.feature`
- `features/edit-book/TC-13-edit-book.feature`
- `features/accessibility/TC-14-accessibility-audit.feature`
- `features/accessibility/TC-16-accessibility-checks.feature`
- `features/performance/TC-15-page-load-performance.feature`
- `features/performance/TC-16-performance-checks.feature`
- `features/ui-test/TC-17-link-validation.feature`
- `features/ui-test/TC-18-ui-pages.feature`
- `features/ui-test/TC-19-when-responsive.landing-page.feature`
- `features/view-book/TC-20-view-books-catalog.feature`
- `features/view-book/TC-21-view-in-books-catalog.feature`

## Runtime Configuration

Environment values are resolved from `e2e-tests/config/env.config.ts`.

Supported variables from the current implementation:

- `BASE_URL`
- `PLAYWRIGHT_BASE_URL`
- `BROWSER`
- `PW_BROWSER`
- `TEST_USERNAME`
- `LOGIN_USERNAME`
- `TEST_PASSWORD`
- `LOGIN_PASSWORD`
- `HEADLESS`
- `SLOW_MO_MS`
- `ACTION_TIMEOUT_MS`
- `DEFAULT_TIMEOUT_MS`
- `NAVIGATION_TIMEOUT_MS`
- `VIEWPORT_WIDTH`
- `VIEWPORT_HEIGHT`
- `ACCEPT_DOWNLOADS`
- `IGNORE_HTTPS_ERRORS`

Default base URL:

- `https://frontendui-librarysystem.onrender.com`

### Example `.env`

`.env.example` currently contains:

```env
BASE_URL=https://frontendui-librarysystem.onrender.com
TEST_USERNAME=
TEST_PASSWORD=
BROWSER=chromium
HEADLESS=false
SLOW_MO_MS=0
ACTION_TIMEOUT_MS=5000
DEFAULT_TIMEOUT_MS=60000
NAVIGATION_TIMEOUT_MS=120000
VIEWPORT_WIDTH=1280
VIEWPORT_HEIGHT=720
ACCEPT_DOWNLOADS=true
IGNORE_HTTPS_ERRORS=true
```

## Browser Configuration

`e2e-tests/config/browser.config.ts` currently centralizes:

- Playwright launch options
- browser context options
- wait strategy defaults

Current launch behavior:

- uses `envConfig.browser`
- uses `headless` from env config
- applies:
    - `--start-maximized`
    - `--disable-extensions`
    - `--disable-popup-blocking`
    - `--no-sandbox`
- applies `slowMo` when configured

Current context behavior:

- viewport from env config
- `acceptDownloads`
- `ignoreHTTPSErrors`

## Hooks and Lifecycle

`e2e-tests/support/hooks.ts` currently does the following:

- sets Cucumber default timeout to `120000`
- launches one global browser in `BeforeAll`
- creates a fresh browser context and page per scenario
- resets generated test data before each scenario
- starts Playwright tracing before each scenario
- attaches Allure suite/story metadata
- captures screenshots on failure
- saves a Playwright trace for every scenario
- closes page and context after each scenario
- closes the global browser in `AfterAll`

## Reporting and Artifacts

### Cucumber output

`cucumber.js` currently writes:

- console progress formatter
- HTML report to `cucumber-report.html`
- JSON report to `e2e-tests/reports/cucumber-json/cucumber-report.json`
- Allure result output via `allure-cucumberjs/reporter`

### Framework artifact directories

`e2e-tests/helperUtilities/reportHelpers.ts` currently manages:

- `e2e-tests/reports/cucumber-json`
- `e2e-tests/reports/screenshots`
- `e2e-tests/reports/traces`
- `e2e-tests/reports/diagnostics`

### Multi-cucumber HTML report

Generated by:

- `npm run report:cucumber`

Script:

- `scripts/generate-multi-cucumber-report.mjs`

Output:

- `e2e-tests/reports/multi-cucumber-html-report`

### Allure

Commands currently available:

- `npm run allure:generate`
- `npm run allure:open`
- `npm run allure:serve`

Repository directories already present:

- `allure-results/`
- `allure-report/`

## Commands

Current scripts from `package.json`:

```bash
npm test
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:report
npm run test:playwright
npm run report:cucumber
npm run allure:generate
npm run allure:open
npm run allure:serve
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

### What they do

- `npm test`
  Runs `npm run test:e2e`

- `npm run test:e2e`
  Runs the full Cucumber suite

- `npm run test:e2e:headed`
  Runs the Cucumber suite with `HEADLESS=false`

- `npm run test:e2e:report`
  Runs the Cucumber suite and then generates the multi-cucumber HTML report

- `npm run test:playwright`
  Runs Playwright Test using `playwright.config.ts`

- `npm run report:cucumber`
  Generates the multi-cucumber HTML report from Cucumber JSON output

- `npm run allure:generate`
  Generates the Allure HTML report into `allure-report`

- `npm run allure:open`
  Opens the generated Allure report

- `npm run allure:serve`
  Serves Allure directly from `allure-results`

- `npm run lint`
  Runs ESLint against `.ts` files in the repository

- `npm run lint:fix`
  Runs ESLint with auto-fix enabled

- `npm run format`
  Formats the repository with Prettier

- `npm run format:check`
  Checks formatting with Prettier

These are the current scripts defined in `package.json`. There is no dedicated `build` script or CI wrapper script yet.

## Typical Local Usage

Install dependencies:

```bash
npm install
```

Run the suite:

```bash
npm run test:e2e
```

Run in headed mode:

```powershell
npm run test:e2e:headed
```

Generate the Cucumber HTML report after execution:

```bash
npm run test:e2e:report
```

Generate and open Allure:

```bash
npm run allure:generate
npm run allure:open
```

## Current Framework Conventions

- feature files define behavior
- step files orchestrate scenarios
- page objects expose actions and locators
- assertion logic sits in steps or step-side assertion helpers
- shared data generation belongs in `e2e-tests/utils`
- browser/context lifecycle belongs in `e2e-tests/support/hooks.ts`

Recent examples of this convention:

- add book assertions moved to `e2e-tests/steps/addBookAssertions.ts`
- edit book assertions moved to `e2e-tests/steps/editBookAssertions.ts`
- books catalog assertions moved to `e2e-tests/steps/booksCatalogAssertions.ts`
- page objects no longer contain `expect(...)`

## Data and Test State

Current test data flow:

- base test data from `e2e-tests/data/testData.json`
- dynamic framework test data generated through `e2e-tests/helperUtilities/testDataHelpers.ts`
- exported scenario data from `e2e-tests/utils/TestData.ts`
- per-scenario reset through `resetTestData()` in hooks

Current generated data helpers include:

- `BookFactory.unique()`
- `BookFactory.forUi()`
- `BookFactory.uniqueAddBookData()`

## Notes on Playwright Config

`playwright.config.ts` currently:

- points `testDir` to `./e2e-tests`
- enables `fullyParallel`
- uses HTML reporting
- uses `baseURL` from `envConfig.baseUrl`
- uses env-driven viewport, headless mode, HTTPS handling, and action timeout
- keeps Playwright `trace` set to `off`
- keeps Playwright `video` set to `off`
- captures screenshots only on failure
- defines browser projects for:
    - Chromium
    - Firefox
    - WebKit

## Notes on Cucumber Config

`cucumber.js` currently:

- imports TypeScript files from:
    - `e2e-tests/config/**/*.ts`
    - `e2e-tests/utils/**/*.ts`
    - `e2e-tests/support/**/*.ts`
    - `e2e-tests/steps/**/*.ts`
- uses `node --import tsx`
- emits progress, HTML, JSON, and Allure output
- applies `tags: 'not @bug'`
- loads `scripts/suppress-warnings.mjs`

## CI and Containerization Files Present

The repository currently includes:

- `Dockerfile`
- `docker-compose.yml`
- `JenkinsFile`
- `azure-devops-pipeline.yml`
- `azure-devops-test-plan-pipeline.yml`

Current reality:

- pipeline files are present, but they currently target `playwright test` rather than the active `cucumber-js` flow
- the repo does not currently publish JUnit output from Cucumber
- generated reports and artifacts are present in the repository and should be reviewed before using the project as a
  clean CI baseline

Treat the CI configuration as a starting point, not as production-ready CI/CD wiring.

## Known Current Reality

- the framework is actively organized around Cucumber scenarios
- all checked-in feature files now use `TC-xx` prefixes for stable test-case identification
- Playwright is the browser automation engine under the hood
- there is no separate native Playwright spec suite checked in right now
- generated report folders are committed in the repository
- hooks currently save a trace for every Cucumber scenario, not failure-only
- screenshots are captured on failure
- critical application gaps are currently centered on authorization, logout, and add-book validation behavior
- the existing bug analysis and test-planning documents in the repo reflect those current findings:
    - `BUG_REPORT.md`
    - `Books-Inventory-Test-Plan.rtf`
    - `Books-Inventory-Bug-Analysis.rtf`

## Recommended Next Documentation Targets

If you want the docs to go further, the next useful additions would be:

- a scenario tagging policy
- a CI execution section updated to the active Cucumber runner
- a contributor guide for adding new page objects and step assertions
- a report cleanup strategy for generated artifacts
