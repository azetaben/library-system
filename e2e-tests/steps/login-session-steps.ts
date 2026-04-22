import {DataTable, Given, Then, When} from '@cucumber/cucumber';
import fs from 'node:fs';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {testData} from '../utils/data/index.ts';
import {resolveProjectPath} from '../utils/runtime/index.ts';
import {envConfig} from '../config/env.config.ts';
import {AssertionHelpers} from '../utils/assertions/index.ts';
import {appData, appPatterns} from '../utils/data/index.ts';
import {logger} from '../utils/runtime/index.ts';
import {routePattern, navigateLandingWhenResponsive} from '../utils/runtime/index.ts';

const cookiesFile = resolveProjectPath(
    'e2e-tests',
    'reports',
    'diagnostics',
    'cookies.json',
);


async function ensureAuthenticatedCookies(world: CustomWorld): Promise<void> {
    if (fs.existsSync(cookiesFile)) {
        logger.info(`Using existing cookies file at ${cookiesFile}`);
        return;
    }

    logger.info('No cookies file found, creating authenticated cookies');
    await world.pm
        .getLandingPage()
        .navigateWhenResponsive('/', world.pm.getLandingPage().startTestingButton());
    await world.pm.getLandingPage().clickStartTesting();
    await AssertionHelpers.expectUrl(world.page, routePattern(envConfig.routes.login));
    await AssertionHelpers.expectVisible(world.pm.getLoginPage().usernameInput());
    await AssertionHelpers.expectVisible(world.pm.getLoginPage().passwordInput());
    await world.pm
        .getLoginPage()
        .login(testData.validUser.username, testData.validUser.password);
    await AssertionHelpers.expectUrl(
        world.page,
        world.pm.getBooksCatalogPage().getCatalogUrlPattern(),
    );
    await AssertionHelpers.expectVisible(world.pm.getBooksCatalogPage().bookList());

    const freshCookies = await world.page.context().cookies();
    fs.writeFileSync(cookiesFile, JSON.stringify(freshCookies, null, 2));
    logger.info(`Authenticated cookies saved to ${cookiesFile}`);
}

Given(
    'I restore the session to the landing page',
    async function (this: CustomWorld) {
        logger.info('Restoring session to landing page');
        await ensureAuthenticatedCookies(this);
        const cookies = JSON.parse(fs.readFileSync(cookiesFile, 'utf-8'));
        await this.page.context().addCookies(cookies);
        await navigateLandingWhenResponsive(this, '/');
    },
);

Given(
    'I restore the session to the login page',
    async function (this: CustomWorld) {
        logger.info('Restoring session to login page');
        await ensureAuthenticatedCookies(this);
        const cookies = JSON.parse(fs.readFileSync(cookiesFile, 'utf-8'));
        await this.page.context().addCookies(cookies);
        await this.page.goto(`${envConfig.baseUrl}${envConfig.routes.login}`);
    },
);

Given(
    'I restore the session to the books catalog page',
    async function (this: CustomWorld) {
        logger.info('Restoring session to books catalog page');
        await ensureAuthenticatedCookies(this);
        const cookies = JSON.parse(fs.readFileSync(cookiesFile, 'utf-8'));
        await this.page.context().addCookies(cookies);
        await this.pm.getBooksCatalogPage().navigateDirectly();
    },
);

When(
    'I try to open the protected books catalog directly',
    async function (this: CustomWorld) {
        logger.info('Attempting direct navigation to protected books catalog');
        await this.pm.getBooksCatalogPage().navigateDirectly();
    },
);

Then(
    'I should be logged in and see {string} on the page',
    async function (this: CustomWorld, expectedText: string) {
        logger.info(`Verifying restored authenticated session contains ${expectedText}`);
        await this.page.goto(envConfig.baseUrl);
        await AssertionHelpers.expectUrl(
            this.page,
            this.pm.getBooksCatalogPage().getCatalogUrlPattern(),
        );
        await AssertionHelpers.expectText(
            this.pm.getTopNaviPage().userProfileWelcomeHeading(),
            appPatterns.welcomeUser,
        );

        if (expectedText === appData.auth.welcomeUser) {
            await expect(this.pm.getBooksCatalogPage().bookList()).toBeVisible();
            return;
        }

        await expect(this.pm.getBooksCatalogPage().getBodyLocator()).toContainText(
            expectedText,
        );
    },
);

Then(
    'I should see an authentication error message {string}',
    async function (this: CustomWorld, expectedMessage: string) {
        logger.info(`Verifying authentication error message "${expectedMessage}"`);
        await expect(this.pm.getLoginPage().authErrorMessage()).toContainText(expectedMessage);
    },
);

Then('the password should be visible', async function (this: CustomWorld) {
    logger.info('Verifying password field is visible as plain text');
    await expect(this.pm.getLoginPage().passwordInput()).toHaveAttribute(
        'type',
        'text',
    );
});

Then(
    'the password {string} should be visible',
    async function (this: CustomWorld, expectedPassword: string) {
        logger.info('Verifying password field value is visible');
        const loginPage = this.pm.getLoginPage();
        await expect(loginPage.passwordInput()).toHaveAttribute('type', 'text');
        expect(await loginPage.getPasswordInputValueInput()).toBe(expectedPassword);
    },
);

Then(
    'I should see buttons with the correct titles',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Verifying buttons with the correct titles');
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

Then('I can verify the login form', async function (this: CustomWorld) {
    logger.info('Verifying login form summary state');
    const loginPage = this.pm.getLoginPage();
    await expect(loginPage.header()).toBeVisible();
    await expect(loginPage.header()).toContainText(appData.headings.login);
    await expect(loginPage.usernameInput()).toBeVisible();
    await expect(loginPage.passwordInput()).toBeVisible();
    await expect(loginPage.loginButton()).toBeVisible();
    await expect(loginPage.loginButton()).toBeEnabled();
});

Then(
    'I should see the login form with the following input fields and buttons',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Verifying login form input fields and buttons from table');
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
                    await expect(loginPage.usernameLabel()).toHaveText(
                        appData.labels.username,
                    );
                    break;
                case 'Password':
                    await expect(loginPage.passwordInput()).toBeVisible();
                    await expect(loginPage.passwordLabel()).toBeVisible();
                    await expect(loginPage.passwordLabel()).toHaveText(
                        appData.labels.password,
                    );
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
                    await expect(loginPage.loginButton()).toContainText(
                        appData.buttons.login,
                    );
                    break;
                default:
                    throw new Error(`Unsupported login form item: ${item}`);
            }
        }
    },
);

Then('the password should be hidden', async function (this: CustomWorld) {
    logger.info('Verifying password field is hidden');
    await expect(this.pm.getLoginPage().passwordInput()).toHaveAttribute(
        'type',
        'password',
    );
});

Then(
    'I should see "<errors message>"',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Verifying authentication error messages from data table');
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
            await expect(this.pm.getBasePage().getBodyLocator()).toContainText(expectedMessage);
        }
    },
);

Then(
    'the Welcome, Admin! message should not be visible',
    async function (this: CustomWorld) {
        const topNaviPage = this.pm.getTopNaviPage();
        await expect(topNaviPage.userProfileWelcomeHeading()).not.toBeVisible();
    },
);

Then(
    'the Log Out button should not be visible',
    async function (this: CustomWorld) {
        const topNaviPage = this.pm.getTopNaviPage();
        await expect(topNaviPage.logoutButton()).not.toBeVisible();
    },
);

Then(
    'I should see an error message {string}',
    async function (this: CustomWorld, errorMessage: string) {
        const loginPage = this.pm.getLoginPage();
        await expect(loginPage.getErrorMessage()).toContainText(errorMessage);
    },
);

