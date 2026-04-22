# Accessibility Testing Conversion: Playwright → Cucumber

## Overview

This document shows the conversion of the standalone Playwright accessibility test (`accessibilitytesting.spec.ts`) to a comprehensive Cucumber framework using WCAG 2.2 standards.

## Original Playwright Spec

```typescript
/*
1) Playwright can be used to test your application for many types of accessibility issues.
Examples:
    Missing or Improper ALT Text for Images
    Poor Color Contrast
    Missing Form Labels
    Keyboard Navigation Issues

Every website should follow WCAG guidelines.
    - Web Content Accessibility Guidelines (WCAG) 

Install @axe-core/playwright: 
    npm install @axe-core/playwright

https://www.npmjs.com/package/@axe-core/playwright
*/

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright'; 

test("accessibility test", async({page},testInfo)=>{
 //await page.goto('https://demowebshop.tricentis.com/');
await page.goto('https://www.w3.org/');

//1) Scanning detect all types of WCAG violations.
//const accessibilityScanResults=await new AxeBuilder({page}).analyze();
//expect(accessibilityScanResults.violations).toEqual([]);
// expect(accessibilityScanResults.violations.length).toEqual(0);

//2) Scanning for few WCAG violations
//const accessibilityScanResults=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();

//3) Scanning for fe WCAG violations with rules
const accessibilityScanResults=await new AxeBuilder({page}).disableRules(['duplicate-id']).analyze();

await testInfo.attach('accessibility results',{
                                                body: JSON.stringify(accessibilityScanResults,null,2),
                                                contentType:'application/json'
                                                });

console.log("Number of violations:====>",accessibilityScanResults.violations.length);
expect(accessibilityScanResults.violations.length).toEqual(0);
})
```

## Cucumber Conversion

### 1. Feature File

**File**: `features/accessibility/tc-28-wcag-2.2-compliance.feature`

```gherkin
@accessibility @wcag-2.2
Feature: WCAG 2.2 AA Accessibility Compliance
  As a QA engineer
  I want to verify that core pages comply with WCAG 2.2 AA standards
  So that the application is accessible to all users

  Background:
    Given I navigate to "/login"

  @wcag-2.2 @login-page
  Scenario: Login page should be WCAG 2.2 AA compliant
    And I should be in the "login" page
    Then the page should be compliant with WCAG 2.2 AA accessibility standards

  @wcag-2.2 @login-critical
  Scenario: Login page should have no critical accessibility violations
    And I should be in the "login" page
    Then the page should have no critical or serious accessibility violations

  @wcag-2.2 @report
  Scenario: Generate detailed accessibility report for login page
    And I should be in the "login" page
    Then I should see a detailed accessibility report for the current page
```

### 2. Helper Functions

**File**: `e2e-tests/utils/assertions/accessibility-helpers.ts`

**Key improvements over original spec:**

1. **Reusable helpers** - Extract scan logic into functions
2. **WCAG 2.2 focus** - Uses latest standards by default
3. **Better error messages** - Detailed violation information
4. **Flexible options** - Configure rules, tags, standards per call
5. **Report generation** - Structured JSON reports with filtering

```typescript
// Example: Scan for violations
const results = await scanAccessibility(page, {
    standards: 'wcag22aa'
});

// Example: Assert no violations
await assertNoAccessibilityViolations(page, {
    standards: 'wcag22aa'
});

// Example: Check only critical
const critical = results.violations.filter(v => v.impact === 'critical');
```

### 3. Step Definitions

**File**: `e2e-tests/steps/accessibility-assertions.ts`

Combines original spec capabilities with Cucumber semantics:

```typescript
// Original: new AxeBuilder({page}).analyze()
// Cucumber: the page should be compliant with WCAG 2.2 AA accessibility standards

Then(
    'the page should be compliant with WCAG 2.2 AA accessibility standards',
    async function (this: CustomWorld) {
        const results = await assertNoAccessibilityViolations(this.page, {
            standards: 'wcag22aa',
        });
        logAccessibilityReport(results);
    },
);

// Original: expect(violations.length).toEqual(0)
// Cucumber: the page should have no critical or serious accessibility violations

Then(
    'the page should have no critical or serious accessibility violations',
    async function (this: CustomWorld) {
        const results = await scanAccessibility(this.page);
        const criticalAndSerious = results.violations.filter(
            (v) => v.impact === 'critical' || v.impact === 'serious'
        );
        
        if (criticalAndSerious.length > 0) {
            throw new Error(`Found violations`);
        }
    },
);
```

## Comparison Matrix

| Aspect | Original Playwright | Cucumber Conversion |
|--------|-------------------|-------------------|
| **Standards Support** | WCAG 2.0/2.1 only | WCAG 2.0/2.1/2.2 |
| **Configuration** | Code comments | Human-readable steps |
| **Reusability** | Single test file | Shared helpers + multiple scenarios |
| **Reporting** | Basic console log | JSON reports + attachments |
| **Flexibility** | Manual test coding | Configurable via steps |
| **CI/CD Integration** | Test runner specific | Framework agnostic |
| **Team Collaboration** | Requires TypeScript | Non-technical readable |
| **Scalability** | Single test case | Multiple scenarios per feature |

## Feature Enhancements

### 1. Multiple Standards Support

**Original** (Commented out options):
```typescript
// Option 1: All violations
// const results = await new AxeBuilder({page}).analyze();

// Option 2: Specific tags
// const results = await new AxeBuilder({page})
//   .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa'])
//   .analyze();

// Option 3: Exclude rules
// const results = await new AxeBuilder({page})
//   .disableRules(['duplicate-id'])
//   .analyze();
```

**Cucumber Conversion**:
```gherkin
# WCAG 2.2 AA (latest, highest standard)
Then the page should be compliant with WCAG 2.2 AA accessibility standards

# WCAG 2.1 AA (previous standard)
Then the page should be compliant with WCAG 2.1 AA accessibility standards

# WCAG 2.0 AA (legacy standard)
Then the page should be compliant with WCAG 2.0 AA accessibility standards

# Critical violations only
Then the page should have no critical or serious accessibility violations
```

### 2. Impact Level Filtering

**Original** (Manual filtering required):
```typescript
// Not demonstrated in original spec
// Would require: results.violations.filter(v => v.impact === 'critical')
```

**Cucumber Steps Added**:
```typescript
Then(
    'the page should have at most {int} {string} accessibility violations',
    async function (this: CustomWorld, maxCount: number, impactLevel: string) {
        const impact = impactLevel as 'critical' | 'serious' | 'moderate' | 'minor';
        const results = await scanAccessibility(this.page);
        const filtered = results.violations.filter(v => v.impact === impact);
        
        if (filtered.length > maxCount) {
            throw new Error(`Too many ${impact} violations`);
        }
    },
);
```

### 3. Detailed Reporting

**Original**:
```typescript
// Console log only
console.log("Number of violations:====>",accessibilityScanResults.violations.length);

// Basic attachment
await testInfo.attach('accessibility results',{
    body: JSON.stringify(accessibilityScanResults, null, 2),
    contentType:'application/json'
});
```

**Cucumber Conversion**:
```typescript
// Structured logging
logAccessibilityReport(results);

// Enhanced reporting with filtering
export function logAccessibilityReport(results: AccessibilityResult): void {
    logger.info('=== ACCESSIBILITY REPORT ===');
    logger.info(`Total Violations: ${results.violations.length}`);
    logger.info(`Passed Checks: ${results.passes.length}`);
    
    // Detailed violation breakdown
    results.violations.forEach((v) => {
        logger.info(`[${v.impact.toUpperCase()}] ${v.id}: ${v.description}`);
        logger.info(`  Help: ${v.helpUrl}`);
    });
}

// JSON artifacts + attachments
this.attach(JSON.stringify(results, null, 2), 'application/json');
```

### 4. Scenario-Based Testing

**Original** (Single test, manual configuration):
```typescript
test("accessibility test", async({page},testInfo)=>{
    // One test for one configuration
    // Hard to run specific checks
    // No clear test naming
});
```

**Cucumber** (Multiple distinct scenarios):
```gherkin
Scenario: Login page should be WCAG 2.2 AA compliant
Scenario: Login page should have no critical accessibility violations
Scenario: Books list page should be WCAG 2.2 AA compliant
Scenario: Add Book page should be WCAG 2.2 AA compliant
Scenario: Edit Book page should be WCAG 2.2 AA compliant
Scenario: Generate detailed accessibility report
```

Each scenario:
- Tests one specific accessibility aspect
- Has clear, human-readable name
- Can be run independently via tags
- Produces independent pass/fail result

## Running the Converted Tests

### Basic Execution

```bash
# Original: 
# Manual execution via Playwright test runner
# playwright test accessibilitytesting.spec.ts

# Cucumber:
npm run test:accessibility:wcag-2.2
```

### Run Specific Scenarios

```bash
# Original:
# Would require modifying code and commenting/uncommenting options

# Cucumber:
# Run only login page tests
npm run test:accessibility:wcag-2.2 -- --tags "@login"

# Run only critical checks
npm run test:accessibility:wcag-2.2 -- --tags "@wcag-2.2-critical"

# Run with UI visible
npm run test:accessibility:wcag-2.2:headed
```

### Generate Reports

```bash
# Original: 
# testInfo.attach() - requires Playwright Test reporter
# Basic console output

# Cucumber:
npm run test:accessibility:wcag-2.2
# Then: npm run report:cucumber
# Generates Allure reports with accessibility data
```

## Migration Benefits

### For Developers
✅ Human-readable test definitions  
✅ No TypeScript boilerplate  
✅ Easy to extend with new checks  
✅ IDE autocomplete for step definitions

### For QA Engineers
✅ Run specific tests via tags  
✅ Clear, detailed failure messages  
✅ Structured reports  
✅ Easy to add new pages/components

### For Teams
✅ Non-technical team members can understand tests  
✅ CI/CD integration simplified  
✅ Consistent with other E2E tests  
✅ Better test documentation

### For Project
✅ Latest WCAG 2.2 standard support  
✅ Flexible configuration per scenario  
✅ Comprehensive reporting  
✅ Impact-level violation filtering

## Next Steps

1. **Run the full suite**:
   ```bash
   npm run test:accessibility:wcag-2.2
   ```

2. **Review the feature file**:
   ```
   features/accessibility/tc-28-wcag-2.2-compliance.feature
   ```

3. **Check helper functions**:
   ```
   e2e-tests/utils/assertions/accessibility-helpers.ts
   ```

4. **Read the comprehensive guide**:
   ```
   docs/WCAG-2.2-ACCESSIBILITY-TESTING.md
   ```

5. **Add custom scenarios** for your pages in the feature file

---

**Conversion Date**: April 22, 2026  
**Original Standard**: WCAG 2.0/2.1  
**New Standard**: WCAG 2.2 AA  
**Framework**: Cucumber + Playwright + Axe-core

