import {DataTable, Given, Then, When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import type {AddBookData} from '../pages/AddBookPage.ts';
import type {AddedBookDetails} from '../utils/book.types.ts';
import {REQUIRED_ADD_BOOK_ERRORS} from '../utils/addBook.constants.ts';
import {BookFactory} from '../utils/bookFactory.ts';
import {
    assertAddBookButtonClickable,
    assertAddBookFieldsVisibleAndFillable,
    assertAddBookPageLoaded,
    assertAddBookRequiredFieldError,
    assertAddBookValidationErrorOrRejection,
    assertAddBookValidationMessage,
    getCurrentRequiredAddBookErrors,
} from './addBookAssertions.ts';
import {envConfig} from '../config/env.config.ts';
import {logger} from '../utils/Logger.ts';
import {isOnRoute, stepUiText} from '../utils/stepSupport.ts';

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
    async function (
        this: CustomWorld & { addedBookDetails?: AddedBookDetails },
    ) {
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

        (
            this as CustomWorld & { addedBookDetails?: AddedBookDetails }
        ).addedBookDetails = {
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
        (
            this as CustomWorld & { addedBookDetails?: AddedBookDetails }
        ).addedBookDetails = {
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

        (
            this as CustomWorld & { addedBookDetails?: AddedBookDetails }
        ).addedBookDetails = {
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
        const submittedDetails = (
            this as CustomWorld & { addedBookDetails?: AddedBookDetails }
        ).addedBookDetails;

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

Then(
    'I should see the {string} button as enabled and clickable',
    async function (this: CustomWorld, buttonName: string) {
        logger.info(`Verifying button ${buttonName} is enabled and clickable`);
        await assertAddBookButtonClickable(this.pm.getAddBookPage(), buttonName);
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
                this.page,
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
                this.page,
            );
        }
    },
);
