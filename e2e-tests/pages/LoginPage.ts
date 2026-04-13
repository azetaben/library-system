import type {Locator, Page} from '@playwright/test';
import {BasePage} from './BasePage.ts';
import {testData} from '../utils/TestData.ts';
import {appData, appPatterns} from '../utils/AppData.ts';
import {logger} from '../utils/Logger.ts';

export class LoginPage extends BasePage {
    private readonly loginHeadingLocator: Locator;
    private readonly usernameLabelLocator: Locator;
    private readonly passwordLabelLocator: Locator;
    private readonly usernameInputLocator: Locator;
    private readonly passwordInputLocator: Locator;
    private readonly showPasswordButtonLocator: Locator;
    private readonly hidePasswordButtonLocator: Locator;
    private readonly submitLoginButtonLocator: Locator;
    private readonly authErrorMessageLocator: Locator;
    private readonly validationErrorMessageLocator: Locator;

    constructor(page: Page) {
        super(page);
        this.loginHeadingLocator = page
            .locator('h2, h1')
            .filter({hasText: appPatterns.loginHeading})
            .last();
        this.usernameLabelLocator = page.locator('label[for="username"]').first();
        this.passwordLabelLocator = page.locator('label[for="password"]').first();
        this.usernameInputLocator = page
            .locator('#username:visible, input[name="username"]:visible')
            .first();
        this.passwordInputLocator = page.locator('#password');
        this.showPasswordButtonLocator = page
            .locator('button[aria-controls="password"]')
            .filter({hasText: appPatterns.showButton})
            .first();
        this.hidePasswordButtonLocator = page
            .locator('button[aria-controls="password"]')
            .filter({hasText: appPatterns.hideButton})
            .first();
        this.submitLoginButtonLocator = page
            .locator(
                `button:has-text("${appData.buttons.loginAlt}"), button:has-text("${appData.buttons.login}"), button[aria-label="Submit login"]`,
            )
            .first();
        this.authErrorMessageLocator = page
            .locator('.auth-error, [role="alert"]')
            .first();
        this.validationErrorMessageLocator = page.locator('[aria-live="assertive"][role="alert"]',);
    }

    header(): Locator {
        return this.loginHeadingLocator;
    }

    usernameLabel(): Locator {
        return this.usernameLabelLocator;
    }

    passwordLabel(): Locator {
        return this.passwordLabelLocator;
    }

    usernameInput(): Locator {
        return this.usernameInputLocator;
    }

    passwordInput(): Locator {
        return this.passwordInputLocator;
    }

    async getPasswordInputValueInput(): Promise<string> {
        await this.passwordInputLocator.waitFor();
        return this.passwordInputLocator.inputValue();
    }

    showPasswordButton(): Locator {
        return this.showPasswordButtonLocator;
    }

    async clickShowPasswordButton() {
        logger.info('Toggling password visibility to show password');
        await this.showPasswordButton().click({force: true});
    }

    loginButton(): Locator {
        return this.submitLoginButtonLocator;
    }

    authErrorMessage(): Locator {
        return this.authErrorMessageLocator;
    }

    validationErrorMessage(): Locator {
        return this.validationErrorMessageLocator;
    }

    async login(username: string, password: string) {
        logger.info(`Submitting login for user: ${username || '<blank>'}`);
        await this.fill(this.usernameInputLocator, username);
        await this.fill(this.passwordInputLocator, password);
        await this.waitAndClick(this.submitLoginButtonLocator);
    }

    async fillUsername(username: string) {
        logger.info(`Filling username: ${username || '<blank>'}`);
        await this.fill(this.usernameInputLocator, username);
    }

    async fillPassword(password: string) {
        logger.info(
            `Filling password: ${password ? '<hidden>' : '<blank>'}`,
        );
        await this.fill(this.passwordInputLocator, password);
    }

    buttonByTitle(buttonTitle: string): Locator {
        switch (buttonTitle.trim().toLowerCase()) {
            case 'show':
                return this.showPasswordButtonLocator;
            case 'hide':
                return this.hidePasswordButtonLocator;
            case 'log in':
            case 'login':
                return this.submitLoginButtonLocator;
            default:
                throw new Error(`Unsupported login button title: ${buttonTitle}`);
        }
    }

    getPasswordInput() {
        return this.passwordInputLocator;
    }

    getErrorMessage() {
        return this.authErrorMessageLocator
            .or(this.validationErrorMessageLocator)
            .first();
    }

    async loginAsAuthorizedAdminUser() {
        logger.info('Logging in as authorized admin user from test data');
        await this.login(testData.validUser.username, testData.validUser.password);
    }

    async clickLoginButton() {
        logger.info('Clicking Log In button');
        await this.waitAndClick(this.submitLoginButtonLocator);
    }
}
