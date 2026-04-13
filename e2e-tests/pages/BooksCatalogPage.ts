import type {Locator, Page} from '@playwright/test';
import {BasePage} from './BasePage.ts';
import {envConfig} from '../config/env.config.ts';
import {appData} from '../utils/AppData.ts';
import {logger} from '../utils/Logger.ts';

export type CatalogBookRow = {
    Title: string;
    Author: string;
    Genre: string;
    ISBN: string;
    'Publication Date': string;
    Price: string;
    Actions: string;
};

export class BooksCatalogPage extends BasePage {
    private readonly booksHeadingLocator: Locator;
    private readonly addBookButtonLocator: Locator;
    private readonly bookListLocator: Locator;
    private readonly errorMessageLocator: Locator;
    private readonly bookRowsLocator: Locator;
    private readonly editButtonsLocator: Locator;
    private readonly deleteButtonsLocator: Locator;
    private readonly previousButtonLocator: Locator;
    private readonly nextButtonLocator: Locator;

    constructor(page: Page) {
        super(page);
        this.booksHeadingLocator = page.getByRole('heading', {
            name: appData.headings.booksCatalog,
        });
        this.addBookButtonLocator = page
            .locator('button, a')
            .filter({hasText: new RegExp(`^${appData.buttons.addBook}$`, 'i')})
            .first();
        this.bookListLocator = page
            .locator('.book-list, table, [data-testid="book-list"]')
            .first();
        this.errorMessageLocator = page
            .locator('.error-message, .text-red-500, [role="alert"]')
            .first();
        this.bookRowsLocator = page.locator('.book-list > *, tbody tr, ul > li');
        this.editButtonsLocator = this.bookRowsLocator
            .locator('button, a')
            .filter({hasText: new RegExp(`^${appData.buttons.edit}$`, 'i')});
        this.deleteButtonsLocator = this.bookRowsLocator
            .locator('button, a')
            .filter({hasText: new RegExp(`^${appData.buttons.delete}$`, 'i')});
        this.previousButtonLocator = page
            .locator('button, a')
            .filter({hasText: new RegExp(`^${appData.buttons.previous}$`, 'i')})
            .first();
        this.nextButtonLocator = page
            .locator('button, a')
            .filter({hasText: new RegExp(`^${appData.buttons.next}$`, 'i')})
            .first();
    }

    booksCatalogHeading(): Locator {
        return this.booksHeadingLocator;
    }

    addBookButton(): Locator {
        return this.addBookButtonLocator;
    }

    bookList(): Locator {
        return this.bookListLocator;
    }

    errorMessage(): Locator {
        return this.errorMessageLocator;
    }

    bookRows(): Locator {
        return this.bookRowsLocator;
    }

    editButtons(): Locator {
        return this.editButtonsLocator;
    }

    deleteButtons(): Locator {
        return this.deleteButtonsLocator;
    }

    previousButton(): Locator {
        return this.previousButtonLocator;
    }

    nextButton(): Locator {
        return this.nextButtonLocator;
    }

    getCatalogUrlPattern(): RegExp {
        const escapedBaseUrl = envConfig.baseUrl.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
        );
        const escapedBooksRoute = envConfig.routes.books.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
        );
        return new RegExp(`^${escapedBaseUrl}(?:${escapedBooksRoute})?/?$`, 'i');
    }

    async navigateDirectly() {
        logger.info('Navigating directly to the books catalog page');
        await this.navigateTo(envConfig.routes.books);
    }

    getBookRowByTitle(title: string, author?: string) {
        let row = this.bookRows().filter({
            has: this.page.getByText(title, {exact: true}),
        });
        if (author) {
            row = row.filter({has: this.page.getByText(author, {exact: true})});
        }
        return row.first();
    }

    getBookRowsByDetails(title: string, author: string, isbn: string): Locator {
        return this.bookRows()
            .filter({
                has: this.page.getByText(title, {exact: true}),
            })
            .filter({
                has: this.page.getByText(author, {exact: true}),
            })
            .filter({
                has: this.page.getByText(isbn, {exact: true}),
            });
    }

    async countBookRowsByDetails(
        title: string,
        author: string,
        isbn: string,
    ): Promise<number> {
        if (!title.trim() || !author.trim() || !isbn.trim()) {
            return 0;
        }

        return this.getBookRowsByDetails(title, author, isbn).count();
    }

    private bookActionButton(scope: Locator, action: string): Locator {
        const escapedAction = action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return scope
            .locator('button, a, [role="button"]')
            .filter({hasText: new RegExp(`^\\s*${escapedAction}\\s*$`, 'i')})
            .first();
    }

    getBookActionButton(title: string, action: string) {
        return this.bookActionButton(this.getBookRowByTitle(title), action);
    }

    async clickActionForBook(title: string, action: string) {
        logger.info(`Clicking "${action}" for book "${title}"`);
        await this.clickElement(this.getBookActionButton(title, action));
    }

    async clickActionForFirstBook(action: string) {
        logger.info(`Clicking "${action}" for the first book in the catalog`);
        const firstRow = this.bookRows().first();
        const actionButton = this.bookActionButton(firstRow, action);
        await this.clickElement(actionButton);
    }

    async clickAddBookButton() {
        logger.info('Clicking Add Book from books catalog page');
        await this.waitAndClick(this.addBookButtonLocator);
    }
}
