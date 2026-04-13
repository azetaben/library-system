import type {Locator} from '@playwright/test';
import {logger} from '../utils/Logger.ts';

export class VerificationHelpers {
    static async isVisible(locator: Locator): Promise<boolean> {
        const visible = await locator.isVisible().catch(() => false);
        logger.info(`Visibility check result: ${visible}`);
        return visible;
    }

    static async isHidden(locator: Locator): Promise<boolean> {
        const hidden = await locator.isHidden().catch(() => true);
        logger.info(`Hidden check result: ${hidden}`);
        return hidden;
    }

    static async getTextContent(locator: Locator): Promise<string> {
        const text = await this.safeText(locator);
        logger.info(`Resolved text content: ${text}`);
        return text;
    }

    static async textEquals(
        locator: Locator,
        expected: string,
    ): Promise<boolean> {
        const actual = this.normalizeText(await this.safeText(locator));
        const passed = actual === expected.trim();
        logger.info(
            `Text equals check => actual="${actual}" expected="${expected}" passed=${passed}`,
        );
        return passed;
    }

    static async textContains(
        locator: Locator,
        expected: string,
    ): Promise<boolean> {
        const actual = await this.safeText(locator);
        const passed = actual.includes(expected);
        logger.info(
            `Text contains check => actual="${actual}" expected="${expected}" passed=${passed}`,
        );
        return passed;
    }

    static async normalizedTextEquals(
        locator: Locator,
        expected: string,
    ): Promise<boolean> {
        const actual = this.normalizeText(await this.safeText(locator));
        const normalizedExpected = this.normalizeText(expected);
        const passed = actual === normalizedExpected;
        logger.info(
            `Normalized text equals => actual="${actual}" expected="${normalizedExpected}" passed=${passed}`,
        );
        return passed;
    }

    static async textMatches(
        locator: Locator,
        pattern: RegExp,
    ): Promise<boolean> {
        const actual = await this.safeText(locator);
        const passed = pattern.test(actual);
        logger.info(
            `Text matches => actual="${actual}" pattern="${pattern}" passed=${passed}`,
        );
        return passed;
    }

    static async hasValue(locator: Locator, expected: string): Promise<boolean> {
        const actual = await locator.inputValue().catch(() => '');
        const passed = actual.trim() === expected.trim();
        logger.info(
            `Value equals => actual="${actual}" expected="${expected}" passed=${passed}`,
        );
        return passed;
    }

    static async hasAttribute(
        locator: Locator,
        name: string,
        expected: string,
    ): Promise<boolean> {
        const actual = (await locator.getAttribute(name).catch(() => null)) ?? '';
        const passed = actual === expected;
        logger.info(
            `Attribute equals => ${name} actual="${actual}" expected="${expected}" passed=${passed}`,
        );
        return passed;
    }

    static async attributeContains(
        locator: Locator,
        name: string,
        expected: string,
    ): Promise<boolean> {
        const actual = (await locator.getAttribute(name).catch(() => null)) ?? '';
        const passed = actual.includes(expected);
        logger.info(
            `Attribute contains => ${name} actual="${actual}" expected="${expected}" passed=${passed}`,
        );
        return passed;
    }

    static async isEnabled(locator: Locator): Promise<boolean> {
        const enabled = await locator.isEnabled().catch(() => false);
        logger.info(`Enabled check result: ${enabled}`);
        return enabled;
    }

    static async isDisabled(locator: Locator): Promise<boolean> {
        const disabled = await locator.isDisabled().catch(() => false);
        logger.info(`Disabled check result: ${disabled}`);
        return disabled;
    }

    static async isChecked(locator: Locator): Promise<boolean> {
        const checked = await locator.isChecked().catch(() => false);
        logger.info(`Checked check result: ${checked}`);
        return checked;
    }

    static async countEquals(
        locator: Locator,
        expected: number,
    ): Promise<boolean> {
        const actual = await locator.count().catch(() => -1);
        const passed = actual === expected;
        logger.info(
            `Count equals => actual=${actual} expected=${expected} passed=${passed}`,
        );
        return passed;
    }

    static async exists(locator: Locator): Promise<boolean> {
        const count = await locator.count().catch(() => 0);
        const passed = count > 0;
        logger.info(`Exists check result: ${passed}`);
        return passed;
    }

    static async hasClass(
        locator: Locator,
        expectedClass: string,
    ): Promise<boolean> {
        const className =
            (await locator.getAttribute('class').catch(() => null)) ?? '';
        const passed = className.split(/\s+/).includes(expectedClass);
        logger.info(
            `Has class => class="${className}" expected="${expectedClass}" passed=${passed}`,
        );
        return passed;
    }

    static async allTextsContain(
        locator: Locator,
        expected: string,
    ): Promise<boolean> {
        const texts = await locator.allTextContents().catch(() => []);
        const passed =
            texts.length > 0 && texts.every((text) => text.includes(expected));
        logger.info(
            `All texts contain => expected="${expected}" count=${texts.length} passed=${passed}`,
        );
        return passed;
    }

    static async anyTextEquals(
        locator: Locator,
        expected: string,
    ): Promise<boolean> {
        const normalizedExpected = this.normalizeText(expected);
        const texts = await locator.allTextContents().catch(() => []);
        const passed = texts.some(
            (text) => this.normalizeText(text) === normalizedExpected,
        );
        logger.info(
            `Any text equals => expected="${normalizedExpected}" count=${texts.length} passed=${passed}`,
        );
        return passed;
    }

    private static normalizeText(value: string): string {
        return value.replace(/\s+/g, ' ').trim();
    }

    private static async safeText(locator: Locator): Promise<string> {
        return (await locator.textContent().catch(() => '')) ?? '';
    }
}
