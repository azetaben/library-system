import type {Locator, Page} from '@playwright/test';
import {BasePage} from './base-page.ts';
import {envConfig} from '../config/env.config.ts';
import {LoginPage} from './login-page.ts';
import {appData, appPatterns} from '../utils/data/index.ts';
import {logger} from '../utils/runtime/index.ts';

export class LandingPage extends BasePage {
    private readonly heroImage: Locator;
    private readonly startTestingBtn: Locator;
    private readonly introductionHeadingLocator: Locator;
    private readonly businessRequirementHeadingLocator: Locator;
    private readonly taskHeadingLocator: Locator;
    private readonly importantGuidelinesHeadingLocator: Locator;

    constructor(page: Page) {
        super(page);

        this.startTestingBtn = page
            .locator("button[type='submit'], button, a")
            .filter({hasText: appPatterns.startTestingButton})
            .first();
        this.heroImage = page.locator('img[alt="Book Inventory"], img').first();
        this.introductionHeadingLocator = page
            .locator('h2')
            .filter({hasText: new RegExp(`^${appData.headings.introduction}$`, 'i')})
            .first();
        this.businessRequirementHeadingLocator = page
            .locator('h2')
            .filter({
                hasText: new RegExp(`^${appData.headings.businessRequirement}$`, 'i'),
            })
            .first();
        this.taskHeadingLocator = page
            .locator('h2')
            .filter({hasText: new RegExp(`^${appData.headings.task}$`, 'i')})
            .first();
        this.importantGuidelinesHeadingLocator = page
            .locator('h2')
            .filter({
                hasText: new RegExp(`^${appData.headings.importantGuidelines}$`, 'i'),
            })
            .first();
    }


    startTestingButton(): Locator {
        return this.startTestingBtn;
    }

    mainImage(): Locator {
        return this.heroImage;
    }

    introductionHeading(): Locator {
        return this.introductionHeadingLocator;
    }

    businessRequirementHeading(): Locator {
        return this.businessRequirementHeadingLocator;
    }

    taskHeading(): Locator {
        return this.taskHeadingLocator;
    }

    importantGuidelinesHeading(): Locator {
        return this.importantGuidelinesHeadingLocator;
    }

    async navigate() {
        logger.info('Opening landing page');
        await this.navigateTo(envConfig.baseUrl);
    }

    async clickStartTesting() {
        logger.info('Clicking Start Testing on landing page');
        await this.startTestingBtn.waitFor({state: 'visible'});
        await this.startTestingBtn.click({force: true});
        return new LoginPage(this.page);
    }
}
