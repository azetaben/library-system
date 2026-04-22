import {DataTable, Given, When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {appPatterns} from '../utils/data/index.ts';
import {logger} from '../utils/runtime/index.ts';
import {LoginDataFactory} from '../utils/data/index.ts';
import {TableValidator} from '../utils/assertions/index.ts';
import {InteractionWaitHelpers} from '../utils/assertions/index.ts';
import type {LoginCredentials} from '../utils/data/index.ts';
import {validateKeyboardKey} from '../utils/runtime/index.ts';

Given(
    'I login as a authorised admin user with the following credentials',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Logging in with provided authorized admin credentials');
        const creds = TableValidator.extractRow<LoginCredentials>(
          dataTable, ['username', 'password'], 'Login credentials'
        );

        await this.pm.getLoginPage().login(creds.username.trim(), creds.password.trim());
    },
);

When(
    'I login as an authorized admin user credentials:',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Logging in with authorized admin credentials table');
        const creds = TableValidator.extractRow<LoginCredentials>(dataTable, ['username', 'password'], 'Login credentials'
        );

        await this.pm.getLoginPage().login(creds.username.trim(), creds.password.trim());
    },
);

When(
    'I enter username {string} and password {string}',
    async function (this: CustomWorld, username: string, password: string) {
        logger.info('Entering username and password into the login form');
        const loginPage = this.pm.getLoginPage();

        // Use proper wait strategies for form filling
        await InteractionWaitHelpers.waitUntilFillable(loginPage.usernameInput());
        await loginPage.fill(loginPage.usernameInput(), username);

        await InteractionWaitHelpers.waitUntilFillable(loginPage.passwordInput());
        await loginPage.fill(loginPage.passwordInput(), password);
    },
);

When(
    'I enter username {string}',
    async function (this: CustomWorld, username: string) {
        logger.info(`Entering username "${username}"`);
        const loginPage = this.pm.getLoginPage();

        await InteractionWaitHelpers.waitUntilFillable(loginPage.usernameInput());
        await loginPage.fillUsername(username);
    },
);

When(
    'I enter password {string}',
    async function (this: CustomWorld, password: string) {
        logger.info('Entering password value');
        const loginPage = this.pm.getLoginPage();

        await InteractionWaitHelpers.waitUntilFillable(loginPage.passwordInput());
        await loginPage.fillPassword(password);
    },
);

When(
    'I login with username {string} and password {string}',
    async function (this: CustomWorld, username: string, password: string) {
        logger.info(`Submitting login flow for username "${username}"`);
        const loginPage = this.pm.getLoginPage();
        const booksCatalogPage = this.pm.getBooksCatalogPage();

        const loginFormVisible = await loginPage
            .usernameInput()
            .isVisible()
            .catch(() => false);

        if (!loginFormVisible) {
            const alreadyOnCatalog = await booksCatalogPage
                .booksCatalogHeading()
                .isVisible()
                .catch(() => false);

            if (alreadyOnCatalog) {
                logger.info('Already on books catalog; skipping duplicate login');
                return;
            }

            logger.info('Login form is not visible; navigating from landing page');
            await this.pm.getLandingPage().clickStartTesting();
        }

        await loginPage.fillUsername(username);
        await loginPage.fillPassword(password);

        // Use proper wait strategy for button click
        await InteractionWaitHelpers.waitUntilClickable(loginPage.loginButton());
        await loginPage.waitAndClick(loginPage.loginButton());
    },
);

When(
    'I login with negative login example {string}',
    async function (this: CustomWorld, exampleKey: string) {
        const example = LoginDataFactory.negativeExampleByKey(exampleKey);
        logger.info(
            `Submitting negative login example "${example.key}": ${example.description}`,
        );
        this.activeNegativeLoginExample = example.key;
        await this.pm.getLoginPage().login(example.username, example.password);
    },
);

When(
    'I press the {string}',
    async function (this: CustomWorld, keyName: string) {
        // Validate key name before pressing
        validateKeyboardKey(keyName);

        logger.info(`Pressing keyboard key "${keyName}"`);
        await this.page.keyboard.press(keyName);

        // Add small delay after key press for form updates
        await this.page.waitForTimeout(100);
    },
);

When('I click on the login button', async function (this: CustomWorld) {
    logger.info('Clicking the login button');
    const loginPage = this.pm.getLoginPage();

    await InteractionWaitHelpers.waitUntilClickable(loginPage.loginButton());
    await loginPage.clickLoginButton();
});

When(
    'I click {string} button',
    async function (this: CustomWorld, _buttonLabel: string) {
        logger.info('Clicking login button via generic button step');
        const loginPage = this.pm.getLoginPage();

        await InteractionWaitHelpers.waitUntilClickable(loginPage.loginButton());
        await loginPage.waitAndClick(loginPage.loginButton());
    },
);

When('I tap on the Show button', async function (this: CustomWorld) {
    logger.info('Tapping the Show button for password visibility');
    const loginPage = this.pm.getLoginPage();

    await InteractionWaitHelpers.waitUntilClickable(loginPage.showPasswordButton());
    await loginPage.clickShowPasswordButton();
});

When(
    'I tap on the {string} button to toggle password visibility',
    async function (this: CustomWorld, buttonLabel: string) {
        logger.info(`Toggling password visibility with button "${buttonLabel}"`);
        if (!appPatterns.showButton.test(buttonLabel.trim())) {
            throw new Error(
                `Unsupported password visibility toggle button: ${buttonLabel}`,
            );
        }

        const loginPage = this.pm.getLoginPage();
        await InteractionWaitHelpers.waitUntilClickable(loginPage.showPasswordButton());
        await loginPage.clickShowPasswordButton();
    },
);
