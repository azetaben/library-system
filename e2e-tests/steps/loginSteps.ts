import {DataTable, Given, When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {appPatterns} from '../utils/AppData.ts';
import {logger} from '../utils/Logger.ts';
import {LoginDataFactory} from '../utils/loginDataFactory.ts';
Given(
    'I login as a authorised admin user with the following credentials',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Logging in with provided authorized admin credentials');
        const row = dataTable.hashes()[0];
        if (!row) {
            throw new Error('Expected a credentials row but none was provided.');
        }

        await this.pm
            .getLoginPage()
            .login((row.username ?? '').trim(), (row.password ?? '').trim());
    },
);

When(
    'I login as an authorized admin user credentials:',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Logging in with authorized admin credentials table');
        const row = dataTable.hashes()[0];
        if (!row) {
            throw new Error('Expected a credentials row but none was provided.');
        }

        await this.pm
            .getLoginPage()
            .login((row.username ?? '').trim(), (row.password ?? '').trim());
    },
);

When(
    'I enter username {string} and password {string}',
    async function (this: CustomWorld, username: string, password: string) {
        logger.info('Entering username and password into the login form');
        const loginPage = this.pm.getLoginPage();
        await loginPage.fill(loginPage.usernameInput(), username);
        await loginPage.fill(loginPage.passwordInput(), password);
    },
);

When(
    'I enter username {string}',
    async function (this: CustomWorld, username: string) {
        logger.info(`Entering username "${username}"`);
        await this.pm.getLoginPage().fillUsername(username);
    },
);

When(
    'I enter password {string}',
    async function (this: CustomWorld, password: string) {
        logger.info('Entering password value');
        await this.pm.getLoginPage().fillPassword(password);
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
        await loginPage.waitAndClick(loginPage.loginButton());
    },
);

When(
    'I login with negative login example {string}',
    async function (
        this: CustomWorld & { activeNegativeLoginExample?: string },
        exampleKey: string,
    ) {
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
        logger.info(`Pressing keyboard key "${keyName}"`);
        await this.page.keyboard.press(keyName);
    },
);

When('I click on the login button', async function (this: CustomWorld) {
    logger.info('Clicking the login button');
    await this.pm.getLoginPage().clickLoginButton();
});

When(
    'I click {string} button',
    async function (this: CustomWorld, _buttonLabel: string) {
        logger.info('Clicking login button via generic button step');
        await this.pm
            .getLoginPage()
            .waitAndClick(this.pm.getLoginPage().loginButton());
    },
);

When('I tap on the Show button', async function (this: CustomWorld) {
    logger.info('Tapping the Show button for password visibility');
    await this.pm.getLoginPage().clickShowPasswordButton();
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

        await this.pm.getLoginPage().clickShowPasswordButton();
    },
);
