import {DataTable, Given, When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {BookFactory} from '../utils/data/index.ts';
import {appData} from '../utils/data/index.ts';
import {logger} from '../utils/runtime/index.ts';

Given(
    'I attempt to navigate directly to the books catalog',
    async function (this: CustomWorld) {
        logger.info('Attempting direct navigation to the books catalog');
        await this.pm.getBooksCatalogPage().navigateDirectly();
    },
);

When(
    'I click the {string} action',
    async function (this: CustomWorld, action: string) {
        logger.info(`Clicking catalog action "${action}"`);
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
        logger.info(`Clicking catalog action "${action}" for book "${title}"`);
        await this.pm.getBooksCatalogPage().clickActionForBook(title, action);
    },
);

When(
    'I click on the {string} button for the book {string}',
    async function (this: CustomWorld, buttonLabel: string, title: string) {
        logger.info(`Clicking "${buttonLabel}" for book "${title}"`);
        await this.pm.getBooksCatalogPage().clickActionForBook(title, buttonLabel);
    },
);

When(
    'I tap on the {string} button for a book titled {string}',
    async function (this: CustomWorld, buttonLabel: string, title: string) {
        logger.info(`Tapping "${buttonLabel}" for titled book "${title}"`);
        await this.pm.getBooksCatalogPage().clickActionForBook(title, buttonLabel);
    },
);

When(
    'I tap on the {string} button for the first book in the list',
    async function (this: CustomWorld, buttonLabel: string) {
        logger.info(`Tapping "${buttonLabel}" for the first catalog book`);
        await this.pm.getBooksCatalogPage().clickActionForFirstBook(buttonLabel);
    },
);

When(
    'I submit the add book form with:',
    async function (this: CustomWorld, dataTable: DataTable) {
        const data = dataTable.hashes()[0];
        logger.info('Submitting add-book form from books catalog step');
        await this.pm.getAddBookPage().submitBookForm(data);
    },
);

When(
    'I update the book form with:',
    async function (this: CustomWorld, dataTable: DataTable) {
        const data = dataTable.hashes()[0];
        logger.info('Submitting edit-book form from books catalog step');
        await this.pm.getEditBookPage().updateBookForm(data);
    },
);

When('I add a new book to the inventory', async function (this: CustomWorld) {
    logger.info('Adding a new generated book to the inventory');
    const book = BookFactory.unique();
    const validBook = {
        Title: book.title,
        Author: book.author,
        Genre: book.genre,
        ISBN: book.isbn ?? '',
        'Publication Date': book.publicationDate ?? '',
        Price: book.price ?? '',
    };

    this.lastCreatedBookTitle = validBook.Title;
    await this.pm.getBooksCatalogPage().clickAddBookButton();
    await this.pm.getAddBookPage().fillAndSubmitForm(validBook);
});

When('I delete the newly created book', async function (this: CustomWorld) {
    const title = this.lastCreatedBookTitle;
    if (!title) {
        throw new Error('No book title stored in world state. Did you run "I add a new book to the inventory" first?');
    }
    logger.info(`Deleting the newly created book "${title}"`);
    await this.pm
        .getBooksCatalogPage()
        .clickActionForBook(title as string, appData.buttons.delete);
});

Given(
    'I click on the {string} button for a book in the catalog',
    async function (this: CustomWorld, buttonLabel: string) {
        await this.pm.getBooksCatalogPage().clickCatalogControlByLabel(buttonLabel);
    },
);
