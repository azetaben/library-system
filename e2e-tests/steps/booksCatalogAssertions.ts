import {DataTable, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import type {CustomWorld} from '../support/world.ts';
import type {CatalogBookRow} from '../pages/BooksCatalogPage.ts';
import {VerificationHelpers} from '../helperUtilities/verificationHelpers.ts';
import {AssertionHelpers} from '../helperUtilities/assertionHelpers.ts';
import {appData, appPatterns} from '../utils/AppData.ts';
import {testData} from '../utils/TestData.ts';
import {logger} from '../utils/Logger.ts';
import {
    formatCatalogDate,
    normalizeCatalogPriceForContains,
} from '../utils/catalogFormatters.ts';

function catalogRowsFromTable(dataTable: DataTable): CatalogBookRow[] {
    return dataTable.hashes().map((row) => ({
        Title: (row.Title ?? '').trim(),
        Author: (row.Author ?? '').trim(),
        Genre: (row.Genre ?? '').trim(),
        ISBN: (row.ISBN ?? '').trim(),
        'Publication Date': (row['Publication Date'] ?? '').trim(),
        Price: (row.Price ?? '').trim(),
        Actions: (row.Actions ?? '').trim(),
    }));
}

export async function assertCatalogBookRow(
    world: CustomWorld,
    rowData: CatalogBookRow,
): Promise<void> {
    logger.info(`Verifying catalog row for ${rowData.Title}`);
    const row = world.pm
        .getBooksCatalogPage()
        .getBookRowByTitle(rowData.Title, rowData.Author);

    await expect(row).toBeVisible();
    await expect(row).toContainText(rowData.Title);
    await expect(row).toContainText(rowData.Author);
    await expect(row).toContainText(rowData.Genre);
    await expect(row).toContainText(rowData.ISBN);
    await expect(row).toContainText(
        formatCatalogDate(rowData['Publication Date']),
    );
    await expect(row).toContainText(normalizeCatalogPriceForContains(rowData.Price));

    for (const action of rowData.Actions.split(',').map((value) => value.trim()).filter(Boolean)) {
        await expect(
            row
                .locator('button, a')
                .filter({
                    hasText: new RegExp(
                        `^\\s*${action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`,
                        'i',
                    ),
                })
                .first(),
        ).toBeVisible();
    }
}

export async function assertCatalogBookRows(
    world: CustomWorld,
    rows: CatalogBookRow[],
): Promise<void> {
    logger.info(`Verifying ${rows.length} catalog rows`);
    for (const row of rows) {
        await assertCatalogBookRow(world, row);
    }
}

export async function assertCatalogManagementControl(
    world: CustomWorld,
    controlName: string,
): Promise<void> {
    const booksCatalogPage = world.pm.getBooksCatalogPage();
    const topNaviPage = world.pm.getTopNaviPage();
    const normalizedControlName = controlName.trim();

    switch (normalizedControlName.toLowerCase()) {
        case 'log out':
            await expect(topNaviPage.logoutButton()).toBeVisible();
            break;
        case 'book list':
            await expect(booksCatalogPage.booksCatalogHeading()).toBeVisible();
            await expect(booksCatalogPage.booksCatalogHeading()).toContainText(
                normalizedControlName,
            );
            break;
        case 'edit':
            await expect(booksCatalogPage.editButtons().first()).toBeVisible();
            break;
        case 'delete':
            await expect(booksCatalogPage.deleteButtons().first()).toBeVisible();
            break;
        case 'add book':
            await expect(booksCatalogPage.addBookButton()).toBeVisible();
            break;
        case 'previous':
            await expect(booksCatalogPage.previousButton()).toBeVisible();
            break;
        case 'next':
            await expect(booksCatalogPage.nextButton()).toBeVisible();
            break;
        default:
            await expect(world.page.locator('body')).toContainText(normalizedControlName);
            break;
    }
}

export async function assertDefaultPaginationControls(
    world: CustomWorld,
): Promise<void> {
    const booksCatalogPage = world.pm.getBooksCatalogPage();

    await expect(booksCatalogPage.previousButton()).toBeVisible();
    await expect(booksCatalogPage.nextButton()).toBeVisible();
    await expect(booksCatalogPage.previousButton()).toContainText(
        appData.buttons.previous,
    );
    await expect(booksCatalogPage.nextButton()).toContainText(appData.buttons.next);
    await expect(world.page.locator('body')).toContainText(appPatterns.pageOneSummary);
    await expect(booksCatalogPage.previousButton()).toBeDisabled();
    await expect(booksCatalogPage.nextButton()).toBeDisabled();
}

Then(
    'all elements on the books page should be visible',
    async function (this: CustomWorld) {
        const booksCatalogPage = this.pm.getBooksCatalogPage();
        const topNaviPage = this.pm.getTopNaviPage();
        await AssertionHelpers.expectVisible(booksCatalogPage.booksCatalogHeading());
        await AssertionHelpers.expectVisible(topNaviPage.userProfileWelcomeHeading());
        await AssertionHelpers.expectVisible(topNaviPage.logoutButton());
        await AssertionHelpers.expectVisible(booksCatalogPage.addBookButton());
        await AssertionHelpers.expectVisible(booksCatalogPage.bookList());
    },
);

Then(
    'the new book should be visible in the books catalog',
    async function (this: CustomWorld) {
        await expect(this.pm.getBooksCatalogPage().bookList()).toContainText(
            testData.validBook.title,
        );
    },
);

Then(
    'an error message should be displayed indicating that the title is required',
    async function (this: CustomWorld) {
        const booksPage = this.pm.getBooksCatalogPage();
        await expect(booksPage.errorMessage()).toHaveText(
            testData.invalidBook.expectedError,
        );
        await expect(booksPage.errorMessage()).toBeVisible();
    },
);

Then(
    'I verify the total book titles count is {string}',
    async function (this: CustomWorld, expectedCount: string) {
        await expect(this.pm.getBooksCatalogPage().editButtons()).toHaveCount(
            Number(expectedCount),
        );
    },
);

Then(
    'I can see {string} {int} in the book catalog page',
    async function (this: CustomWorld, label: string, count: number) {
        await expect(this.page.locator('body')).toContainText(`${label} ${count}`);
    },
);

Then(
    'I verify the book titled {string} is visible in the books catalog',
    async function (this: CustomWorld, title: string) {
        await expect(this.pm.getBooksCatalogPage().bookList()).toContainText(title);
    },
);

Then(
    'I can see the book {string} by {string} with ISBN {string},{string}, {string}, and {string} in the books catalog',
    async function (
        this: CustomWorld,
        title: string,
        author: string,
        isbn: string,
        genre: string,
        publicationDate: string,
        price: string,
    ) {
        await assertCatalogBookRow(this, {
            Title: title,
            Author: author,
            ISBN: isbn,
            Genre: genre,
            'Publication Date': publicationDate,
            Price: price,
            Actions: '',
        });
    },
);

Then(
    'I should see the book {string} by {string} with ISBN {string}, genre {string}, publication date {string}, and price {string} in the books catalog',
    async function (
        this: CustomWorld,
        title: string,
        author: string,
        isbn: string,
        genre: string,
        publicationDate: string,
        price: string,
    ) {
        await assertCatalogBookRow(this, {
            Title: title,
            Author: author,
            ISBN: isbn,
            Genre: genre,
            'Publication Date': publicationDate,
            Price: price,
            Actions: '',
        });
    },
);

Then(
    'I verify the book titled {string} is not visible in the books catalog',
    async function (this: CustomWorld, title: string) {
        await expect(this.pm.getBooksCatalogPage().bookList()).not.toContainText(
            title,
        );
    },
);

Then(
    'the seeded books should be displayed',
    async function (this: CustomWorld) {
        for (const title of appData.catalog.seededBooks.map((book) => book.title)) {
            await expect(this.pm.getBooksCatalogPage().bookList()).toContainText(title);
        }
    },
);

Then(
    'the book count summary should be visible',
    async function (this: CustomWorld) {
        await expect(this.pm.getBooksCatalogPage().editButtons()).toHaveCount(
            appData.catalog.seededBooks.length,
        );
    },
);

Then(
    'I verify Author,Genre,ISBN,Publication Date,Price, Actions by Title:',
    async function (this: CustomWorld, dataTable: DataTable) {
        await assertCatalogBookRows(this, catalogRowsFromTable(dataTable));
    },
);

Then(
    'I should see default displayed books catalog details:',
    async function (this: CustomWorld, dataTable: DataTable) {
        await assertCatalogBookRows(this, catalogRowsFromTable(dataTable));
    },
);

Then(
    'verify default books catalog details and pagination controls',
    async function (this: CustomWorld, dataTable: DataTable) {
        await assertCatalogBookRows(this, catalogRowsFromTable(dataTable));
        await assertDefaultPaginationControls(this);
    },
);

Then(
    'I should see default displayed books catalog details and pagination controls:',
    async function (this: CustomWorld, dataTable: DataTable) {
        await assertCatalogBookRows(this, catalogRowsFromTable(dataTable));
        await assertDefaultPaginationControls(this);
    },
);

Then(
    'I can see the updated book displayed in the books catalog details:',
    async function (this: CustomWorld, dataTable: DataTable) {
        await assertCatalogBookRows(this, catalogRowsFromTable(dataTable));
    },
);

Then(
    'I can see {string} and {string} buttons at the bottom page',
    async function (this: CustomWorld, previousLabel: string, nextLabel: string) {
        const booksCatalogPage = this.pm.getBooksCatalogPage();
        await expect(booksCatalogPage.previousButton()).toBeVisible();
        await expect(booksCatalogPage.nextButton()).toBeVisible();
        await expect(booksCatalogPage.previousButton()).toContainText(previousLabel);
        await expect(booksCatalogPage.nextButton()).toContainText(nextLabel);
    },
);

Then(
    'the {string} button should be disabled on the first page',
    async function (this: CustomWorld, buttonLabel: string) {
        const escapedLabel = buttonLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const button = this.page
            .locator('button, a, [role="button"]')
            .filter({hasText: new RegExp(`^\\s*${escapedLabel}\\s*$`, 'i')})
            .first();

        await expect(this.page.locator('body')).toContainText(appPatterns.pageOneSummary);
        await expect(button).toBeDisabled();
    },
);

Then(
    'the {string} and {string} pagination buttons should be disabled on the first page',
    async function (
        this: CustomWorld,
        previousLabel: string,
        nextLabel: string,
    ) {
        const booksCatalogPage = this.pm.getBooksCatalogPage();

        await expect(this.page.locator('body')).toContainText(appPatterns.pageOneSummary);
        await expect(booksCatalogPage.previousButton()).toContainText(previousLabel);
        await expect(booksCatalogPage.nextButton()).toContainText(nextLabel);
        await expect(booksCatalogPage.previousButton()).toBeDisabled();
        await expect(booksCatalogPage.nextButton()).toBeDisabled();
    },
);

Then(
    'I verify the books catalog static content',
    async function (this: CustomWorld) {
        await AssertionHelpers.expectVisible(this.pm.getBooksCatalogPage().booksCatalogHeading());
        await AssertionHelpers.expectVisible(this.pm.getBooksCatalogPage().bookList());
        await AssertionHelpers.expectVisible(this.pm.getBooksCatalogPage().addBookButton());
        await AssertionHelpers.expectVisible(this.pm.getTopNaviPage().logoutButton());
    },
);

Then(
    'I verify the clickable controls on the books catalog page',
    async function (this: CustomWorld) {
        await AssertionHelpers.expectVisible(this.pm.getBooksCatalogPage().addBookButton());
        await AssertionHelpers.expectVisible(this.pm.getTopNaviPage().logoutButton());
        await AssertionHelpers.expectVisible(this.pm.getBooksCatalogPage().editButtons().first());
        await AssertionHelpers.expectVisible(this.pm.getBooksCatalogPage().deleteButtons().first());
    },
);

Then(
    'I can see book catelog management related controls:',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Verification: Checking book catalog management related controls.');

        for (const row of dataTable.hashes()) {
            const controlName = (row.control ?? '').trim();
            if (!controlName) {
                continue;
            }

            await assertCatalogManagementControl(this, controlName);
        }
    },
);

Then(
    'the new book should appear in the inventory list',
    async function (this: CustomWorld) {
        const title = (this as any).lastCreatedBookTitle;
        await expect(this.pm.getBooksCatalogPage().bookList()).toContainText(title);
    },
);

Then(
    'the deleted book should no longer appear in the inventory list',
    async function (this: CustomWorld) {
        const title = (this as any).lastCreatedBookTitle;
        await expect(this.pm.getBooksCatalogPage().bookList()).not.toContainText(
            title,
        );
    },
);

Then(
    'I can verify the add book button is enabled and visible',
    async function (this: CustomWorld) {
        const addBookButton = this.pm.getBooksCatalogPage().addBookButton();
        expect(await VerificationHelpers.isVisible(addBookButton)).toBeTruthy();
        expect(await VerificationHelpers.isEnabled(addBookButton)).toBeTruthy();
        expect(
            await VerificationHelpers.normalizedTextEquals(
                addBookButton,
                appData.buttons.addBook,
            ),
        ).toBeTruthy();
    },
);

Then(
    'I can verify the catalog contains {int} books',
    async function (this: CustomWorld, expectedCount: number) {
        const rows = this.pm.getBooksCatalogPage().bookRows();
        expect(await VerificationHelpers.countEquals(rows, expectedCount)).toBeTruthy();
    },
);

Then(
    'I can verify the catalog row for {string} with author {string} exists',
    async function (this: CustomWorld, title: string, author: string) {
        const row = this.pm.getBooksCatalogPage().getBookRowByTitle(title, author);
        expect(await VerificationHelpers.isVisible(row)).toBeTruthy();
        expect(await VerificationHelpers.textContains(row, title)).toBeTruthy();
        expect(await VerificationHelpers.textContains(row, author)).toBeTruthy();
        expect(await VerificationHelpers.textMatches(row, /Edit.*Delete/)).toBeTruthy();
    },
);
