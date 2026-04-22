import {DataTable, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/runtime/index.ts';
import {envConfig} from '../config/env.config.ts';
import {AssertionHelpers} from '../utils/assertions/index.ts';
import {appData, appPatterns} from '../utils/data/index.ts';

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
    'I can see {string} button color {string} and styling is correct',
    async function (this: CustomWorld, buttonName: string, expectedColor: string) {
        logger.info(
            `Verifying "${buttonName}" button color "${expectedColor}" and styling`,
        );
        const normalizedButtonName = buttonName.trim();
        const normalizedColor = expectedColor.trim().toLowerCase();
        const button = appPatterns.startTestingButton.test(normalizedButtonName)
            ? this.pm.getLandingPage().startTestingButton()
            : this.pm.getLoginPage().buttonByTitle(normalizedButtonName);

        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
        await expect(button).toContainText(buttonName);

        const className = (await button.getAttribute('class')) ?? '';
        expect(className).toContain('py-2');
        expect(className).toContain('text-white');
        expect(className).toContain('font-semibold');
        expect(className).toContain('rounded');

        if (normalizedColor === 'purple') {
            expect(className).toContain('bg-purple-600');
            expect(className).toContain('hover:bg-yellow-600');
        } else {
            throw new Error(
                `Unsupported ${buttonName} button color assertion: ${expectedColor}`,
            );
        }

        if (appPatterns.startTestingButton.test(normalizedButtonName)) {
            expect(className).toContain('w-1/2');
            return;
        }

        if (/^log\s*in$/i.test(normalizedButtonName)) {
            expect(className).toContain('w-full');
            await expect(button).toHaveAttribute('type', 'submit');
            await expect(button).toHaveAttribute('aria-label', 'Submit login');
            return;
        }

        throw new Error(`Unsupported button styling assertion target: ${buttonName}`);
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
