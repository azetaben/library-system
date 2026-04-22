import {DataTable, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {envConfig} from '../config/env.config.ts';
import {AssertionHelpers} from '../utils/assertions/index.ts';
import {logger} from '../utils/runtime/index.ts';
import {escapeRegex, normalizeNamedPage, routePattern} from '../utils/runtime/index.ts';

function exactLabelPattern(label: string): RegExp {
    return new RegExp(`^\\s*${escapeRegex(label)}\\s*$`, 'i');
}

export function exactControlLocator(world: CustomWorld, label: string) {
    const exactText = exactLabelPattern(label);
    return world.pm.getBasePage().getControlByExactLabel(label, exactText);
}

export async function assertExactControlClickable(
    world: CustomWorld,
    label: string,
): Promise<void> {
    logger.info(`Verifying exact text control "${label}" is clickable`);
    const exactText = exactLabelPattern(label);
    const locator = exactControlLocator(world, label);
    await expect(locator).toBeVisible();
    await expect(locator).toBeEnabled();
    await expect(locator).toContainText(exactText);
}

Then(
    'the exact control {string} should be clickable',
    async function (this: CustomWorld, label: string) {
        await assertExactControlClickable(this, label);
    },
);

function expectedPageUrlPattern(pageName: string): string | RegExp {
    switch (normalizeNamedPage(pageName)) {
        case 'landing':
            return envConfig.baseUrl;
        case 'login':
            return routePattern(envConfig.routes.login);
        case 'books':
            return routePattern(envConfig.routes.books);
        case 'addBook':
            return routePattern(envConfig.routes.addBook);
        case 'editBook':
            return routePattern(envConfig.routes.editBook);
        default:
            throw new Error(
                `Unsupported page for hidden top navigation assertion: ${pageName}`,
            );
    }
}

Then(
    'the page URL should be {string}',
    async function (this: CustomWorld, expectedPathOrUrl: string) {
        logger.info(`Verifying exact page URL "${expectedPathOrUrl}"`);
        const expectedUrl = /^https?:\/\//i.test(expectedPathOrUrl)
            ? expectedPathOrUrl
            : `${envConfig.baseUrl}${expectedPathOrUrl === '/' ? '' : expectedPathOrUrl}`;
        await AssertionHelpers.expectUrl(this.page, expectedUrl);
    },
);

Then(
    'the page URL should include path {string}',
    async function (this: CustomWorld, expectedPath: string) {
        logger.info(`Verifying page URL includes path "${expectedPath}"`);
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
        logger.info(
            `Verifying page URL includes "${actualPath}" instead of "${unexpectedPath}"`,
        );
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
        logger.info(`Verifying exact primary page header "${expectedHeader}"`);
        const exactHeader = new RegExp(`^\\s*${escapeRegex(expectedHeader)}\\s*$`, 'i');
        await expect(
            this.pm.getBasePage().getHeadingByPattern(exactHeader),
        ).toBeVisible();
    },
);

Then(
    'the page title should exactly be {string}',
    async function (this: CustomWorld, expectedTitle: string) {
        logger.info(`Verifying exact page title "${expectedTitle}"`);
        await AssertionHelpers.expectTitle(this.page, expectedTitle);
    },
);

Then(
    'the button and link below are not present and visible',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Verifying specified buttons and links are absent');
        for (const row of dataTable.hashes()) {
            const label = (row.label ?? row.Label ?? '').trim();
            if (!label) {
                throw new Error('Expected each row to include a "label" column.');
            }

            const exactText = new RegExp(`^\\s*${escapeRegex(label)}\\s*$`, 'i');
            const basePage = this.pm.getBasePage();
            const controlLocator = basePage.getControlsByPattern(exactText);
            const textLocator = basePage.getHeadingTextAndControlsByPattern(exactText);

            await expect(controlLocator).toHaveCount(0);
            await expect(textLocator).toHaveCount(0);
        }
    },
);

Then(
    'all public elements on the top navigation should be visible',
    async function (this: CustomWorld) {
        logger.info('Verifying public top navigation elements are visible');
        const topNaviPage = this.pm.getTopNaviPage();
        await AssertionHelpers.expectVisible(topNaviPage.logoutButton());
        await AssertionHelpers.expectVisible(topNaviPage.userProfileWelcomeHeading());
    },
);

Then(
    'all authorized elements on the top navigation should be visible',
    async function (this: CustomWorld) {
        logger.info('Verifying authorized top navigation elements are visible');
        const topNaviPage = this.pm.getTopNaviPage();
        await topNaviPage.logoutButton().waitFor({state: 'visible'});
        await AssertionHelpers.expectVisible(topNaviPage.logoutButton());
        await AssertionHelpers.expectVisible(topNaviPage.userProfileWelcomeHeading());
    },
);

Then(
    'I should see {string} button on the top right page',
    async function (this: CustomWorld, buttonLabel: string) {
        logger.info(`Verifying top navigation button "${buttonLabel}"`);
        if (!/^log\s*out$/i.test(buttonLabel.trim())) {
            throw new Error(`Unsupported top navigation button assertion: ${buttonLabel}`);
        }

        await AssertionHelpers.expectVisible(this.pm.getTopNaviPage().logoutButton());
        await expect(this.pm.getTopNaviPage().logoutButton()).toContainText(buttonLabel);
    },
);

Then(
    'the welcome message should not be visible',
    async function (this: CustomWorld) {
        logger.info('Verifying top navigation welcome message is not visible');
        await expect(this.pm.getTopNaviPage().userProfileWelcomeHeading()).toHaveCount(0);
    },
);

Then(
    'the {string} link and {string} button is not visible on the {string} page',
    async function (
        this: CustomWorld,
        expectedWelcomeText: string,
        buttonLabel: string,
        pageName: string,
    ) {
        logger.info(
            `Verifying welcome text "${expectedWelcomeText}" and button "${buttonLabel}" are not visible on page "${pageName}"`,
        );

        await AssertionHelpers.expectUrl(this.page, expectedPageUrlPattern(pageName));

        const topNaviPage = this.pm.getTopNaviPage();
        await expect(topNaviPage.userProfileWelcomeHeading()).toHaveCount(0);

        if (!/^log\s*out$/i.test(buttonLabel.trim())) {
            throw new Error(
                `Unsupported top navigation button hidden assertion: ${buttonLabel}`,
            );
        }

        await expect(topNaviPage.logoutButton()).toHaveCount(0);
    },
);

Then(
    'I should see the {string} page with the correct heading',
    async function (this: CustomWorld, expectedHeader: string) {
        logger.info(`Verifying books page heading "${expectedHeader}"`);
        await expect(this.pm.getBooksCatalogPage().booksCatalogHeading()).toContainText(
            expectedHeader,
        );
    },
);

