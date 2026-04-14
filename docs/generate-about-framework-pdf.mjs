import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const docsDir = path.join(projectRoot, 'docs');
const outputHtmlPath = path.join(docsDir, 'about-framework.html');
const outputPdfPath = path.join(docsDir, 'about-framework.pdf');
const generatedOn = new Date().toISOString().slice(0, 10);

const list = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Library System Automation Framework</title>
  <style>
    :root {
      --ink: #1f2937;
      --muted: #4b5563;
      --accent: #0f766e;
      --paper: #fffdfa;
      --line: #d6d3d1;
      --panel: #fafaf9;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      color: var(--ink);
      background: var(--paper);
      line-height: 1.55;
      font-size: 12px;
    }
    main {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 46px 56px;
    }
    h1, h2, h3 { margin: 0 0 10px; line-height: 1.2; }
    h1 { font-size: 26px; color: var(--accent); margin-bottom: 8px; }
    h2 {
      font-size: 18px;
      border-bottom: 1px solid var(--line);
      padding-bottom: 6px;
      margin-top: 28px;
    }
    h3 { font-size: 14px; margin-top: 18px; }
    p { margin: 0 0 10px; }
    ul, ol { margin: 8px 0 12px 20px; padding: 0; }
    li { margin: 3px 0; }
    code {
      font-family: "Courier New", monospace;
      font-size: 11px;
      background: #f5f5f4;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .lead {
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 18px;
    }
    .flow, .note {
      border: 1px solid var(--line);
      background: var(--panel);
      padding: 14px 16px;
      margin: 14px 0 18px;
    }
    .small {
      color: var(--muted);
      font-size: 11px;
    }
  </style>
</head>
<body>
  <main>
    <h1>Library System Automation Framework</h1>
    <p class="lead">
      Current framework overview for <code>${projectRoot}</code>, covering the active Cucumber runtime, Playwright browser layer,
      feature inventory, and reporting state.
    </p>

    <h2>1. What This Repository Does</h2>
    <p>
      This project is a TypeScript UI automation framework for the Books Inventory application. The primary runner is
      Cucumber, Playwright supplies browser automation, and Allure plus Cucumber HTML/JSON provide reporting.
    </p>
    <p>
      The repository is currently Cucumber-first. A Playwright Test configuration exists, but the checked-in coverage is centered
      on <code>.feature</code> files and step definitions.
    </p>

    <h2>2. High-Level Execution Flow</h2>
    <div class="flow">
      <ol>
        <li>You run <code>npm run test:e2e</code> or another Cucumber-targeted npm script.</li>
        <li><code>package.json</code> launches local <code>@cucumber/cucumber</code> through <code>node --import tsx</code>.</li>
        <li><code>cucumber.js</code> imports config, utilities, support code, and step definitions from <code>e2e-tests/</code>.</li>
        <li>Cucumber reads feature files from <code>features/</code>.</li>
        <li><code>hooks.ts</code> starts one shared browser, then creates a fresh context and page per scenario.</li>
        <li>Step definitions call page objects and assertion helpers.</li>
        <li>Hooks save screenshots on failure, traces for every scenario, and report artifacts.</li>
      </ol>
    </div>

    <h2>3. Package Scripts and Runner Entry Points</h2>
    ${list([
      '<code>test:e2e</code>, <code>test:e2e:headed</code>, <code>test:smoke</code>, <code>test:regression</code>, and <code>test:dry-run</code> all execute local <code>@cucumber/cucumber</code>.',
      '<code>test:features:*</code> scripts target feature-area subsets such as auth, create-book, edit-book, and workflow-oriented coverage folders.',
      '<code>test:playwright</code> exists, but the repository does not currently depend on native Playwright spec files for its main coverage path.',
    ])}
    <div class="note">
      <strong>Current repo state:</strong> report helper scripts are versioned in <code>docs/</code>, while <code>package.json</code> still points
      <code>report:cucumber</code> and <code>report:pdf</code> at a missing <code>scripts/</code> directory. Treat that as a wiring gap, not as
      authoritative documentation.
    </div>

    <h2>4. Cucumber Configuration</h2>
    <p>The file <code>cucumber.js</code> is the active runtime wiring layer.</p>
    ${list([
      'It imports TypeScript modules from <code>e2e-tests/config</code>, <code>e2e-tests/utils</code>, <code>e2e-tests/support</code>, and <code>e2e-tests/steps</code>.',
      'It writes progress, summary, HTML, JSON, and Allure-compatible output.',
      'The default profile excludes scenarios tagged <code>@bug</code>.',
      'Dedicated profiles are defined for <code>smoke</code>, <code>regression</code>, <code>debug</code>, <code>dryRun</code>, and <code>ci</code>.',
    ])}

    <h2>5. Environment Configuration</h2>
    <p>
      Runtime settings come from <code>e2e-tests/config/env.config.ts</code>. It loads <code>.env</code> and <code>.env.example</code>,
      resolves the target environment, and exports a single <code>envConfig</code> object.
    </p>
    ${list([
      '<code>TEST_ENV</code> controls <code>dev</code>, <code>staging</code>, or <code>prod</code> selection.',
      'Base URLs are resolved from <code>DEV_BASE_URL</code>, <code>STAGING_BASE_URL</code>, <code>PROD_BASE_URL</code>, with backward compatibility for <code>BASE_URL</code>.',
      'Browser, credentials, timeouts, responsive polling values, viewport, download behavior, and optional Playwright web-server settings all live here.',
    ])}

    <h2>6. Browser and Scenario Lifecycle</h2>
    <p>
      Browser launch policy is defined in <code>e2e-tests/config/browser.config.ts</code>. Browser creation happens through
      <code>BrowserFactory.ts</code>, and scenario lifecycle is managed in <code>e2e-tests/support/hooks.ts</code>.
    </p>
    <h3>Before All</h3>
    ${list([
      'Initialize Allure runtime.',
      'Ensure Cucumber JSON, screenshots, and traces directories exist.',
      'Launch one shared Playwright browser.',
    ])}
    <h3>Before Each Scenario</h3>
    ${list([
      'Reset generated test data.',
      'Create a fresh browser context and page.',
      'Start Playwright tracing.',
      'Create a scenario-scoped <code>PageManager</code>.',
      'Attach Allure metadata such as feature, story, tags, base URL, and generated book title.',
    ])}
    <h3>After Each Scenario</h3>
    ${list([
      'Capture a full-page screenshot on failure.',
      'Stop tracing and attach the trace artifact.',
      'Close the page and browser context.',
    ])}
    <h3>After All</h3>
    ${list(['Close the shared browser instance.'])}

    <h2>7. World, Steps, and Page Objects</h2>
    <p>
      <code>CustomWorld</code> stores the current browser, context, page, page manager, and scenario-scoped book data.
      Step definitions in <code>e2e-tests/steps/</code> translate Gherkin into browser actions and assertions.
    </p>
    ${list([
      'Action and navigation logic stays in files such as <code>commonSteps.ts</code>, <code>commonNaviSteps.ts</code>, <code>addBookSteps.ts</code>, and <code>editBookSteps.ts</code>.',
      'Assertion-heavy verification lives alongside them in files such as <code>addBookAssertions.ts</code>, <code>booksCatalogAssertions.ts</code>, and <code>editBookAssertions.ts</code>.',
      'Page objects under <code>e2e-tests/pages/</code> provide locators and deterministic UI actions rather than assertion-heavy scenario logic.',
    ])}

    <h2>8. Current Feature Inventory</h2>
    <p>The active feature layout is grouped by business area plus executable workflow examples.</p>
    ${list([
      '<code>features/auth</code> and <code>features/cookies-session</code> cover login, cookie, and logout behavior.',
      '<code>features/create-book</code>, <code>delete-book</code>, <code>edit-book</code>, and <code>view-book</code> cover CRUD behavior.',
      '<code>features/security</code>, <code>performance</code>, <code>accessibility</code>, and <code>ui-test</code> cover specialized checks.',
      '<code>features/e2e</code> contains multi-step journey scenarios.',
      '<code>features/workflow</code> contains small executable documentation scenarios for login, add, edit, delete, logout, security, and responsive flows.',
    ])}

    <h2>9. Shared Helpers and Test Data</h2>
    ${list([
      '<code>e2e-tests/helperUtilities</code> contains report helpers, wait helpers, path helpers, and verification utilities.',
      '<code>e2e-tests/utils/TestData.ts</code> and <code>BookFactory</code> provide scenario data and unique book generation.',
      'Shared configuration and helper modules are imported directly by Cucumber through <code>cucumber.js</code>.',
    ])}

    <h2>10. Reporting and Artifacts</h2>
    ${list([
      'Cucumber HTML is written to <code>e2e-tests/reports/cucumber-html/cucumber-report.html</code>.',
      'Cucumber JSON is written to <code>e2e-tests/reports/cucumber-json/cucumber-report.json</code>.',
      'Screenshots and traces are stored under <code>e2e-tests/reports/screenshots</code> and <code>e2e-tests/reports/traces</code>.',
      '<code>allure-results/</code> is populated for Allure report generation.',
      '<code>docs/generate-multi-cucumber-report.mjs</code> is the checked-in helper that copies the generated HTML report into the report root.',
    ])}

    <h2>11. Playwright Config in Context</h2>
    <p>
      <code>playwright.config.ts</code> remains useful for native Playwright Test execution and for environment/browser project definitions.
      It currently defines environment-specific browser projects, failure screenshots, retained video on failure, and an optional web server.
    </p>
    <p>
      In this repository, however, Playwright is primarily the browser engine underneath the Cucumber layer.
    </p>

    <h2>12. Final Mental Model</h2>
    <div class="flow">
      <p><strong>Command layer:</strong> <code>package.json</code></p>
      <p><strong>Runner layer:</strong> <code>cucumber.js</code> and local <code>@cucumber/cucumber</code></p>
      <p><strong>Config layer:</strong> <code>env.config.ts</code> and <code>browser.config.ts</code></p>
      <p><strong>Lifecycle layer:</strong> <code>hooks.ts</code> and <code>world.ts</code></p>
      <p><strong>Behavior layer:</strong> feature files in <code>features/</code></p>
      <p><strong>Orchestration layer:</strong> step definitions in <code>e2e-tests/steps/</code></p>
      <p><strong>UI abstraction layer:</strong> page objects in <code>e2e-tests/pages/</code></p>
      <p><strong>Automation engine:</strong> Playwright browser, context, page, locators, and actions</p>
      <p><strong>Output layer:</strong> Cucumber HTML/JSON, Allure, screenshots, and traces</p>
    </div>

    <p class="small">Generated on ${generatedOn} for the current workspace state.</p>
  </main>
</body>
</html>`;

await fs.mkdir(docsDir, { recursive: true });
await fs.writeFile(outputHtmlPath, html, 'utf8');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.setContent(html, { waitUntil: 'load' });
await page.pdf({
  path: outputPdfPath,
  format: 'A4',
  printBackground: true,
  margin: {
    top: '16mm',
    right: '14mm',
    bottom: '16mm',
    left: '14mm',
  },
});

await browser.close();

console.log(outputPdfPath);
