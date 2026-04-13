import {DataTable, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {AssertionHelpers} from '../helperUtilities/assertionHelpers.ts';
import {VerificationHelpers} from '../helperUtilities/verificationHelpers.ts';
import {appData} from '../utils/AppData.ts';
import {routePattern} from '../utils/stepSupport.ts';
import {envConfig} from '../config/env.config.ts';


Then('I should be on the login page', async function (this: CustomWorld) {
    const loginPage = this.pm.getLoginPage();
    await AssertionHelpers.expectVisible(loginPage.loginButton());
    await AssertionHelpers.expectUrl(this.page, routePattern(envConfig.routes.login));
});

Then(
    'the login page url, title, and booksCatalogHeading should be correct',
    async function (this: CustomWorld) {
        const loginPage = this.pm.getLoginPage();
        await AssertionHelpers.expectUrl(this.page, routePattern(envConfig.routes.login));
        await AssertionHelpers.expectTitle(this.page, appData.titles.login);
        await AssertionHelpers.expectText(loginPage.header(), appData.headings.login);
    },
);

Then(
    'all elements on the login page should be visible',
    async function (this: CustomWorld) {
        const loginPage = this.pm.getLoginPage();
        await AssertionHelpers.expectVisible(loginPage.header());
        await AssertionHelpers.expectVisible(loginPage.usernameInput());
        await AssertionHelpers.expectVisible(loginPage.passwordInput());
        await AssertionHelpers.expectVisible(loginPage.loginButton());
    },
);

Then(
    'I should see the login form with the following input fields and buttons',
    async function (this: CustomWorld, dataTable: DataTable) {
        const loginPage = this.pm.getLoginPage();

        for (const row of dataTable.raw()) {
            const [item] = row;
            if (!item) {
                continue;
            }

            switch (item.trim()) {
                case 'Username':
                    await expect(loginPage.usernameInput()).toBeVisible();
                    await expect(loginPage.usernameLabel()).toBeVisible();
                    await expect(loginPage.usernameLabel()).toHaveText(appData.labels.username);
                    break;
                case 'Password':
                    await expect(loginPage.passwordInput()).toBeVisible();
                    await expect(loginPage.passwordLabel()).toBeVisible();
                    await expect(loginPage.passwordLabel()).toHaveText(appData.labels.password);
                    break;
                case 'Show':
                    await expect(loginPage.showPasswordButton()).toBeVisible();
                    await expect(loginPage.showPasswordButton()).toBeEnabled();
                    await expect(loginPage.showPasswordButton()).toContainText(
                        appData.buttons.show,
                    );
                    break;
                case 'Log In':
                    await expect(loginPage.loginButton()).toBeVisible();
                    await expect(loginPage.loginButton()).toBeEnabled();
                    await expect(loginPage.loginButton()).toContainText(appData.buttons.login);
                    break;
                default:
                    throw new Error(`Unsupported login form item: ${item}`);
            }
        }
    },
);

Then(
    'I should see buttons with the correct titles',
    async function (this: CustomWorld, dataTable: DataTable) {
        const loginPage = this.pm.getLoginPage();

        for (const row of dataTable.raw()) {
            const [buttonTitle] = row;
            if (!buttonTitle) {
                continue;
            }

            const button = loginPage.buttonByTitle(buttonTitle);
            await expect(button).toBeVisible();
            await expect(button).toBeEnabled();
            await expect(button).toContainText(buttonTitle);
        }
    },
);

Then(
    '{string}, {string} and {string} should be present, visible and enabled',
    async function (
        this: CustomWorld,
        firstButton: string,
        secondButton: string,
        thirdButton: string,
    ) {
        const loginPage = this.pm.getLoginPage();

        for (const buttonTitle of [firstButton, secondButton, thirdButton]) {
            const button = loginPage.buttonByTitle(buttonTitle);
            await expect(button).toBeVisible();
            await expect(button).toBeEnabled();
        }
    },
);

Then('the password should be visible', async function (this: CustomWorld) {
    await expect(this.pm.getLoginPage().passwordInput()).toHaveAttribute('type', 'text');
});

Then(
    'the password {string} should be visible',
    async function (this: CustomWorld, expectedPassword: string) {
        const loginPage = this.pm.getLoginPage();
        await expect(loginPage.passwordInput()).toHaveAttribute('type', 'text');
        expect(await loginPage.getPasswordInputValueInput()).toBe(expectedPassword);
    },
);

Then('the password should be hidden', async function (this: CustomWorld) {
    await expect(this.pm.getLoginPage().passwordInput()).toHaveAttribute(
        'type',
        'password',
    );
});

Then(
    'I should see an authentication error message {string}',
    async function (this: CustomWorld, expectedMessage: string) {
        await expect(this.pm.getLoginPage().authErrorMessage()).toContainText(expectedMessage);
    },
);

Then(
    'I should see "<errors message>"',
    async function (this: CustomWorld, dataTable: DataTable) {
        const expectedMessages = dataTable
            .hashes()
            .map((row) => (row?.['errors message'] ?? row?.['error message'] ?? '').trim())
            .filter(Boolean);

        if (expectedMessages.length === 0) {
            throw new Error(
                'Expected a data table with an "errors message" or "error message" column and a value.',
            );
        }

        const errorMessage = this.pm.getLoginPage().getErrorMessage();
        const hasDedicatedErrorContainer = (await errorMessage.count().catch(() => 0)) > 0;

        if (hasDedicatedErrorContainer) {
            await expect(errorMessage).toBeVisible();
            for (const expectedMessage of expectedMessages) {
                await expect(errorMessage).toContainText(expectedMessage);
            }
            return;
        }

        for (const expectedMessage of expectedMessages) {
            await expect(this.page.locator('body')).toContainText(expectedMessage);
        }
    },
);

Then(
    'I should see a validation error message ',
    async function (this: CustomWorld, expectedMessage: string) {
        await expect(this.pm.getLoginPage().validationErrorMessage().first()).toBeVisible();
        await expect(this.pm.getLoginPage().validationErrorMessage().first()).toContainText([
            expectedMessage,
        ]);
    },
);

Then(
    'I should see a validation error message {string}',
    async function (this: CustomWorld, expectedMessage: string) {
        await expect(this.pm.getLoginPage().validationErrorMessage().first()).toBeVisible();
        await expect(this.pm.getLoginPage().validationErrorMessage().first()).toContainText([
            expectedMessage,
        ]);
    },
);

Then('I can verify the login form', async function (this: CustomWorld) {
    const loginPage = this.pm.getLoginPage();
    expect(await VerificationHelpers.isVisible(loginPage.header())).toBeTruthy();
    expect(
        await VerificationHelpers.normalizedTextEquals(loginPage.header(), appData.headings.login),
    ).toBeTruthy();
    expect(await VerificationHelpers.isVisible(loginPage.usernameInput())).toBeTruthy();
    expect(await VerificationHelpers.isVisible(loginPage.passwordInput())).toBeTruthy();
    expect(await VerificationHelpers.isEnabled(loginPage.loginButton())).toBeTruthy();
});
