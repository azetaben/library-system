import type {Locator, Page} from '@playwright/test';
import {envConfig} from '../config/env.config.ts';
import {logger} from './Logger.ts';

export class WaitUtil {
    private static readonly DEFAULT_TIMEOUT = envConfig.defaultTimeoutMs;

    public static async waitForVisible(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForVisible');
        logger.info(`Waiting for element to be visible`);
        await locator.waitFor({state: 'visible', timeout});
    }

    public static async waitForHidden(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForHidden');
        logger.info(`Waiting for element to be hidden`);
        await locator.waitFor({state: 'hidden', timeout});
    }

    public static async waitForAttached(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForAttached');
        logger.info(`Waiting for element to be attached`);
        await locator.waitFor({state: 'attached', timeout});
    }

    public static async waitForDetached(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForDetached');
        logger.info(`Waiting for element to be detached`);
        await locator.waitFor({state: 'detached', timeout});
    }

    public static async waitForEnabled(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForEnabled');
        logger.info(`Waiting for element to be enabled`);
        await WaitUtil.waitForAttached(locator, timeout);

        const elementHandle = await locator.elementHandle();
        if (!elementHandle) {
            throw new Error(
                '[WaitUtil.waitForEnabled] Unable to resolve element handle for locator.',
            );
        }

        await locator.page().waitForFunction(
            (element) => {
                if (!element) return false;
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

    public static async waitForEditable(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForEditable');
        logger.info(`Waiting for element to be editable`);
        await WaitUtil.waitForAttached(locator, timeout);

        const elementHandle = await locator.elementHandle();
        if (!elementHandle) {
            throw new Error(
                '[WaitUtil.waitForEditable] Unable to resolve element handle for locator.',
            );
        }

        await locator.page().waitForFunction(
            (element) => {
                if (!element) return false;

                const htmlElement = element as HTMLElement & {
                    disabled?: boolean;
                    readOnly?: boolean;
                };

                const isEnabled =
                    htmlElement.disabled !== undefined
                        ? !htmlElement.disabled
                        : element.getAttribute('aria-disabled') !== 'true';

                const isReadOnly =
                    htmlElement.readOnly !== undefined
                        ? htmlElement.readOnly
                        : element.getAttribute('aria-readonly') === 'true';

                return isEnabled && !isReadOnly;
            },
            elementHandle,
            {timeout},
        );
    }

    public static async waitForStable(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForStable');
        logger.info(`Waiting for element to be stable`);
        await WaitUtil.waitForAttached(locator, timeout);

        const elementHandle = await locator.elementHandle();
        if (!elementHandle) {
            throw new Error(
                '[WaitUtil.waitForStable] Unable to resolve element handle for locator.',
            );
        }

        await locator.page().waitForFunction(
            (element) => {
                if (!element) return false;

                return new Promise((resolve) => {
                    const rect1 = element.getBoundingClientRect();
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            const rect2 = element.getBoundingClientRect();
                            resolve(
                                rect1.x === rect2.x &&
                                rect1.y === rect2.y &&
                                rect1.width === rect2.width &&
                                rect1.height === rect2.height,
                            );
                        });
                    });
                });
            },
            elementHandle,
            {timeout},
        );
    }

    public static async waitForReceivesEvents(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForReceivesEvents');
        logger.info(`Waiting for element to receive events`);
        await WaitUtil.waitForAttached(locator, timeout);

        const elementHandle = await locator.elementHandle();
        if (!elementHandle) {
            throw new Error(
                '[WaitUtil.waitForReceivesEvents] Unable to resolve element handle for locator.',
            );
        }

        await locator.page().waitForFunction(
            (element) => {
                if (!element) return false;

                const rect = element.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return false;

                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const hitElement = document.elementFromPoint(centerX, centerY);
                if (!hitElement) return false;

                return element === hitElement || element.contains(hitElement);
            },
            elementHandle,
            {timeout},
        );
    }

    public static async waitForClickableAction(
        locator: Locator | undefined | null,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForClickableAction');
        logger.info(`Waiting for element to be clickable`);
        await WaitUtil.waitForVisible(locator, WaitUtil.DEFAULT_TIMEOUT);
        await WaitUtil.waitForStable(locator, WaitUtil.DEFAULT_TIMEOUT);
        await WaitUtil.waitForReceivesEvents(locator, WaitUtil.DEFAULT_TIMEOUT);
        await WaitUtil.waitForEnabled(locator, WaitUtil.DEFAULT_TIMEOUT);
    }

    public static async waitForHoverAction(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForHoverAction');
        logger.info(`Waiting for element to be hoverable`);
        await WaitUtil.waitForVisible(locator, timeout);
        await WaitUtil.waitForStable(locator, timeout);
        await WaitUtil.waitForReceivesEvents(locator, timeout);
    }

    public static async waitForScreenshotAction(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForScreenshotAction');
        logger.info(`Waiting for element to be screenshot ready`);
        await WaitUtil.waitForVisible(locator, timeout);
        await WaitUtil.waitForStable(locator, timeout);
    }

    public static async waitForFillAction(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForFillAction');
        logger.info(`Waiting for element to be fillable`);
        await WaitUtil.waitForVisible(locator, timeout);
        await WaitUtil.waitForEnabled(locator, timeout);
        await WaitUtil.waitForEditable(locator, timeout);
    }

    public static async waitForSelectOptionAction(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForSelectOptionAction');
        logger.info(`Waiting for element to be selectable`);
        await WaitUtil.waitForVisible(locator, timeout);
        await WaitUtil.waitForEnabled(locator, timeout);
    }

    public static async waitForSelectTextAction(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForSelectTextAction');
        logger.info(`Waiting for element text to be selectable`);
        await WaitUtil.waitForVisible(locator, timeout);
    }

    public static async waitForScrollIntoViewAction(
        locator: Locator | undefined | null,
        timeout: number = WaitUtil.DEFAULT_TIMEOUT,
    ): Promise<void> {
        WaitUtil.ensureLocator(locator, 'waitForScrollIntoViewAction');
        logger.info(`Waiting for element to be scrollable`);
        await WaitUtil.waitForStable(locator, timeout);
    }

    public static async sleep(page: Page, ms: number): Promise<void> {
        logger.warn(`Explicitly sleeping for ${ms} milliseconds.`);
        await page.waitForTimeout(ms);
    }

    private static ensureLocator(
        locator: Locator | undefined | null,
        methodName: string,
    ): asserts locator is Locator {
        if (!locator) {
            throw new Error(
                `[WaitUtil.${methodName}] Locator is undefined or null. ` +
                `Check the page object or step definition that passed this locator.`,
            );
        }
    }
}
