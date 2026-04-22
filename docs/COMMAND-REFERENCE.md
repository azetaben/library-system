# WCAG 2.2 Accessibility Testing - Command Reference

## Test Execution Commands

### Basic Commands

```bash
# Run all WCAG 2.2 accessibility tests (headless)
npm run test:accessibility:wcag-2.2

# Run with browser visible (headed mode)
npm run test:accessibility:wcag-2.2:headed

# Run only critical violations checks
npm run test:accessibility:wcag-critical

# Dry-run without browser (verify setup)
npm run test:accessibility:wcag-2.2 -- --dry-run
```

### Run Specific Pages

```bash
# Only login page tests
npm run test:accessibility:wcag-2.2 -- --tags "@login"

# Only books list tests
npm run test:accessibility:wcag-2.2 -- --tags "@books-list"

# Only add book tests
npm run test:accessibility:wcag-2.2 -- --tags "@add-book"

# Only edit book tests
npm run test:accessibility:wcag-2.2 -- --tags "@edit-book"
```

### Run Specific Violation Checks

```bash
# Only full compliance checks (skip critical-only)
npm run test:accessibility:wcag-2.2 -- --tags "@wcag-2.2 and not critical"

# Only critical/serious violations
npm run test:accessibility:wcag-2.2 -- --tags "@wcag-2.2-critical"

# Only reporting scenarios
npm run test:accessibility:wcag-2.2 -- --tags "@report"
```

### Backward Compatibility Testing

```bash
# Test against WCAG 2.1 AA
npm run test:accessibility:wcag-2.2 -- --tags "@wcag-2.1"

# Test against WCAG 2.0 AA
npm run test:accessibility:wcag-2.2 -- --tags "@wcag-2.0"
```

### All Accessibility Tests

```bash
# Run all accessibility tests (WCAG 2.2 + legacy)
npm run test:features:accessibility
```

---

## Reporting Commands

```bash
# Generate Cucumber HTML report
npm run report:cucumber

# Generate Allure report
npm run report:allure

# Open Allure report in browser
npm run allure:open

# Serve Allure reports live
npm run allure:serve
```

---

## Combined Commands

```bash
# Run tests and generate reports
npm run test:accessibility:wcag-2.2 && npm run report:cucumber

# Run with visible browser and report
npm run test:accessibility:wcag-2.2:headed && npm run report:cucumber

# Critical checks only with reports
npm run test:accessibility:wcag-critical && npm run report:cucumber
```

---

## Environment Variables

```bash
# Run with specific environment
TEST_ENV=dev npm run test:accessibility:wcag-2.2
TEST_ENV=staging npm run test:accessibility:wcag-2.2
TEST_ENV=prod npm run test:accessibility:wcag-2.2

# Run in headless mode (default)
HEADLESS=true npm run test:accessibility:wcag-2.2

# Run with visible browser
HEADLESS=false npm run test:accessibility:wcag-2.2:headed

# Run with specific browser
BROWSER=firefox npm run test:accessibility:wcag-2.2
BROWSER=webkit npm run test:accessibility:wcag-2.2

# Increase timeout for slow networks
CUCUMBER_TIMEOUT_MS=30000 npm run test:accessibility:wcag-2.2
```

---

## Advanced Cucumber Options

```bash
# List scenarios without running
npm run test:accessibility:wcag-2.2 -- --dry-run

# Run single scenario by name
npm run test:accessibility:wcag-2.2 -- --name "Login page should"

# Format output as JSON
npm run test:accessibility:wcag-2.2 -- --format json > report.json

# Format output as detailed progress
npm run test:accessibility:wcag-2.2 -- --format progress

# Run scenarios in random order
npm run test:accessibility:wcag-2.2 -- --random
```

---

## Tag Filtering Examples

### Single Tags

```bash
# Run all WCAG 2.2 tests
npm run test:accessibility:wcag-2.2 -- --tags "@wcag-2.2"

# Run accessibility tests only
npm run test:accessibility:wcag-2.2 -- --tags "@accessibility"

# Run login tests only
npm run test:accessibility:wcag-2.2 -- --tags "@login"

# Run critical checks only
npm run test:accessibility:wcag-2.2 -- --tags "@wcag-2.2-critical"

# Run reports only
npm run test:accessibility:wcag-2.2 -- --tags "@report"
```

### Combined Tags (AND)

```bash
# WCAG 2.2 AND critical
npm run test:accessibility:wcag-2.2 -- --tags "@wcag-2.2 and @wcag-2.2-critical"

# Login AND critical
npm run test:accessibility:wcag-2.2 -- --tags "@login and @wcag-2.2-critical"

# WCAG 2.2 AND NOT critical
npm run test:accessibility:wcag-2.2 -- --tags "@wcag-2.2 and not @wcag-2.2-critical"
```

### Multiple Tags (OR)

```bash
# Login OR books-list
npm run test:accessibility:wcag-2.2 -- --tags "@login or @books-list"

# Add-book OR edit-book
npm run test:accessibility:wcag-2.2 -- --tags "@add-book or @edit-book"
```

### Complex Filters

```bash
# (WCAG 2.2 OR WCAG 2.1) AND NOT report
npm run test:accessibility:wcag-2.2 -- --tags "(@wcag-2.2 or @wcag-2.1) and not @report"

# All pages but not critical
npm run test:accessibility:wcag-2.2 -- --tags "(@login or @books-list or @add-book or @edit-book) and not critical"
```

---

## Report Locations

```
Project Root/
├── e2e-tests/
│   ├── reports/
│   │   ├── diagnostics/
│   │   │   ├── accessibility-wcag-22-report.json     ← Latest WCAG 2.2 report
│   │   │   ├── accessibility-violations.json         ← Legacy format
│   │   │   └── ... (other artifacts)
│   │   ├── screenshots/                               ← Failure screenshots
│   │   └── traces/                                    ← Playwright traces
│   └── baselines/
│       └── visual/
│
├── allure-results/                                    ← Allure test results
├── allure-report/                                     ← Generated Allure report
└── cucumber-html-reports/                            ← Generated Cucumber HTML
```

---

## Viewing Results

### Cucumber Reports

```bash
# Open the generated Cucumber HTML report
# File location: cucumber-html-reports/index.html
# Open in browser after running: npm run report:cucumber
```

### Allure Reports

```bash
# Generate and serve Allure reports
npm run allure:serve

# Or generate and open
npm run allure:generate && npm run allure:open
```

### JSON Accessibility Reports

```bash
# Reports are saved to:
# e2e-tests/reports/diagnostics/accessibility-wcag-22-report.json
# e2e-tests/reports/diagnostics/accessibility-violations.json

# View with jq (if installed)
jq . e2e-tests/reports/diagnostics/accessibility-wcag-22-report.json

# Or open in any JSON viewer
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: npm ci && npx playwright install --with-deps
      
      - name: Run WCAG 2.2 Tests
        run: npm run test:accessibility:wcag-2.2
      
      - name: Generate Reports
        if: always()
        run: npm run report:cucumber
      
      - name: Upload Artifacts
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: accessibility-reports
          path: |
            e2e-tests/reports/diagnostics/
            cucumber-html-reports/
            allure-results/
```

### Azure Pipelines

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18'
  
  - script: npm ci && npx playwright install --with-deps
    displayName: 'Install Dependencies'
  
  - script: npm run test:accessibility:wcag-2.2
    displayName: 'Run WCAG 2.2 Accessibility Tests'
  
  - script: npm run report:cucumber
    displayName: 'Generate Cucumber Report'
    condition: always()
  
  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: 'e2e-tests/reports/diagnostics'
      artifactName: 'accessibility-reports'
    condition: always()
```

---

## Troubleshooting Commands

```bash
# Check if @axe-core/playwright is installed
npm ls @axe-core/playwright

# Install/update @axe-core/playwright
npm install @axe-core/playwright

# Check TypeScript compilation
npx tsc --noEmit

# Check ESLint
npm run lint

# List all available test scenarios
npm run test:accessibility:wcag-2.2 -- --dry-run

# Run with verbose logging
npm run test:accessibility:wcag-2.2 -- --format progress

# Run single scenario by name pattern
npm run test:accessibility:wcag-2.2 -- --name "login"
```

---

## Quick Copy-Paste Commands

### For Local Testing
```bash
npm run test:accessibility:wcag-2.2:headed
```

### For CI/CD Pipeline
```bash
npm run test:accessibility:wcag-2.2 && npm run report:cucumber
```

### For Critical Issues Only
```bash
npm run test:accessibility:wcag-critical
```

### For Specific Page (e.g., Login)
```bash
npm run test:accessibility:wcag-2.2 -- --tags "@login"
```

### For Dry-Run Verification
```bash
npm run test:accessibility:wcag-2.2 -- --dry-run
```

### For Full Suite with Reports
```bash
npm run test:accessibility:wcag-2.2 && npm run report:cucumber && npm run allure:generate && npm run allure:open
```

---

## Notes

- **Headless Mode**: Default (faster), use for CI/CD
- **Headed Mode**: Browser visible (slower), use for debugging
- **Dry-Run**: No browser execution, validates setup
- **Tags**: Case-sensitive, use quotes in commands
- **Environment**: TEST_ENV controls target (dev/staging/prod)
- **Reports**: Generated in `e2e-tests/reports/diagnostics/`

---

**Last Updated**: April 22, 2026  
**Standard**: WCAG 2.2 AA  
**Framework**: Cucumber + Playwright + Axe-core

