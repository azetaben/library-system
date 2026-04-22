import type {Locator, Page} from '@playwright/test';
import {BOOK_FORM_FIELD_ORDER, BookFormPage} from './book-form-page.ts';
import {logger} from '../utils/runtime/index.ts';
import {appData} from '../utils/data/index.ts';

export interface EditBookFormData {
    Title: string;
    Author: string;
    Genre: string;
    ISBN: string;
    'Publication Date': string;
    Price: string;
}

export class EditBookPage extends BookFormPage {
    readonly pageHeader: Locator;
    readonly saveChangesButton: Locator;
    readonly titleLabel: Locator;
    readonly authorLabel: Locator;
    readonly genreLabel: Locator;
    readonly isbnLabel: Locator;
    readonly publicationDateLabel: Locator;
    readonly priceLabel: Locator;
    readonly titleInput: Locator;
    readonly authorInput: Locator;
    readonly genreInput: Locator;
    readonly isbnInput: Locator;
    readonly publicationDateInput: Locator;
    readonly priceInput: Locator;
    readonly errorAlert: Locator;
    private readonly cancelButtonLocator: Locator;

    constructor(page: Page) {
        super(page);

        this.pageHeader = page
            .locator('h2, h1')
            .filter({hasText: /edit book/i})
            .first();
        this.saveChangesButton = page.getByRole('button', {
            name: appData.buttons.saveChanges,
        });

        this.titleLabel = this.registerLabel(
            'Title',
            page.locator('label').filter({hasText: 'Title'}),
        );
        this.authorLabel = this.registerLabel(
            'Author',
            page.locator('label').filter({hasText: 'Author'}),
        );
        this.genreLabel = this.registerLabel(
            'Genre',
            page.locator('label').filter({hasText: 'Genre'}),
        );
        this.isbnLabel = this.registerLabel(
            'ISBN',
            page.locator('label').filter({hasText: 'ISBN'}),
        );
        this.publicationDateLabel = this.registerLabel(
            'Publication Date',
            page.locator('label').filter({hasText: 'Publication Date'}),
        );
        this.priceLabel = this.registerLabel(
            'Price',
            page.locator('label').filter({hasText: 'Price'}),
        );

        this.titleInput = this.registerField(
            'Title',
            page.locator('#title, input[name="title"]').first(),
        );
        this.authorInput = this.registerField(
            'Author',
            page.locator('#author, input[name="author"]').first(),
        );
        this.genreInput = this.registerField(
            'Genre',
            page.locator('#genre, input[name="genre"]').first(),
        );
        this.isbnInput = this.registerField(
            'ISBN',
            page.locator('input[name="isbn"]').first(),
        );
        this.publicationDateInput = this.registerField(
            'Publication Date',
            page.locator('input[name="publicationDate"]').first(),
        );
        this.priceInput = this.registerField(
            'Price',
            page.locator('input[name="price"]').first(),
        );

        this.errorAlert = page
            .locator("[role='alert'], .error-message, .text-red-500")
            .first();
        this.cancelButtonLocator = page
            .locator('button, a')
            .filter({hasText: /^cancel$/i})
            .first();
    }

    header(): Locator {
        return this.pageHeader;
    }

    titleInputField(): Locator {
        return this.titleInput;
    }

    authorInputField(): Locator {
        return this.authorInput;
    }

    genreInputField(): Locator {
        return this.genreInput;
    }

    updateBookButton(): Locator {
        return this.saveChangesButton;
    }

    cancelButton(): Locator {
        return this.cancelButtonLocator;
    }

    async updateBook(title: string, author: string, genre: string) {
        logger.info(`Updating book to title "${title || '<blank>'}"`);
        if (title) await this.fill(this.titleInput, title);
        if (author) await this.fill(this.authorInput, author);
        if (genre) await this.fill(this.genreInput, genre);
        await this.waitAndClick(this.saveChangesButton);
    }

    async updateBookForm(data: Record<string, string>) {
        logger.info('Submitting Edit Book form from generic record payload');
        await this.updateBook(
            data.Title ?? data.title ?? '',
            data.Author ?? data.author ?? '',
            data.Genre ?? data.genre ?? '',
        );
    }

    async clickCancel() {
        logger.info('Clicking Cancel on edit-book page');
        await this.waitAndClick(this.cancelButtonLocator);
    }

    async fillAndSubmitForm(data: EditBookFormData): Promise<void> {
        logger.info(`Updating book with title: ${data.Title}`);
        await this.fillRegisteredFields(data, [...BOOK_FORM_FIELD_ORDER]);
        await this.waitAndClick(this.saveChangesButton);
    }

    async clearField(fieldName: string): Promise<void> {
        logger.info(`Clearing edit-book field "${fieldName}"`);
        const field = this.inputByName(fieldName);
        await field.fill('');
    }

    async clickButton(buttonName: string): Promise<void> {
        if (buttonName !== appData.buttons.saveChanges) {
            throw new Error(`Unsupported button: ${buttonName}`);
        }
        logger.info(`Clicking ${appData.buttons.saveChanges} on edit-book page`);
        await this.waitAndClick(this.saveChangesButton);
    }

    labelByName(labelName: string): Locator {
        return this.getRegisteredLabel(labelName, 'label');
    }

    inputByName(fieldName: string): Locator {
        return this.getRegisteredField(fieldName, 'field');
    }

    buttonByExactLabel(buttonName: string): Locator {
        return this.getControlByExactLabel(buttonName);
    }

    protected override async setFieldValue(
        locator: Locator,
        value: string,
    ): Promise<void> {
        const inputType = await locator.getAttribute('type').catch(() => null);

        if (inputType === 'number' && /[^\d.-]/.test(value)) {
            await locator.evaluate((element, nextValue) => {
                const input = element as HTMLInputElement;
                input.value = nextValue;
                input.dispatchEvent(new Event('input', {bubbles: true}));
                input.dispatchEvent(new Event('change', {bubbles: true}));
            }, value);
            return;
        }

        await locator.fill(value);
    }
}
