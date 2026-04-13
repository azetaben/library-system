import {DataTable, Given, When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {BookFactory} from '../utils/bookFactory.ts';
import {appData} from '../utils/AppData.ts';

Given(
    'I attempt to navigate directly to the books catalog',
    async function (this: CustomWorld) {
        await this.pm.getBooksCatalogPage().navigateDirectly();
    },
);

When(
    'I click the {string} action',
    async function (this: CustomWorld, action: string) {
        if (action === appData.buttons.addBook) {
            await this.pm
                .getBooksCatalogPage()
                .clickElement(this.pm.getBooksCatalogPage().addBookButton());
            return;
        }
        throw new Error(`Unsupported catalog action: ${action}`);
    },
);

When(
    'I click the {string} action for book {string}',
    async function (this: CustomWorld, action: string, title: string) {
        await this.pm.getBooksCatalogPage().clickActionForBook(title, action);
    },
);

When(
    'I click on the {string} button for the book {string}',
    async function (this: CustomWorld, buttonLabel: string, title: string) {
        await this.pm.getBooksCatalogPage().clickActionForBook(title, buttonLabel);
    },
);

When(
    'I tap on the {string} button for a book titled {string}',
    async function (this: CustomWorld, buttonLabel: string, title: string) {
        await this.pm.getBooksCatalogPage().clickActionForBook(title, buttonLabel);
    },
);

When(
    'I tap on the {string} button for the first book in the list',
    async function (this: CustomWorld, buttonLabel: string) {
        await this.pm.getBooksCatalogPage().clickActionForFirstBook(buttonLabel);
    },
);

When(
    'I submit the add book form with:',
    async function (this: CustomWorld, dataTable: DataTable) {
        const data = dataTable.hashes()[0];
        await this.pm.getAddBookPage().submitBookForm(data);
    },
);

When(
    'I update the book form with:',
    async function (this: CustomWorld, dataTable: DataTable) {
        const data = dataTable.hashes()[0];
        await this.pm.getEditBookPage().updateBookForm(data);
    },
);

When('I add a new book to the inventory', async function (this: CustomWorld) {
    const book = BookFactory.unique();
    const validBook = {
        Title: book.title,
        Author: book.author,
        Genre: book.genre,
        ISBN: book.isbn ?? '',
        'Publication Date': book.publicationDate ?? '',
        Price: book.price ?? '',
    };

    (this as any).lastCreatedBookTitle = validBook.Title;
    await this.pm.getBooksCatalogPage().clickAddBookButton();
    await this.pm.getAddBookPage().fillAndSubmitForm(validBook);
});

When('I delete the newly created book', async function (this: CustomWorld) {
    const title = (this as any).lastCreatedBookTitle;
    await this.pm
        .getBooksCatalogPage()
        .clickActionForBook(title, appData.buttons.delete);
});

Given(
    'I click on the {string} button for a book in the catalog',
    async function (this: CustomWorld, buttonLabel: string) {
        const escapedLabel = buttonLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const locator = this.page
            .locator('button, a, [role="button"]')
            .filter({hasText: new RegExp(`^\\s*${escapedLabel}\\s*$`, 'i')})
            .first();

        await locator.click();
    },
);
