import type {Browser, BrowserContext, BrowserContextOptions, Page,} from '@playwright/test';
import {browserOptions, contextOptions, waitStrategy,} from '../config/browser.config.ts';
import {envConfig} from '../config/env.config.ts';
import {getDefaultContextOptions, launchConfiguredBrowser,} from '../helperUtilities/browserHelpers.ts';
import {logger} from './Logger.ts';

export class BrowserFactory {
    static async launchBrowser(): Promise<Browser> {
        logger.info(`Launching browser via BrowserFactory using ${envConfig.browser}`);
        return launchConfiguredBrowser(envConfig.browser, browserOptions);
    }

    static getContextOptions(): BrowserContextOptions {
        logger.info('Resolving browser context options');
        return {
            ...getDefaultContextOptions(),
            ...contextOptions,
        };
    }

    static async createContext(browser: Browser): Promise<BrowserContext> {
        logger.info('Creating isolated browser context');
        return browser.newContext(this.getContextOptions());
    }

    static async createPage(context: BrowserContext): Promise<Page> {
        logger.info('Creating new page and applying wait strategy');
        const page = await context.newPage();
        this.applyWaitStrategy(page);
        await page.waitForLoadState(waitStrategy.readyState);
        return page;
    }

    static applyWaitStrategy(page: Page): void {
        logger.info('Applying Playwright default timeout strategy');
        page.setDefaultTimeout(waitStrategy.defaultTimeoutMs);
        page.setDefaultNavigationTimeout(waitStrategy.navigationTimeoutMs);
    }
}
