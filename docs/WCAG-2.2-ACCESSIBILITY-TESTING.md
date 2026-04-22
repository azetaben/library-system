# WCAG 2.2 Accessibility Testing Guide

## Overview

This guide provides comprehensive accessibility testing using WCAG 2.2 AA standards (the latest Web Content Accessibility Guidelines). The framework uses **@axe-core/playwright** to automatically detect accessibility violations.

## What is WCAG 2.2?

**WCAG 2.2** is the latest Web Content Accessibility Guidelines published by the W3C. It builds upon WCAG 2.1 and 2.0 with new success criteria for:

- Adaptive interfaces
- Target size (minimum touch/click targets)
- Consistent identification
- Accessible authentication
- User interface component contrast
- Reflow and text spacing
- Large hover/focus targets

## Quick Start

### 1. Run All WCAG 2.2 Accessibility Tests

```bash
npm run test:accessibility:wcag-2.2
```

### 2. Run with Headed Browser (see UI while testing)

```bash
npm run test:accessibility:wcag-2.2:headed
```

### 3. Run Only Critical Violations Check

```bash
npm run test:accessibility:wcag-critical
```

### 4. Run All Accessibility Features (includes legacy Axe tests)

```bash
npm run test:features:accessibility
```

## Available Test Scenarios

### WCAG 2.2 AA Compliance Scenarios

Located in: `features/accessibility/tc-28-wcag-2.2-compliance.feature`

#### Full Page Scans
- **Login page** - Verifies complete WCAG 2.2 AA compliance
- **Books list page** - Verifies authenticated page accessibility
- **Add Book page** - Verifies form accessibility
- **Edit Book page** - Verifies edit form accessibility

#### Critical Violations Only
- **Login page critical check** - Ensures no critical/serious issues
- **Books list critical check** - Ensures authenticated pages are critically accessible
- **Add Book critical check** - Ensures form creation is accessible
- **Edit Book critical check** - Ensures form editing is accessible

#### Backward Compatibility
- **WCAG 2.1 AA** - Tests against previous standard
- **WCAG 2.0 AA** - Tests against legacy standard

#### Reporting
- **Detailed accessibility report** - Generates JSON report of all findings

## Gherkin Steps Reference

### Full Compliance Assertions

```gherkin
Then the page should be compliant with WCAG 2.2 AA accessibility standards
Then the page should be compliant with WCAG 2.1 AA accessibility standards
Then the page should be compliant with WCAG 2.0 AA accessibility standards
```

### Critical Violations Only

```gherkin
Then the page should have no critical or serious accessibility violations
Then the page should have at most {int} accessibility violations
```

### Reporting

```gherkin
Then I should see a detailed accessibility report for the current page
```

## Understanding Accessibility Violations

### Impact Levels

When violations are found, they're categorized by impact:

1. **Critical** - Severely impacts user experience, must fix
2. **Serious** - Significant impact on user experience
3. **Moderate** - Some users may have difficulty
4. **Minor** - Affects few users or specific interactions

### Common WCAG 2.2 Violations

#### Color Contrast
- Text must have sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)
- **Rule ID**: `color-contrast`

#### Alternative Text
- Images must have alternative text
- **Rule ID**: `image-alt`

#### Form Labels
- Form inputs must have associated labels
- **Rule ID**: `label`

#### Keyboard Navigation
- All functionality must be keyboard accessible
- **Rule ID**: `keyboard`

#### Target Size (NEW in WCAG 2.2)
- Click/touch targets should be at least 24x24 CSS pixels
- **Rule ID**: `target-size`

#### Focus Visible (NEW in WCAG 2.2)
- Interactive elements must show visible focus indicator
- **Rule ID**: `focus-visible`

## Helper Functions

### Direct Helper Usage

In step files, you can directly use accessibility helpers:

```typescript
import {
    assertNoAccessibilityViolations,
    assertAccessibilityViolationsMaxCount,
    scanAccessibility,
    logAccessibilityReport,
    WCAG22_AA,
} from '../utils/assertions/index.ts';

// Scan for violations
const results = await scanAccessibility(page, { standards: 'wcag22aa' });

// Assert no violations
await assertNoAccessibilityViolations(page, { standards: 'wcag22aa' });

// Check violation count
await assertAccessibilityViolationsMaxCount(page, 5, 'critical');

// Generate report
logAccessibilityReport(results);
```

### Helper Options

```typescript
interface AccessibilityOptions {
    tags?: string[];              // WCAG tag filters
    rules?: string[];             // Specific rules to check
    disableRules?: string[];      // Rules to skip
    standards?: 'wcag22aa' | 'wcag21aa' | 'wcag2aa';
    region?: {x, y, width, height};  // Scan specific region
    includeIframesFallback?: boolean; // Include iframes
}
```

### Pre-configured Standards

```typescript
// WCAG 2.2 (latest, highest standard)
WCAG22_AA

// WCAG 2.1 (previous standard)
WCAG21_AA

// WCAG 2.0 (legacy standard)
WCAG2_AA
```

## Running Specific Tests

### Test Only Critical Issues

```bash
npm run test:accessibility:wcag-2.2 -- --tags "@login-critical or @books-list-critical"
```

### Test Only Full Compliance

```bash
npm run test:accessibility:wcag-2.2 -- --tags "@login-page or @books-list"
```

### Test a Single Page

```bash
npm run test:accessibility:wcag-2.2 -- --tags "@login"
```

### Dry Run (no browser execution)

```bash
npm run test:accessibility:wcag-2.2 -- --dry-run
```

## Interpreting Results

### Success Output

```
✓ No accessibility violations found
```

All accessibility checks passed. Page is WCAG 2.2 AA compliant.

### Violation Output

Example failure:

```
Error: Found 2 accessibility violations:
  - color-contrast [serious]: Elements must have sufficient color contrast
    Help: https://dequeuniversity.com/rules/axe/4.8/color-contrast
  - label [critical]: Form elements must have associated labels
    Help: https://dequeuniversity.com/rules/axe/4.8/label
```

## Best Practices

1. **Test Early and Often**
   - Run accessibility tests as part of your regular test suite
   - Include accessibility in your CI/CD pipeline

2. **Prioritize Critical Issues**
   - Fix critical and serious violations first
   - Use `@wcag-2.2-critical` scenario tag

3. **Review Full Reports**
   - Use the detailed report scenario to get JSON output
   - Analyze incomplete and inapplicable checks

4. **Test Real Scenarios**
   - Test authenticated pages (like books list)
   - Test form interactions
   - Test modal dialogs and overlays

5. **Keyboard Navigation**
   - Supplement automated testing with manual keyboard testing
   - Verify Tab, Enter, Escape keys work correctly

6. **Screen Reader Testing**
   - Use NVDA (Windows), JAWS, or VoiceOver
   - Verify semantic HTML and ARIA labels

## Common Issues and Solutions

### Issue: "Missing alternative text for images"

**Solution**: Add `alt` attribute to all `<img>` tags

```html
<img src="icon.png" alt="User profile icon" />
```

### Issue: "Insufficient color contrast"

**Solution**: Increase contrast ratio between text and background

```css
/* Bad: 3.2:1 contrast */
color: #777777;  /* on white */

/* Good: 7:1 contrast */
color: #333333;  /* on white */
```

### Issue: "Form input missing label"

**Solution**: Associate label with input using `for` attribute

```html
<label for="username">Username</label>
<input id="username" type="text" />
```

### Issue: "Keyboard trap"

**Solution**: Ensure Tab key can exit all interactive elements

```javascript
// In modal close button
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
```

## Troubleshooting

### Test Timeout

If tests timeout connecting to the application:
- Check network connectivity
- Verify application is running
- Check `TEST_ENV` environment variable

```bash
TEST_ENV=dev npm run test:accessibility:wcag-2.2
```

### Missing Dependencies

Ensure @axe-core/playwright is installed:

```bash
npm install @axe-core/playwright
```

### Region Scanning Not Working

For region-specific scans, ensure elements have proper `data-testid`:

```html
<div data-testid="region">
    <!-- scanned content -->
</div>
```

## Further Resources

- **W3C WCAG 2.2 Guidelines**: https://www.w3.org/WAI/WCAG22/quickref/
- **Axe DevTools**: https://www.deque.com/axe/devtools/
- **WebAIM Resources**: https://webaim.org/
- **WCAG 2.2 Techniques**: https://www.w3.org/WAI/WCAG22/Techniques/

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Run Accessibility Tests
  run: npm run test:accessibility:wcag-2.2

- name: Upload Reports
  uses: actions/upload-artifact@v2
  with:
    name: accessibility-reports
    path: e2e-tests/reports/diagnostics/
```

### Azure Pipelines

```yaml
- script: npm run test:accessibility:wcag-2.2
  displayName: 'Run WCAG 2.2 Accessibility Tests'

- task: PublishBuildArtifacts@1
  inputs:
    pathToPublish: 'e2e-tests/reports/diagnostics'
    artifactName: 'accessibility-reports'
```

## Custom Configuration

### Add New Accessibility Scenario

Edit `features/accessibility/tc-28-wcag-2.2-compliance.feature`:

```gherkin
@accessibility @wcag-2.2 @custom
Scenario: Custom page accessibility check
    Given I navigate to "/custom-page"
    Then the page should be compliant with WCAG 2.2 AA accessibility standards
```

### Create Custom Assertion

Edit `e2e-tests/steps/accessibility-assertions.ts`:

```typescript
Then(
    'the {string} page has no {string} violations',
    async function (this: CustomWorld, pageName: string, impactLevel: string) {
        const impact = impactLevel.toLowerCase() as 'critical' | 'serious' | 'moderate' | 'minor';
        const results = await scanAccessibility(this.page);
        const violations = results.violations.filter(v => v.impact === impact);
        
        if (violations.length > 0) {
            throw new Error(`Found ${violations.length} ${impact} violations`);
        }
    }
);
```

## Support and Questions

For questions about:
- **WCAG Standards**: Consult W3C documentation
- **Axe Integration**: See @axe-core/playwright documentation
- **Framework Issues**: Review AGENTS.md in the repository

---

**Last Updated**: April 22, 2026  
**WCAG Standard**: 2.2 AA  
**Framework**: Cucumber + Playwright + Axe-core

