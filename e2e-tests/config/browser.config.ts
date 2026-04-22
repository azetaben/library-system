import type {BrowserContextOptions, LaunchOptions} from '@playwright/test';
import {envConfig} from './env.config.ts';
import {logger} from '../utils/runtime/index.ts';

export const browserOptions: LaunchOptions = {
    headless: envConfig.headless,
    args: [
        '--start-maximized',
        '--disable-extensions',
        '--disable-popup-blocking',
        '--no-sandbox',
    ],
    slowMo: envConfig.slowMoMs,
};

export const contextOptions: BrowserContextOptions = {
    viewport: null,
    acceptDownloads: envConfig.acceptDownloads,
    ignoreHTTPSErrors: envConfig.ignoreHttpsErrors,
};

export const waitStrategy = {
    defaultTimeoutMs: envConfig.defaultTimeoutMs,
    navigationTimeoutMs: envConfig.navigationTimeoutMs,
    actionTimeoutMs: envConfig.actionTimeoutMs,
    expectTimeoutMs: envConfig.expectTimeoutMs,
    readyState: 'domcontentloaded' as const,
};

logger.info(
    `Browser config initialized: headless=${browserOptions.headless}, slowMo=${browserOptions.slowMo}, readyState=${waitStrategy.readyState}.`,
);
