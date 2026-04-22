import {DataTable, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import {CustomWorld} from '../support/world.ts';
import {buildArtifactPath, ensureFrameworkArtifactDirs, logger} from '../utils/runtime/index.ts';
import {
    assertNoAccessibilityViolations as assertNoViolations,
    assertAccessibilityViolationsComparison,
    logAccessibilityReport,
    WCAG21_AA,
    WCAG2_AA,
} from '../utils/assertions/index.ts';

const looksLikeAxeTag = (value: string): boolean =>
    /^(wcag\d+[a-z]*|best-practice|experimental|section508|cat\.[\w-]+)$/i.test(
        value.trim(),
    );

const mapViolations = (
    violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'],
) =>
    violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        tags: violation.tags,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.map((node) => ({
            html: node.html,
            target: node.target,
            failureSummary: node.failureSummary,
        })),
    }));

async function assertNoAccessibilityViolations(
    _world: CustomWorld,
    axeBuilder: AxeBuilder,
    artifactName: string,
): Promise<void> {
    const accessibilityScanResults = await axeBuilder.analyze();

    if (accessibilityScanResults.violations.length > 0) {
        ensureFrameworkArtifactDirs();
        const reportPath = buildArtifactPath('diagnostics', artifactName);
        fs.writeFileSync(
            reportPath,
            JSON.stringify(mapViolations(accessibilityScanResults.violations), null, 2),
        );
        logger.warn(`Accessibility violations written to ${reportPath}`);
    }

    expect(accessibilityScanResults.violations).toEqual([]);
}

Then('the page should be accessible', async function (this: CustomWorld) {
    logger.info('Running default accessibility scan');
    await assertNoAccessibilityViolations(
        this,
        new AxeBuilder({page: this.page}),
        'accessibility-violations.json',
    );
});

Then(
    'the page should be accessible with the following options:',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Running accessibility scan with custom rule options');
        const options = dataTable.hashes();
        const enabledOptions = options
            .filter((option) => option.enabled === 'true')
            .map((option) => option.ruleId?.trim())
            .filter((option): option is string => Boolean(option));

        let axeBuilder = new AxeBuilder({page: this.page});
        const tags = enabledOptions.filter(looksLikeAxeTag);
        const rules = enabledOptions.filter((option) => !looksLikeAxeTag(option));

        if (tags.length > 0) {
            axeBuilder = axeBuilder.withTags(tags);
        }

        if (rules.length > 0) {
            axeBuilder = axeBuilder.withRules(rules);
        }

        await assertNoAccessibilityViolations(
            this,
            axeBuilder,
            'accessibility-violations-options.json',
        );
    },
);

// WCAG 2.2 AA Specific Steps
Then(
    'the page should be compliant with WCAG 2.2 AA accessibility standards',
    async function (this: CustomWorld) {
        logger.info('Verifying page compliance with WCAG 2.2 AA standards');
        const results = await assertNoViolations(this.page, {
            standards: 'wcag22aa',
        });
        logAccessibilityReport(results);
    },
);

Then(
    'the page should be compliant with WCAG 2.1 AA accessibility standards',
    async function (this: CustomWorld) {
        logger.info('Verifying page compliance with WCAG 2.1 AA standards');
        const results = await assertNoViolations(this.page, WCAG21_AA);
        logAccessibilityReport(results);
    },
);

Then(
    'the page should be compliant with WCAG 2.0 AA accessibility standards',
    async function (this: CustomWorld) {
        logger.info('Verifying page compliance with WCAG 2.0 AA standards');
        const results = await assertNoViolations(this.page, WCAG2_AA);
        logAccessibilityReport(results);
    },
);

Then(
    'the page should have no critical or serious accessibility violations',
    async function (this: CustomWorld) {
        logger.info('Verifying no critical or serious accessibility violations');
        const results = await assertNoViolations(this.page, {
            standards: 'wcag22aa',
        });

        const criticalAndSerious = results.violations.filter(
            (v) => v.impact === 'critical' || v.impact === 'serious',
        );

        if (criticalAndSerious.length > 0) {
            const summary = criticalAndSerious
                .map((v) => `\n  - ${v.id} [${v.impact}]: ${v.description}`)
                .join('');
            throw new Error(
                `Found ${criticalAndSerious.length} critical or serious violations:${summary}`,
            );
        }

        logger.info('✓ No critical or serious accessibility violations');
        logAccessibilityReport(results);
    },
);

Then(
    'the page should have at most {int} accessibility violations',
    async function (this: CustomWorld, maxCount: number) {
        logger.info(
            `Verifying page has at most ${maxCount} accessibility violations`,
        );
        const results = await assertNoViolations(this.page, {
            standards: 'wcag22aa',
        });

        if (results.violations.length > maxCount) {
            throw new Error(
                `Expected at most ${maxCount} violations, but found ${results.violations.length}`,
            );
        }

        logger.info(
            `✓ Violation count within threshold: ${results.violations.length}/${maxCount}`,
        );
        logAccessibilityReport(results);
    },
);

Then(
    'I should see a detailed accessibility report for the current page',
    async function (this: CustomWorld) {
        logger.info('Generating detailed accessibility report');
        const results = await assertNoViolations(this.page, {
            standards: 'wcag22aa',
        });
        logAccessibilityReport(results);
        ensureFrameworkArtifactDirs();
        const reportPath = buildArtifactPath('diagnostics', 'accessibility-wcag-22-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        logger.info(`Detailed report saved to ${reportPath}`);
        this.attach(JSON.stringify(results, null, 2), 'application/json');
    },
);

/**
 * Generic violation count assertion step.
 *
 * Impact levels  : "critical", "serious", "moderate", "minor",
 *                  "critical or serious", "critical, serious, moderate", "any"
 * Operators      : "greater than", "less than", "equal to",
 *                  "at least", "at most", "not equal to"
 *
 * Examples:
 *   Then the page should have "critical or serious" accessibility violations "greater than" 0
 *   Then the page should have "moderate" accessibility violations "less than" 5
 *   Then the page should have "any" accessibility violations "equal to" 0
 *   Then the page should have "critical" accessibility violations "at most" 2
 *   Then the page should have "critical, serious, moderate" accessibility violations "not equal to" 10
 */
Then(
    'the page should have {string} accessibility violations {string} {int}',
    async function (
        this: CustomWorld,
        impactRaw: string,
        operator: string,
        count: number,
    ) {
        logger.info(
            `Generic accessibility assertion: [${impactRaw}] violations ${operator} ${count}`,
        );
        const results = await assertAccessibilityViolationsComparison(
            this.page,
            impactRaw,
            operator,
            count,
            {standards: 'wcag22aa'},
        );
        logAccessibilityReport(results);
    },
);

