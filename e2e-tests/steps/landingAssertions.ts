import {DataTable, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/Logger.ts';
import {envConfig} from '../config/env.config.ts';
import {AssertionHelpers} from '../helperUtilities/assertionHelpers.ts';
import {appData} from '../utils/AppData.ts';

Then(
    'the landing page url, title, and booksCatalogHeading should be correct',
    async function (this: CustomWorld) {
        const landingPage = this.pm.getLandingPage();
        await AssertionHelpers.expectUrl(this.page, envConfig.baseUrl);
        await AssertionHelpers.expectTitle(this.page, appData.titles.app);
        await AssertionHelpers.expectVisible(landingPage.startTestingButton());
        await AssertionHelpers.expectVisible(landingPage.introductionHeading());
    },
);

Then(
    'all elements on the landing page should be visible',
    async function (this: CustomWorld) {
        const landingPage = this.pm.getLandingPage();
        await AssertionHelpers.expectVisible(landingPage.startTestingButton());
        await AssertionHelpers.expectVisible(landingPage.introductionHeading());
        await AssertionHelpers.expectVisible(landingPage.businessRequirementHeading());
        await AssertionHelpers.expectVisible(landingPage.taskHeading());
        await AssertionHelpers.expectVisible(landingPage.importantGuidelinesHeading());
        const heroImage = landingPage.mainImage();
        const heroImageCount = await heroImage.count();

        if (heroImageCount > 0) {
            await AssertionHelpers.expectVisible(heroImage.first());
        }
    },
);

Then(
    'the page should be responsive on the following screen sizes:',
    async function (this: CustomWorld, dataTable: DataTable) {
        const landingPage = this.pm.getLandingPage();
        const sizes = dataTable.hashes().map((row) => {
            const width = Number(row.width);
            const height = Number(row.height);

            if (!Number.isFinite(width) || !Number.isFinite(height)) {
                throw new Error(
                    `Invalid responsive viewport row. width="${row.width}" height="${row.height}"`,
                );
            }

            return {width, height};
        });

        for (const size of sizes) {
            logger.info(
                `Verification: Checking landing page responsiveness at ${size.width}x${size.height}...`,
            );

            await this.page.setViewportSize(size);
            await this.page.reload({waitUntil: 'domcontentloaded'});

            await expect(landingPage.startTestingButton()).toBeVisible();
            await expect(landingPage.introductionHeading()).toBeVisible();
            await expect(landingPage.businessRequirementHeading()).toBeVisible();
            await expect(landingPage.taskHeading()).toBeVisible();
            await expect(landingPage.importantGuidelinesHeading()).toBeVisible();

            const overflow = await this.page.evaluate(() => {
                const doc = document.documentElement;
                return {
                    scrollWidth: doc.scrollWidth,
                    clientWidth: doc.clientWidth,
                };
            });

            expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
        }

        await this.page.setViewportSize({
            width: envConfig.viewportWidth,
            height: envConfig.viewportHeight,
        });
    },
);
