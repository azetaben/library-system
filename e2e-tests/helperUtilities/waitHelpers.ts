import type {Locator, Page} from '@playwright/test';
import {envConfig} from '../config/env.config.ts';
import {logger} from '../utils/Logger.ts';

export class WaitHelpers {
    static readonly defaultTimeout = envConfig.defaultTimeoutMs;

    static async visible(
        locator: Locator | undefined | null,
        timeout = WaitHelpers.defaultTimeout,
    ): Promise<void> {
        WaitHelpers.ensureLocator(locator, 'visible');
        logger.info('Waiting for element to be visible');
        await locator.waitFor({state: 'visible', timeout});
    }

    static async hidden(
        locator: Locator | undefined | null,
        timeout = WaitHelpers.defaultTimeout,
    ): Promise<void> {
        WaitHelpers.ensureLocator(locator, 'hidden');
        logger.info('Waiting for element to be hidden');
        await locator.waitFor({state: 'hidden', timeout});
    }

    static async attached(
        locator: Locator | undefined | null,
        timeout = WaitHelpers.defaultTimeout,
    ): Promise<void> {
        WaitHelpers.ensureLocator(locator, 'attached');
        logger.info('Waiting for element to be attached');
        await locator.waitFor({state: 'attached', timeout});
    }

    static async clickable(
        locator: Locator | undefined | null,
        timeout = WaitHelpers.defaultTimeout,
    ): Promise<void> {
        WaitHelpers.ensureLocator(locator, 'clickable');
        await WaitHelpers.visible(locator, timeout);
        await WaitHelpers.enabled(locator, timeout);
    }

    static async fillable(
        locator: Locator | undefined | null,
        timeout = WaitHelpers.defaultTimeout,
    ): Promise<void> {
        WaitHelpers.ensureLocator(locator, 'fillable');
        await WaitHelpers.visible(locator, timeout);
        await WaitHelpers.enabled(locator, timeout);
        await WaitHelpers.editable(locator, timeout);
    }

    static async enabled(
        locator: Locator | undefined | null,
        timeout = WaitHelpers.defaultTimeout,
    ): Promise<void> {
        WaitHelpers.ensureLocator(locator, 'enabled');
        logger.info('Waiting for element to be enabled');
        await WaitHelpers.attached(locator, timeout);

        const elementHandle = await locator.elementHandle();
        if (!elementHandle) {
            throw new Error(
                '[WaitHelpers.enabled] Unable to resolve element handle.',
            );
        }

        await locator.page().waitForFunction(
            (element) => {
                const htmlElement = element as HTMLElement & { disabled?: boolean };
                if (htmlElement.disabled !== undefined) {
                    return !htmlElement.disabled;
                }
                return element.getAttribute('aria-disabled') !== 'true';
            },
            elementHandle,
            {timeout},
        );
    }

    static async editable(
        locator: Locator | undefined | null,
        timeout = WaitHelpers.defaultTimeout,
    ): Promise<void> {
        WaitHelpers.ensureLocator(locator, 'editable');
        logger.info('Waiting for element to be editable');
        await WaitHelpers.attached(locator, timeout);

        const elementHandle = await locator.elementHandle();
        if (!elementHandle) {
            throw new Error(
                '[WaitHelpers.editable] Unable to resolve element handle.',
            );
        }

        await locator.page().waitForFunction(
            (element) => {
                const htmlElement = element as HTMLElement & {
                    disabled?: boolean;
                    readOnly?: boolean;
                };
                const enabled =
                    htmlElement.disabled !== undefined
                        ? !htmlElement.disabled
                        : element.getAttribute('aria-disabled') !== 'true';
                const readOnly =
                    htmlElement.readOnly !== undefined
                        ? htmlElement.readOnly
                        : element.getAttribute('aria-readonly') === 'true';
                return enabled && !readOnly;
            },
            elementHandle,
            {timeout},
        );
    }

    static async pageReady(
        page: Page,
        timeout = envConfig.navigationTimeoutMs,
    ): Promise<void> {
        logger.info(`Waiting for page DOM content to load within ${timeout}ms`);
        await page.waitForLoadState('domcontentloaded', {timeout});
    }

    static async networkIdle(
        page: Page,
        timeout = envConfig.navigationTimeoutMs,
    ): Promise<void> {
        logger.info(`Waiting for network idle within ${timeout}ms`);
        await page.waitForLoadState('networkidle', {timeout});
    }

    static async sleep(page: Page, ms: number): Promise<void> {
        logger.warn(`Sleeping for ${ms} milliseconds`);
        await page.waitForTimeout(ms);
    }

    private static ensureLocator(
        locator: Locator | undefined | null,
        methodName: string,
    ): asserts locator is Locator {
        if (!locator) {
            throw new Error(
                `[WaitHelpers.${methodName}] Locator is undefined or null.`,
            );
        }
    }
}
