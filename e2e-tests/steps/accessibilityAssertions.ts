import {DataTable, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import {CustomWorld} from '../support/world.ts';
import {buildArtifactPath, ensureFrameworkArtifactDirs} from '../helperUtilities/reportHelpers.ts';
import {logger} from '../utils/Logger.ts';

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
