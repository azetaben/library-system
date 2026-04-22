# Quick Reference: Accessibility Testing Commands

## Run Tests

```bash
# All WCAG 2.2 accessibility tests (headless)
npm run test:accessibility:wcag-2.2

# WCAG 2.2 with browser visible
npm run test:accessibility:wcag-2.2:headed

# Only critical violations check
npm run test:accessibility:wcag-critical

# All accessibility tests (WCAG 2.2 + legacy)
npm run test:features:accessibility

# Dry-run (no browser execution)
npm run test:accessibility:wcag-2.2 -- --dry-run
```

## Run Specific Tests

```bash
# Only login page tests
npm run test:accessibility:wcag-2.2 -- --tags "@login"

# Only books list tests
npm run test:accessibility:wcag-2.2 -- --tags "@books-list"

# Only critical issue checks
npm run test:accessibility:wcag-2.2 -- --tags "@wcag-2.2-critical"

# Only full compliance checks (not critical-only)
npm run test:accessibility:wcag-2.2 -- --tags "@wcag-2.2 and not critical"

# Report generation only
npm run test:accessibility:wcag-2.2 -- --tags "@report"
```

## Generated Reports

### Locations

```
e2e-tests/
├── reports/
│   ├── diagnostics/
│   │   ├── accessibility-wcag-22-report.json    # Latest WCAG 2.2 report
│   │   ├── accessibility-violations.json        # Legacy format
│   │   ├── accessibility-violations-options.json
│   │   └── ... (other artifacts)
│   ├── screenshots/
│   └── traces/
└── baselines/
    └── visual/
```

### View Reports

```bash
# View HTML Cucumber report
npm run report:cucumber

# View Allure report (if configured)
npm run report:allure

# View Allure report live
npm run allure:serve
```

## Available Gherkin Steps

### Full Compliance

```gherkin
Then the page should be compliant with WCAG 2.2 AA accessibility standards
Then the page should be compliant with WCAG 2.1 AA accessibility standards
Then the page should be compliant with WCAG 2.0 AA accessibility standards
```

### Critical/Serious Only

```gherkin
Then the page should have no critical or serious accessibility violations
Then the page should have at most {int} accessibility violations
```

### Reporting

```gherkin
Then I should see a detailed accessibility report for the current page
```

## Helper Functions (for custom steps)

```typescript
import {
    scanAccessibility,
    assertNoAccessibilityViolations,
    logAccessibilityReport,
    WCAG22_AA,
    WCAG21_AA,
    WCAG2_AA,
} from '../utils/assertions/index.ts';

// Scan and get results
const results = await scanAccessibility(page, { standards: 'wcag22aa' });

// Assert no violations
await assertNoAccessibilityViolations(page, { standards: 'wcag22aa' });

// Log structured report
logAccessibilityReport(results);

// Filter results
const critical = results.violations.filter(v => v.impact === 'critical');
const serious = results.violations.filter(v => v.impact === 'serious');
```

## Feature File Location

```
features/accessibility/tc-28-wcag-2.2-compliance.feature
```

## Step Definition Location

```
e2e-tests/steps/accessibility-assertions.ts
```

## Helper Location

```
e2e-tests/utils/assertions/accessibility-helpers.ts
```

## Common Violations & Fixes

| Violation | Impact | Fix |
|-----------|--------|-----|
| `color-contrast` | Serious | Increase text/background contrast to 4.5:1 |
| `image-alt` | Critical | Add descriptive `alt` text to images |
| `label` | Critical | Associate `<label>` with form inputs |
| `button-name` | Critical | Add visible text or `aria-label` to buttons |
| `target-size` | Moderate | Make clickable elements ≥24x24 CSS pixels |
| `focus-visible` | Serious | Add visible focus styles to interactive elements |

## Environment Variables

```bash
# Set test environment
TEST_ENV=dev npm run test:accessibility:wcag-2.2

# Run headless (CI mode)
HEADLESS=true npm run test:accessibility:wcag-2.2

# Run with specific browser
BROWSER=firefox npm run test:accessibility:wcag-2.2

# Show browser (headed mode)
HEADLESS=false npm run test:accessibility:wcag-2.2:headed
```

## Standards Reference

### WCAG 2.2 (Latest, Recommended)
- **Alias**: `wcag22aa`
- **Tags**: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22`
- **Date**: September 2023
- **New Criteria**: 
  - Accessible authentication
  - Target size (NEW)
  - User interface component contrast (NEW)
  - Reflow (NEW)
  - Text spacing (NEW)

### WCAG 2.1
- **Alias**: `wcag21aa`
- **Tags**: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`
- **Date**: June 2018

### WCAG 2.0 (Legacy)
- **Alias**: `wcag2aa`
- **Tags**: `wcag2a`, `wcag2aa`
- **Date**: December 2008

## Troubleshooting

### Tests timeout
```bash
# Check network, then run with increased timeout
TEST_ENV=dev npm run test:accessibility:wcag-2.2
```

### Missing @axe-core/playwright
```bash
npm install @axe-core/playwright
```

### Want to skip specific rules
Use the helper with `disableRules` option in custom steps

### Want to test only specific rules
Use the helper with `rules` option in custom steps

## Integration Examples

### Add to CI Pipeline (GitHub Actions)

```yaml
- name: Run Accessibility Tests
  run: npm run test:accessibility:wcag-2.2

- name: Upload Reports
  uses: actions/upload-artifact@v2
  with:
    name: accessibility-reports
    path: e2e-tests/reports/diagnostics/
```

### Add to Azure Pipelines

```yaml
- script: npm run test:accessibility:wcag-2.2
  displayName: 'WCAG 2.2 Accessibility Tests'

- task: PublishBuildArtifacts@1
  inputs:
    pathToPublish: 'e2e-tests/reports/diagnostics'
    artifactName: 'accessibility-reports'
```

## Resources

- [W3C WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Axe DevTools Documentation](https://www.deque.com/axe/devtools/)
- [WebAIM Best Practices](https://webaim.org/)
- Full guide: `docs/WCAG-2.2-ACCESSIBILITY-TESTING.md`
- Conversion guide: `docs/ACCESSIBILITY-CONVERSION-GUIDE.md`

---

**Quick Reference Version**: 1.0  
**Date**: April 22, 2026  
**Standard**: WCAG 2.2 AA

