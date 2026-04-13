import {DataTable, Given, When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {appPatterns} from '../utils/AppData.ts';
Given(
    'I login as a authorised admin user with the following credentials',
    async function (this: CustomWorld, dataTable: DataTable) {
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
        const loginPage = this.pm.getLoginPage();
        await loginPage.fill(loginPage.usernameInput(), username);
        await loginPage.fill(loginPage.passwordInput(), password);
    },
);

When(
    'I enter username {string}',
    async function (this: CustomWorld, username: string) {
        await this.pm.getLoginPage().fillUsername(username);
    },
);

When(
    'I enter password {string}',
    async function (this: CustomWorld, password: string) {
        await this.pm.getLoginPage().fillPassword(password);
    },
);

When(
    'I login with username {string} and password {string}',
    async function (this: CustomWorld, username: string, password: string) {
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
                return;
            }

            await this.pm.getLandingPage().clickStartTesting();
        }

        await loginPage.fillUsername(username);
        await loginPage.fillPassword(password);
        await loginPage.waitAndClick(loginPage.loginButton());
    },
);


When(
    'I press the {string}',
    async function (this: CustomWorld, keyName: string) {
        await this.page.keyboard.press(keyName);
    },
);

When('I click on the login button', async function (this: CustomWorld) {
    await this.pm.getLoginPage().clickLoginButton();
});

When(
    'I click {string} button',
    async function (this: CustomWorld, _buttonLabel: string) {
        await this.pm
            .getLoginPage()
            .waitAndClick(this.pm.getLoginPage().loginButton());
    },
);

When('I tap on the Show button', async function (this: CustomWorld) {
    await this.pm.getLoginPage().clickShowPasswordButton();
});

When(
    'I tap on the {string} button to toggle password visibility',
    async function (this: CustomWorld, buttonLabel: string) {
        if (!appPatterns.showButton.test(buttonLabel.trim())) {
            throw new Error(
                `Unsupported password visibility toggle button: ${buttonLabel}`,
            );
        }

        await this.pm.getLoginPage().clickShowPasswordButton();
    },
);
