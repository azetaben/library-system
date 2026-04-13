import type {APIResponse, Locator, Page} from '@playwright/test';
import {expect} from '@playwright/test';
import {logger} from '../utils/Logger.ts';

export class AssertionHelpers {
    static async expectVisible(
        locator: Locator,
        message?: string,
    ): Promise<void> {
        logger.info('Verifying element is visible');
        await expect(locator, message).toBeVisible();
    }

    static async expectHidden(locator: Locator, message?: string): Promise<void> {
        logger.info('Verifying element is hidden');
        await expect(locator, message).toBeHidden();
    }

    static async expectText(
        locator: Locator,
        expected: string | RegExp | Array<string | RegExp>,
        message?: string,
    ): Promise<void> {
        logger.info(`Verifying element text matches ${expected}`);
        await expect(locator, message).toHaveText(expected);
    }

    static async expectContainsText(
        locator: Locator,
        expected: string | RegExp,
        message?: string,
    ): Promise<void> {
        logger.info(`Verifying element contains text ${expected}`);
        await expect(locator, message).toContainText(expected);
    }

    static async expectValue(
        locator: Locator,
        expected: string | RegExp,
        message?: string,
    ): Promise<void> {
        logger.info(`Verifying input value matches ${expected}`);
        await expect(locator, message).toHaveValue(expected);
    }

    static async expectUrl(
        page: Page,
        expected: string | RegExp,
        message?: string,
    ): Promise<void> {
        logger.info(`Verifying page URL matches ${expected}`);
        await expect(page, message).toHaveURL(expected);
    }

    static async expectTitle(
        page: Page,
        expected: string | RegExp,
        message?: string,
    ): Promise<void> {
        logger.info(`Verifying page title matches ${expected}`);
        await expect(page, message).toHaveTitle(expected);
    }

    static async expectResponseOk(
        response: APIResponse,
        message?: string,
    ): Promise<void> {
        logger.info('Verifying API response is OK');
        await expect(response, message).toBeOK();
    }

    static verifyTrue(
        value: boolean,
        message = 'Expected value to be true',
    ): void {
        if (!value) {
            throw new Error(message);
        }
    }

    static verifyFalse(
        value: boolean,
        message = 'Expected value to be false',
    ): void {
        if (value) {
            throw new Error(message);
        }
    }
}
