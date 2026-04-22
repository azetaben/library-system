import type {Locator, Page} from '@playwright/test';
import {BOOK_FORM_FIELD_ORDER, BookFormPage} from './book-form-page.ts';
import {appData} from '../utils/data/index.ts';
import {logger} from '../utils/runtime/index.ts';
import {envConfig} from '../config/env.config.ts';

export interface AddBookData {
    Title: string;
    Author: string;
    Genre: string;
    ISBN: string;
    'Publication Date': string;
    Price: string;
}

export class AddBookPage extends BookFormPage {
    readonly titleLabel: Locator;
    readonly authorLabel: Locator;
    readonly genreLabel: Locator;
    readonly isbnLabel: Locator;
    readonly publicationDateLabel: Locator;
    readonly priceLabel: Locator;
    readonly titleInputField: Locator;
    readonly authorInputField: Locator;
    readonly genreSelect: Locator;
    readonly isbnInputField: Locator;
    readonly publicationDateInputField: Locator;
    readonly priceInputField: Locator;

    private readonly pageHeader: Locator;
    private readonly submitBookButtonLocator: Locator;
    private readonly errorAlertBlockLocator: Locator;
    private readonly titleRequiredError: Locator;
    private readonly authorRequiredError: Locator;
    private readonly genreRequiredError: Locator;
    private readonly isbnRequiredError: Locator;
    private readonly publicationDateRequiredError: Locator;
    private readonly priceRequiredError: Locator;

    constructor(page: Page) {
        super(page);

        this.pageHeader = page.locator('#add-book-heading');

        this.titleLabel = this.registerLabel('Title', page.locator('label[for="title"]'));
        this.authorLabel = this.registerLabel('Author', page.locator('label[for="author"]'));
        this.genreLabel = this.registerLabel('Genre', page.locator('label[for="genre"]'));
        this.isbnLabel = this.registerLabel('ISBN', page.locator('label[for="isbn"]'));
        this.publicationDateLabel = this.registerLabel(
            'Publication Date',
            page.locator('label[for="publicationDate"]'),
        );
        this.priceLabel = this.registerLabel('Price', page.locator('label[for="price"]'));

        this.titleInputField = this.registerField(
            'Title',
            page.locator('#title, input[name="title"]').first(),
        );
        this.authorInputField = this.registerField(
            'Author',
            page.locator('#author, input[name="author"]').first(),
        );
        this.genreSelect = this.registerField(
            'Genre',
            page.locator('#genre, select[name="genre"], input[name="genre"]').first(),
        );
        this.isbnInputField = this.registerField(
            'ISBN',
            page.locator('#isbn, input[name="isbn"]').first(),
        );
        this.publicationDateInputField = this.registerField(
            'Publication Date',
            page.locator('#publicationDate, input[name="publicationDate"]').first(),
        );
        this.priceInputField = this.registerField(
            'Price',
            page.locator('#price, input[name="price"]').first(),
        );

        this.submitBookButtonLocator = page
            .locator(
                "button[aria-label='Submit Add New Book Form'], button[type='submit'], button",
            )
            .filter({hasText: /^(add book|submit|save)$/i})
            .first();
        this.errorAlertBlockLocator = page.locator("div[role='alert']");

        this.titleRequiredError = page
            .getByLabel(appData.validation.addBookFormLabel)
            .getByText(appData.validation.requiredMessages.title, {exact: true});
        this.authorRequiredError = page
            .getByLabel(appData.validation.addBookFormLabel)
            .getByText(appData.validation.requiredMessages.author, {exact: true});
        this.genreRequiredError = page
            .getByLabel(appData.validation.addBookFormLabel)
            .getByText(appData.validation.requiredMessages.genre, {exact: true});
        this.isbnRequiredError = page
            .getByLabel(appData.validation.addBookFormLabel)
            .getByText(appData.validation.requiredMessages.isbn, {exact: true});
        this.publicationDateRequiredError = page
            .getByLabel(appData.validation.addBookFormLabel)
            .getByText(appData.validation.requiredMessages.publicationDate, {
                exact: true,
            });
        this.priceRequiredError = page
            .getByLabel(appData.validation.addBookFormLabel)
            .getByText(appData.validation.requiredMessages.price, {exact: true});
    }

    header(): Locator {
        return this.pageHeader;
    }

    submitBookButton(): Locator {
        return this.submitBookButtonLocator;
    }

    errorAlertBlock(): Locator {
        return this.errorAlertBlockLocator;
    }

    async addBook(title: string, author: string, genre: string) {
        logger.info(`Adding book with title "${title || '<blank>'}"`);
        if (title) await this.fill(this.titleInputField, title);
        if (author) await this.fill(this.authorInputField, author);
        if (genre) await this.fillOrSelect(this.genreSelect, genre);
        await this.waitAndClick(this.submitBookButtonLocator);
    }

    async submitBookForm(data: Record<string, string>) {
        logger.info('Submitting Add Book form from generic record payload');
        await this.fillAndSubmitForm({
            Title: data.Title ?? data.title ?? '',
            Author: data.Author ?? data.author ?? '',
            Genre: data.Genre ?? data.genre ?? '',
            ISBN: data.ISBN ?? data.isbn ?? '',
            'Publication Date': data['Publication Date'] ?? data.publicationDate ?? '',
            Price: data.Price ?? data.price ?? '',
        });
    }

    public async open(): Promise<void> {
        logger.info('Opening Add Book page');
        await this.navigateTo(envConfig.routes.addBook);
    }

    public async clickAddBook(): Promise<void> {
        logger.info('Click Add Book button');
        await this.waitAndClick(this.submitBookButtonLocator);
    }

    labelByText(label: string): Locator {
        return this.getRegisteredLabel(label, 'add-book label');
    }

    async fillForm(data: AddBookData): Promise<void> {
        logger.info(`Filling Add Book form for title: ${data.Title || '<blank>'}`);
        await this.fillRegisteredFields(data, [...BOOK_FORM_FIELD_ORDER]);
    }

    async fillAndSubmitForm(data: AddBookData): Promise<void> {
        logger.info(
            `Submitting Add Book form for title: ${data.Title || '<blank>'}`,
        );
        await this.fillForm(data);
        await this.waitAndClick(this.submitBookButtonLocator);
    }

    fieldByName(fieldName: string): Locator {
        return this.getRegisteredField(fieldName, 'add-book field');
    }

    requiredErrorByField(fieldName: string): Locator {
        switch (fieldName.trim().toLowerCase()) {
            case 'title':
                return this.titleRequiredError;
            case 'author':
                return this.authorRequiredError;
            case 'genre':
                return this.genreRequiredError;
            case 'isbn':
                return this.isbnRequiredError;
            case 'publication date':
                return this.publicationDateRequiredError;
            case 'price':
                return this.priceRequiredError;
            default:
                throw new Error(`Unsupported required-error field: ${fieldName}`);
        }
    }

    protected override async setFieldValue(
        locator: Locator,
        value: string,
    ): Promise<void> {
        const tagName = await locator.evaluate((element) =>
            element.tagName.toLowerCase(),
        );
        if (tagName === 'select') {
            if (!value) {
                await locator.selectOption({value: ''}).catch(async () => {
                    await locator.selectOption({index: 0}).catch(() => undefined);
                });
                return;
            }

            await this.fillOrSelect(locator, value);
            return;
        }

        await locator.fill(value);
    }

    private async fillOrSelect(locator: Locator, value: string): Promise<void> {
        const tagName = await locator.evaluate((element) =>
            element.tagName.toLowerCase(),
        );
        if (tagName === 'select') {
            const normalizedTarget = value.trim().replace(/\s+/g, ' ').toLowerCase();
            const options = await locator.locator('option').evaluateAll((elements) =>
                elements.map((element) => ({
                    value: (element as HTMLOptionElement).value,
                    label: element.textContent?.trim() ?? '',
                })),
            );
            const matchingOption = options.find((option) => {
                const normalizedLabel = option.label
                    .trim()
                    .replace(/\s+/g, ' ')
                    .toLowerCase();
                const normalizedValue = option.value
                    .trim()
                    .replace(/\s+/g, ' ')
                    .toLowerCase();
                return (
                    normalizedLabel === normalizedTarget ||
                    normalizedValue === normalizedTarget
                );
            });

            if (matchingOption) {
                logger.info(`Selecting dropdown value: ${matchingOption.label || value}`);
                await locator.selectOption({value: matchingOption.value});
                return;
            }

            try {
                await locator.selectOption({label: value});
            } catch (error: any) {
                if (
                    error.message.includes(
                        'Target page, context or browser has been closed',
                    )
                ) {
                    throw new Error(
                        `The page was closed unexpectedly while trying to select the genre. This is likely an application bug.`,
                    );
                }
                try {
                    await locator.selectOption({value});
                } catch (error2: any) {
                    throw new Error(
                        `Failed to select option for genre "${value}". Available options: ${options.map((option) => `"${option.label}"`).join(', ')}. Original errors: ${error.message}, ${error2.message}`,
                    );
                }
            }
            return;
        }

        logger.info(`Filling input value: ${value || '<blank>'}`);
        await this.fill(locator, value);
    }
}
