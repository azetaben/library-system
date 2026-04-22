import type {Locator, Page} from '@playwright/test';
import {BasePage} from './base-page.ts';
import {logger} from '../utils/runtime/index.ts';

export const BOOK_FORM_FIELD_ORDER = [
    'Title',
    'Author',
    'Genre',
    'ISBN',
    'Publication Date',
    'Price',
] as const;

export class BookFormPage extends BasePage {
    private readonly labelLocators = new Map<string, Locator>();
    private readonly fieldLocators = new Map<string, Locator>();

    constructor(page: Page) {
        super(page);
    }

    protected registerLabel(name: string, locator: Locator): Locator {
        this.labelLocators.set(this.normalizeName(name), locator);
        return locator;
    }

    protected registerField(name: string, locator: Locator): Locator {
        this.fieldLocators.set(this.normalizeName(name), locator);
        return locator;
    }

    protected getRegisteredLabel(name: string, context: string): Locator {
        const locator = this.labelLocators.get(this.normalizeName(name));
        if (!locator) {
            throw new Error(`Unsupported ${context}: ${name}`);
        }
        return locator;
    }

    protected getRegisteredField(name: string, context: string): Locator {
        const locator = this.fieldLocators.get(this.normalizeName(name));
        if (!locator) {
            throw new Error(`Unsupported ${context}: ${name}`);
        }
        return locator;
    }

    protected async fillRegisteredFields<TValues extends object>(
        values: TValues,
        fieldOrder: string[],
    ): Promise<void> {
        const normalizedValues = values as Record<string, string | undefined>;
        for (const fieldName of fieldOrder) {
            const nextValue = normalizedValues[fieldName] ?? '';
            logger.info(
                `Setting form field "${fieldName}" to ${nextValue || '<blank>'}`,
            );
            await this.setFieldValue(
                this.getRegisteredField(fieldName, 'field'),
                nextValue,
            );
        }
    }

    protected async setFieldValue(
        locator: Locator,
        value: string,
    ): Promise<void> {
        await locator.fill(value);
    }

    private normalizeName(name: string): string {
        return name.trim().toLowerCase();
    }
}
