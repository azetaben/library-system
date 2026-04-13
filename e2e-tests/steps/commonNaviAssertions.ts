import {Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';

Then(
    'I should see the {string} button with the correct title',
    async function (this: CustomWorld, label: string) {
        const startTestingButton = this.pm.getLandingPage().startTestingButton();
        await expect(startTestingButton).toBeVisible();
        await expect(startTestingButton).toContainText(label);
    },
);
