import AxeBuilder from '@axe-core/playwright';
import type {Page} from '@playwright/test';
import {expect} from '@playwright/test';
import {logger} from '../runtime/logger.ts';

export interface AccessibilityOptions {
    tags?: string[];
    rules?: string[];
    disableRules?: string[];
    standards?: 'wcag2a' | 'wcag2aa' | 'wcag21a' | 'wcag21aa' | 'wcag22aa';
    region?: {x: number; y: number; width: number; height: number};
    includeIframesFallback?: boolean;
}

export interface AccessibilityResult {
    violations: Array<{
        id: string;
        impact: string;
        nodes: Array<{html: string}>;
        description: string;
        help: string;
        helpUrl: string;
    }>;
    passes: Array<{id: string}>;
    incomplete: Array<{id: string}>;
    inapplicable: Array<{id: string}>;
}

/**
 * Default WCAG 2.2 AA configuration
 * WCAG 2.2 AA is the current gold standard
 */
const defaultWCAG22Config = {
    tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22'],
    standards: 'wcag22aa' as const,
};

/**
 * Scan page for accessibility violations
 * Uses WCAG 2.2 AA by default (highest standard)
 */
export async function scanAccessibility(
    page: Page,
    options: AccessibilityOptions = {},
): Promise<AccessibilityResult> {
    logger.info(
        `Scanning page for accessibility violations using WCAG ${options.standards || 'wcag22aa'}`,
    );

    const {
        tags = defaultWCAG22Config.tags,
        rules,
        disableRules,
        region,
        includeIframesFallback = true,
    } = options;

    let axeBuilder = new AxeBuilder({page});

    if (tags && tags.length > 0) {
        axeBuilder = axeBuilder.withTags(tags);
    }

    if (rules && rules.length > 0) {
        axeBuilder = axeBuilder.withRules(rules);
    }

    if (disableRules && disableRules.length > 0) {
        axeBuilder = axeBuilder.disableRules(disableRules);
    }

    if (region) {
        axeBuilder = axeBuilder.include([`[data-testid="region"]`]);
    }

    if (includeIframesFallback === false) {
        axeBuilder = axeBuilder.options({
            runOnly: {
                type: 'tag',
                values: tags,
            },
        });
    }

    const results = (await axeBuilder.analyze()) as AccessibilityResult;

    logger.info(
        `Accessibility scan complete: ${results.violations.length} violations, ` +
            `${results.passes.length} passed checks, ${results.incomplete.length} incomplete`,
    );

    return results;
}

/**
 * Assert that page has no accessibility violations
 */
export async function assertNoAccessibilityViolations(
    page: Page,
    options: AccessibilityOptions = {},
): Promise<AccessibilityResult> {
    const results = await scanAccessibility(page, options);

    if (results.violations.length > 0) {
        const violationSummary = results.violations
            .map(
                (v) =>
                    `\n  - ${v.id} [${v.impact}]: ${v.description}\n    Help: ${v.helpUrl}`,
            )
            .join('');

        throw new Error(
            `Found ${results.violations.length} accessibility violations:${violationSummary}`,
        );
    }

    logger.info('✓ No accessibility violations found');
    return results;
}

/**
 * Assert that page passes specific accessibility rules
 */
export async function assertAccessibilityRules(
    page: Page,
    ruleIds: string[],
    options: AccessibilityOptions = {},
): Promise<AccessibilityResult> {
    const results = await scanAccessibility(page, {
        ...options,
        rules: ruleIds,
    });

    const failedRules = results.violations.filter((v) => ruleIds.includes(v.id));

    if (failedRules.length > 0) {
        const summary = failedRules
            .map((v) => `\n  - ${v.id} [${v.impact}]: ${v.description}`)
            .join('');

        throw new Error(
            `${failedRules.length} accessibility rules failed:${summary}`,
        );
    }

    logger.info(
        `✓ All ${ruleIds.length} accessibility rules passed`,
    );
    return results;
}

export type ViolationImpact = 'critical' | 'serious' | 'moderate' | 'minor';
export type ViolationOperator =
    | 'greater than'
    | 'less than'
    | 'equal to'
    | 'at least'
    | 'at most'
    | 'not equal to';

/**
 * Parse a comma/space/or-separated impact string into individual impact levels.
 * e.g. "critical or serious"  → ['critical', 'serious']
 *      "critical, moderate"   → ['critical', 'moderate']
 *      "any"                  → [] (means all levels)
 */
export function parseImpactLevels(raw: string): ViolationImpact[] {
    if (!raw || raw.trim().toLowerCase() === 'any') {
        return [];
    }

    return raw
        .split(/,|\bor\b/i)
        .map((s) => s.trim().toLowerCase())
        .filter((s): s is ViolationImpact =>
            ['critical', 'serious', 'moderate', 'minor'].includes(s),
        );
}

/**
 * Evaluate numeric comparison operator.
 * Supports: "greater than", "less than", "equal to", "at least", "at most", "not equal to"
 */
export function evaluateOperator(
    actual: number,
    operator: string,
    expected: number,
): boolean {
    const op = operator.trim().toLowerCase();
    switch (op) {
        case 'greater than':
            return actual > expected;
        case 'less than':
            return actual < expected;
        case 'equal to':
            return actual === expected;
        case 'at least':
            return actual >= expected;
        case 'at most':
            return actual <= expected;
        case 'not equal to':
            return actual !== expected;
        default:
            throw new Error(
                `Unsupported violation operator: "${operator}". ` +
                    'Use: "greater than", "less than", "equal to", "at least", "at most", "not equal to"',
            );
    }
}

/**
 * Generic violation count assertion.
 * Supports any impact level(s) and comparison operator.
 *
 * @param page       - Playwright Page
 * @param impactRaw  - Impact filter: "critical", "serious", "critical or serious", "any", etc.
 * @param operator   - Comparison operator: "greater than", "less than", "equal to", etc.
 * @param count      - Expected count to compare against
 * @param options    - Axe scan options
 */
export async function assertAccessibilityViolationsComparison(
    page: Page,
    impactRaw: string,
    operator: string,
    count: number,
    options: AccessibilityOptions = {},
): Promise<AccessibilityResult> {
    const results = await scanAccessibility(page, options);
    const levels = parseImpactLevels(impactRaw);

    const filtered =
        levels.length === 0
            ? results.violations
            : results.violations.filter((v) =>
                  levels.includes(v.impact as ViolationImpact),
              );

    const impactLabel =
        levels.length === 0 ? 'any impact' : levels.join(' or ');
    logger.info(
        `Asserting: violations [${impactLabel}] ${operator} ${count} — found ${filtered.length}`,
    );

    if (!evaluateOperator(filtered.length, operator, count)) {
        const summary = filtered
            .map((v) => `\n  - ${v.id} [${v.impact}]: ${v.description}`)
            .join('');
        throw new Error(
            `Expected violations [${impactLabel}] to be ${operator} ${count}, ` +
                `but found ${filtered.length}.${summary}`,
        );
    }

    logger.info(
        `✓ Violations [${impactLabel}] ${operator} ${count} — assertion passed (actual: ${filtered.length})`,
    );
    return results;
}

/**
 * Assert max number of violations of a specific impact level
 */
export async function assertAccessibilityViolationsMaxCount(
    page: Page,
    maxCount: number,
    impact?: 'critical' | 'serious' | 'moderate' | 'minor',
    options: AccessibilityOptions = {},
): Promise<AccessibilityResult> {
    const results = await scanAccessibility(page, options);

    const filteredViolations = impact
        ? results.violations.filter((v) => v.impact === impact)
        : results.violations;

    expect(filteredViolations).toHaveLength(filteredViolations.length);

    if (filteredViolations.length > maxCount) {
        const impactText = impact ? ` with impact "${impact}"` : '';
        throw new Error(
            `Expected at most ${maxCount} violations${impactText}, ` +
                `but found ${filteredViolations.length}`,
        );
    }

    logger.info(
        `✓ Violation count within threshold: ${filteredViolations.length}/${maxCount}`,
    );
    return results;
}

/**
 * Log detailed accessibility report
 */
export function logAccessibilityReport(results: AccessibilityResult): void {
    logger.info('=== ACCESSIBILITY REPORT ===');
    logger.info(`Total Violations: ${results.violations.length}`);
    logger.info(`Passed Checks: ${results.passes.length}`);
    logger.info(`Incomplete: ${results.incomplete.length}`);
    logger.info(`Inapplicable: ${results.inapplicable.length}`);

    if (results.violations.length > 0) {
        logger.info('\n--- VIOLATIONS ---');
        results.violations.forEach((v) => {
            logger.info(
                `[${v.impact.toUpperCase()}] ${v.id}: ${v.description}`,
            );
            logger.info(`  Help: ${v.helpUrl}`);
            logger.info(`  Elements: ${v.nodes.length}`);
        });
    }
}

/**
 * Get WCAG 2.2 specific configuration
 */
export const WCAG22_AA = {
    standards: 'wcag22aa' as const,
    tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22'],
};

export const WCAG21_AA = {
    standards: 'wcag21aa' as const,
    tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
};

export const WCAG2_AA = {
    standards: 'wcag2aa' as const,
    tags: ['wcag2a', 'wcag2aa'],
};

