import {Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {AssertionHelpers} from '../helperUtilities/assertionHelpers.ts';

Then(
    'all public elements on the top navigation should be visible',
    async function (this: CustomWorld) {
        const topNaviPage = this.pm.getTopNaviPage();
        await AssertionHelpers.expectVisible(topNaviPage.logoutButton());
        await AssertionHelpers.expectVisible(topNaviPage.userProfileWelcomeHeading());
    },
);

Then(
    'all authorized elements on the top navigation should be visible',
    async function (this: CustomWorld) {
        const topNaviPage = this.pm.getTopNaviPage();
        await topNaviPage.logoutButton().waitFor({state: 'visible'});
        await AssertionHelpers.expectVisible(topNaviPage.logoutButton());
        await AssertionHelpers.expectVisible(topNaviPage.userProfileWelcomeHeading());
    },
);

Then(
    'I should see {string} button on the top right page',
    async function (this: CustomWorld, buttonLabel: string) {
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
        await expect(this.pm.getTopNaviPage().userProfileWelcomeHeading()).toHaveCount(0);
    },
);

Then(
    'I should see the {string} page with the correct heading',
    async function (this: CustomWorld, expectedHeader: string) {
        await expect(this.pm.getBooksCatalogPage().booksCatalogHeading()).toContainText(
            expectedHeader,
        );
    },
);
