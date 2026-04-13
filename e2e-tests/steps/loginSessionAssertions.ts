import {Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {envConfig} from '../config/env.config.ts';
import {AssertionHelpers} from '../helperUtilities/assertionHelpers.ts';
import {appData, appPatterns} from '../utils/AppData.ts';
import {logger} from '../utils/Logger.ts';

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
