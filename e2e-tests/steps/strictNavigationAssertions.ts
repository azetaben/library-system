import {DataTable, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {envConfig} from '../config/env.config.ts';
import {AssertionHelpers} from '../helperUtilities/assertionHelpers.ts';

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function exactControlLocator(world: CustomWorld, label: string) {
    const exactText = new RegExp(`^\\s*${escapeRegex(label)}\\s*$`, 'i');
    return world.page
        .locator('button, a, [role="button"]')
        .filter({hasText: exactText})
        .first();
}

export async function assertExactControlClickable(
    world: CustomWorld,
    label: string,
): Promise<void> {
    const locator = exactControlLocator(world, label);
    await expect(locator).toBeVisible();
    await expect(locator).toBeEnabled();
    await expect(locator).toContainText(new RegExp(`^\\s*${escapeRegex(label)}\\s*$`, 'i'));
}

Then(
    'I should see the exact text control {string} as clickable',
    async function (this: CustomWorld, label: string) {
        await assertExactControlClickable(this, label);
    },
);

Then(
    'the page URL should be {string}',
    async function (this: CustomWorld, expectedPathOrUrl: string) {
        const expectedUrl = /^https?:\/\//i.test(expectedPathOrUrl)
            ? expectedPathOrUrl
            : `${envConfig.baseUrl}${expectedPathOrUrl === '/' ? '' : expectedPathOrUrl}`;
        await AssertionHelpers.expectUrl(this.page, expectedUrl);
    },
);

Then(
    'the page URL should include path {string}',
    async function (this: CustomWorld, expectedPath: string) {
        await expect(this.page).toHaveURL(
            new RegExp(`${escapeRegex(expectedPath)}(?:/|$)`, 'i'),
        );
    },
);

Then(
    'I can see page URL include path {string} instead of {string}',
    async function (
        this: CustomWorld,
        actualPath: string,
        unexpectedPath: string,
    ) {
        await expect(this.page).toHaveURL(
            new RegExp(`${escapeRegex(actualPath)}(?:/|$)`, 'i'),
        );
        await expect(this.page).not.toHaveURL(
            new RegExp(`${escapeRegex(unexpectedPath)}(?:/|$)`, 'i'),
        );
    },
);

Then(
    'the primary page header should exactly be {string}',
    async function (this: CustomWorld, expectedHeader: string) {
        const exactHeader = new RegExp(`^\\s*${escapeRegex(expectedHeader)}\\s*$`, 'i');
        await expect(
            this.page
                .locator('h1, h2, h3, [role="heading"]')
                .filter({hasText: exactHeader})
                .first(),
        ).toBeVisible();
    },
);

Then(
    'the page title should exactly be {string}',
    async function (this: CustomWorld, expectedTitle: string) {
        await AssertionHelpers.expectTitle(this.page, expectedTitle);
    },
);

Then(
    'the button and link below are not present and visible',
    async function (this: CustomWorld, dataTable: DataTable) {
        for (const row of dataTable.hashes()) {
            const label = (row.label ?? row.Label ?? '').trim();
            if (!label) {
                throw new Error('Expected each row to include a "label" column.');
            }

            const exactText = new RegExp(`^\\s*${escapeRegex(label)}\\s*$`, 'i');
            const controlLocator = this.page
                .locator('button, a, [role="button"]')
                .filter({hasText: exactText});
            const textLocator = this.page
                .locator('h1, h2, h3, p, div, span, a, button, [role="button"]')
                .filter({hasText: exactText});

            await expect(controlLocator).toHaveCount(0);
            await expect(textLocator).toHaveCount(0);
        }
    },
);
