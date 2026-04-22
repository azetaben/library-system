import type {Locator, Page} from '@playwright/test';
import {BasePage} from './base-page.ts';
import {appPatterns} from '../utils/data/index.ts';
import {logger} from '../utils/runtime/index.ts';

export class TopNaviPage extends BasePage {
    private readonly userProfileWelcomeHeadingLocator: Locator;
    private readonly logoutButtonLocator: Locator;

    constructor(page: Page) {
        super(page);

        this.userProfileWelcomeHeadingLocator = page
            .getByRole('heading', {name: appPatterns.welcomeUser})
            .or(
                page
                    .locator('h1, h2, h3, p, div, span')
                    .filter({hasText: appPatterns.welcomeUser}),
            )
            .first();
        this.logoutButtonLocator = page
            .getByRole('button', {name: appPatterns.logoutButton})
            .or(page.getByRole('link', {name: appPatterns.logoutButton}))
            .or(
                page
                    .locator('button, a, [role="button"]')
                    .filter({hasText: appPatterns.logoutButton}),
            )
            .first();
    }

    userProfileWelcomeHeading(): Locator {
        return this.userProfileWelcomeHeadingLocator;
    }

    logoutButton(): Locator {
        return this.logoutButtonLocator;
    }

    async clickLogout() {
        logger.info('Clicking Log Out from top navigation');
        await this.waitAndClick(this.logoutButtonLocator);
    }
}
