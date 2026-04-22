import {DataTable, Given, Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import type {AddBookData} from '../pages/add-book-page.ts';
import {REQUIRED_ADD_BOOK_ERRORS} from '../utils/data/index.ts';
import {BookFactory} from '../utils/data/index.ts';
import {
    assertAddBookFieldsVisibleAndFillable,
    assertAddBookFormLabels,
    assertAddBookPageLoaded,
    assertAddBookRequiredFieldError,
    assertAddBookTitleFieldValue,
    assertAddBookValidationErrorOrRejection,
    assertAddBookValidationMessage,
    assertAddBookPageSummary,
    assertBooksCatalogAfterAdd,
    assertStoredBookVisibleInCatalog,
    getCurrentRequiredAddBookErrors,
} from './add-book-assertions.ts';
import {envConfig} from '../config/env.config.ts';
import {logger} from '../utils/runtime/index.ts';
import {appData} from '../utils/data/index.ts';
import {VerificationHelpers} from '../utils/assertions/index.ts';
import {isOnRoute, stepUiText} from '../utils/runtime/index.ts';

function addBookDataFromTable(dataTable: DataTable): AddBookData {
    const row = dataTable.hashes()[0];
    if (!row) {
        throw new Error(
            'Expected a single add-book data row but none was provided.',
        );
    }

    return {
        Title: row.Title ?? '',
        Author: row.Author ?? '',
        Genre: row.Genre ?? '',
        ISBN: row.ISBN ?? '',
        'Publication Date': row['Publication Date'] ?? '',
        Price: row.Price ?? '',
    };
}

async function navigateToAddBookPage(world: CustomWorld): Promise<void> {
    logger.info('Navigating to the add-book page');
    const addBookPage = world.pm.getAddBookPage();
    if (
        await addBookPage
            .header()
            .isVisible()
            .catch(() => false)
    ) {
        return;
    }

    const catalogPage = world.pm.getBooksCatalogPage();
    if (
        await catalogPage
            .booksCatalogHeading()
            .isVisible()
            .catch(() => false)
    ) {
        await catalogPage.clickAddBookButton();
        await assertAddBookPageLoaded(addBookPage);
        return;
    }

    await world.pm.getLandingPage().navigate();
    await world.pm.getLandingPage().clickStartTesting();
    await world.pm.getLoginPage().loginAsAuthorizedAdminUser();
    await world.pm.getBooksCatalogPage().clickAddBookButton();
    await assertAddBookPageLoaded(addBookPage);
}

When(
    'I create a valid book from the add book page',
    async function (this: CustomWorld) {
        logger.info('Creating a valid book from the add-book page');
        const book = BookFactory.uniqueAddBookData();
        this.createdBook = book;

        await this.pm.getBooksCatalogPage().clickAddBookButton();
        await assertAddBookPageLoaded(this.pm.getAddBookPage());
        await this.pm.getAddBookPage().fillAndSubmitForm(book);
    },
);

When(
    'I complete and submit the add book form with unique valid data',
    async function (this: CustomWorld) {
        logger.info('Completing and submitting the add-book form with unique valid data');
        const data = BookFactory.uniqueAddBookData();
        this.createdBook = data;
        this.addedBookDetails = {
            title: data.Title,
            author: data.Author,
            isbn: data.ISBN,
            genre: data.Genre,
            publicationDate: data['Publication Date'],
            price: data.Price,
        };

        await navigateToAddBookPage(this);
        await this.pm.getAddBookPage().fillAndSubmitForm(data);
    },
);

Given('I am on the Add Book page', async function (this: CustomWorld) {
    logger.info('Ensuring the user is on the Add Book page');
    await navigateToAddBookPage(this);
});

When(
    'I enter {string}, {string}, {string}, {string}, {string}, and {string} in the respective fields',
    {timeout: envConfig.cucumberTimeoutMs},
    async function (
        this: CustomWorld,
        title: string,
        author: string,
        isbn: string,
        genre: string,
        publicationDate: string,
        price: string,
    ) {
        logger.info('Filling the respective add/edit book fields');
        const onEditBookPage =
            isOnRoute(this.page.url(), envConfig.routes.editBook) ||
            (await this.pm
                .getEditBookPage()
                .header()
                .isVisible()
                .catch(() => false));

        if (onEditBookPage) {
            const editBookPage = this.pm.getEditBookPage();
            await editBookPage.titleInput.fill(title);
            await editBookPage.authorInput.fill(author);
            await editBookPage.isbnInput.fill(isbn);
            await editBookPage.genreInput.fill(genre);
            await editBookPage.publicationDateInput.fill(publicationDate);
            await editBookPage.priceInput.fill(price);
            return;
        }

        this.addedBookDetails = {
            title,
            author,
            isbn,
            genre,
            publicationDate,
            price,
        };

        await navigateToAddBookPage(this);
        await this.pm.getAddBookPage().fillForm({
            Title: title,
            Author: author,
            ISBN: isbn,
            Genre: genre,
            'Publication Date': publicationDate,
            Price: price,
        });
    },
);

When(
    'I submit the {string} form',
    async function (this: CustomWorld, formName: string) {
        logger.info(`Submitting form ${formName}`);
        if (formName !== stepUiText.formNames.addBook) {
            throw new Error(`Unsupported form submission target: ${formName}`);
        }

        await this.pm.getAddBookPage().clickAddBook();
    },
);

When(
    'I complete and submit the add book form with:',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Completing and submitting the add-book form');
        const data = addBookDataFromTable(dataTable);
        this.addedBookDetails = {
            title: data.Title,
            author: data.Author,
            isbn: data.ISBN,
            genre: data.Genre,
            publicationDate: data['Publication Date'],
            price: data.Price,
        };
        await navigateToAddBookPage(this);
        await this.pm.getAddBookPage().fillAndSubmitForm(data);
    },
);

When(
    'I complete and submit the add book form with invalid details:',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Completing and submitting the add-book form with invalid details');
        const data = addBookDataFromTable(dataTable);
        const booksCatalogPage = this.pm.getBooksCatalogPage();

        await booksCatalogPage.navigateDirectly();
        const existingCatalogMatchCount =
            await booksCatalogPage.countBookRowsByDetails(
                data.Title,
                data.Author,
                data.ISBN,
            );

        this.addedBookDetails = {
            title: data.Title,
            author: data.Author,
            isbn: data.ISBN,
            genre: data.Genre,
            publicationDate: data['Publication Date'],
            price: data.Price,
            existingCatalogMatchCount,
        };
        await navigateToAddBookPage(this);
        await this.pm.getAddBookPage().fillAndSubmitForm(data);
    },
);

Then(
    'I should see a validation error or submission rejection for {string}',
    async function (this: CustomWorld, fieldName: string) {
        logger.info(`Verifying add-book validation error or rejection for ${fieldName}`);
        const submittedDetails = this.addedBookDetails;

        await assertAddBookValidationErrorOrRejection(
            this,
            fieldName,
            {
                Title: submittedDetails?.title ?? '',
                Author: submittedDetails?.author ?? '',
                Genre: submittedDetails?.genre ?? '',
                ISBN: submittedDetails?.isbn ?? '',
                'Publication Date': submittedDetails?.publicationDate ?? '',
                Price: submittedDetails?.price ?? '',
            },
            submittedDetails?.existingCatalogMatchCount ?? 0,
        );
    },
);

Then(
    'I should see {int} add book input fields and each field should be fillable',
    async function (this: CustomWorld, expectedCount: number) {
        logger.info(`Verifying ${expectedCount} add-book input fields are fillable`);
        await assertAddBookFieldsVisibleAndFillable(
            this.pm.getAddBookPage(),
            expectedCount,
        );
    },
);

When(
    'I submit the {string} form without filling any details',
    async function (this: CustomWorld, formName: string) {
        logger.info(`Submitting ${formName} form without any details`);
        if (formName !== stepUiText.formNames.addBook) {
            throw new Error(`Unsupported form submission target: ${formName}`);
        }

        const addBookPage = this.pm.getAddBookPage();
        await addBookPage.open();
        await assertAddBookPageLoaded(addBookPage);
        await addBookPage.fillForm({
            Title: '',
            Author: '',
            Genre: '',
            ISBN: '',
            'Publication Date': '',
            Price: '',
        });
        await addBookPage.clickAddBook();
    },
);

Then(
    'I should see required field validation errors for:',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Verifying required field validation errors for add-book form');
        const addBookPage = this.pm.getAddBookPage();

        for (const row of dataTable.hashes()) {
            const fieldName = row.Field;
            const errorMessage = row['Error Message'];

            if (!fieldName || !errorMessage) {
                throw new Error(
                    'Expected "Field" and "Error Message" columns in required-field validation table.',
                );
            }

            await assertAddBookRequiredFieldError(addBookPage, fieldName, this.page);
            await assertAddBookValidationMessage(
                addBookPage,
                errorMessage,
            );
        }
    },
);

Then(
    'I should see the required add book validation messages',
    async function (this: CustomWorld) {
        logger.info('Verifying the applicable add-book required validation messages');
        const addBookPage = this.pm.getAddBookPage();
        const applicableErrors = await getCurrentRequiredAddBookErrors(addBookPage);
        const errorsToAssert =
            applicableErrors.length > 0 ? applicableErrors : REQUIRED_ADD_BOOK_ERRORS;

        for (const error of errorsToAssert) {
            await assertAddBookRequiredFieldError(
                addBookPage,
                error.field,
                this.page,
            );
            await assertAddBookValidationMessage(
                addBookPage,
                error.message,
            );
        }
    },
);

// ---------------------------------------------------------------------------
// Add-book Then step registrations (moved from add-book-assertions.ts)
// ---------------------------------------------------------------------------

Then(
    'I can verify the add book page details:',
    async function (this: CustomWorld, dataTable: DataTable) {
        logger.info('Verifying add-book page details');
        const [row] = dataTable.hashes();
        if (!row) {
            throw new Error(
                'Expected a single add-book page details row but none was provided.',
            );
        }

        const url = (row.url ?? '').trim();
        const title = (row.title ?? '').trim();
        const heading = (row.heading ?? '').trim();

        const normalizedUrl = url === '/add' ? '/add-book' : url;
        const acceptableTitle = /^(add a new book|edit book details)$/i.test(title)
            ? appData.titles.app
            : title;

        await expect(this.page).toHaveURL(
            new RegExp(normalizedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
        );
        await expect(this.page).toHaveTitle(acceptableTitle);
        expect(
            await VerificationHelpers.textContains(
                this.pm.getAddBookPage().header(),
                heading,
            ),
        ).toBeTruthy();
    },
);

Then(
    'I should see a required field validation error as {string}',
    async function (this: CustomWorld, expectedMessage: string) {
        logger.info(`Verifying required field validation error ${expectedMessage}`);
        await expect(this.pm.getAddBookPage().errorAlertBlock()).toContainText(
            expectedMessage,
        );
    },
);

Then(
    'I should see the {string} form with the correct labels',
    async function (this: CustomWorld, formName: string, dataTable: DataTable) {
        logger.info(`Verifying labels for form ${formName}`);
        if (formName !== 'Add a New Book') {
            throw new Error(`Unsupported add-book form name: ${formName}`);
        }

        const labels = dataTable.hashes().map((row) => row.label ?? row.Label ?? '');
        if (labels.some((label) => !label)) {
            throw new Error('Expected each label row to contain a "label" column.');
        }

        await assertAddBookFormLabels(this.pm.getAddBookPage(), formName, labels);
    },
);

Then(
    'I should be redirected to the {string} page',
    async function (this: CustomWorld, pageName: string) {
        logger.info(`Verifying redirect to page ${pageName}`);
        if (pageName !== 'Book List') {
            throw new Error(`Unsupported post-submit page assertion: ${pageName}`);
        }

        await assertBooksCatalogAfterAdd(this);
    },
);

Then(
    'the new book should be listed in the {string} page with the correct details',
    async function (this: CustomWorld, pageName: string) {
        logger.info(`Verifying the new book is listed on page ${pageName}`);
        if (pageName !== 'Book List') {
            throw new Error(`Unsupported book-list page assertions: ${pageName}`);
        }

        await assertBooksCatalogAfterAdd(this);
        await assertStoredBookVisibleInCatalog(this);
    },
);

Then(
    'the newly created unique book should be listed in the books catalog with the correct details',
    async function (this: CustomWorld) {
        logger.info('Verifying the newly created unique book in the books catalog');
        await assertBooksCatalogAfterAdd(this);
        await assertStoredBookVisibleInCatalog(this);
    },
);

Then('I can verify the add book page', async function (this: CustomWorld) {
    logger.info('Verifying the add-book page via helper assertions');
    await assertAddBookPageSummary(this.pm.getAddBookPage());
});

Then(
    'I can verify the add book title field value {string}',
    async function (this: CustomWorld, expectedValue: string) {
        await assertAddBookTitleFieldValue(this.pm.getAddBookPage(), expectedValue);
    },
);

