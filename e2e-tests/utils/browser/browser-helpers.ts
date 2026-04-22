import type {Browser, BrowserContextOptions, LaunchOptions,} from '@playwright/test';
import {chromium, firefox, webkit,} from '@playwright/test';
import {envConfig} from '../../config/env.config.ts';
import {logger} from '../runtime/logger.ts';

export const launchConfiguredBrowser = async (
    browserName: string,
    launchOptions: LaunchOptions,
): Promise<Browser> => {
    logger.info(`Launching configured browser: ${browserName}`);
    switch (browserName.toLowerCase()) {
        case 'firefox':
            return firefox.launch(launchOptions);
        case 'webkit':
            return webkit.launch(launchOptions);
        case 'chromium':
        default:
            return chromium.launch(launchOptions);
    }
};

export const getDefaultContextOptions = (): BrowserContextOptions => ({
    ...(logger.info('Resolving default browser context options'), {}),
    viewport: null,
    acceptDownloads: envConfig.acceptDownloads,
    ignoreHTTPSErrors: envConfig.ignoreHttpsErrors,
});
