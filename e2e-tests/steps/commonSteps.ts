import {DataTable, Given, Then, When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {
    assertAddBookRequiredFieldError,
    assertAddBookValidationErrorOrRejection,
    assertAddBookValidationMessage,
} from './addBookAssertions.ts';
import {
    assertEditBookNativeValidationMessage,
    assertEditBookValidationErrorOrRejection,
    assertEditBookValidationMessage,
} from './editBookAssertions.ts';
import {envConfig} from '../config/env.config.ts';
import {appData} from '../utils/AppData.ts';
import {logger} from '../utils/Logger.ts';
import {isOnRoute, normalizeBookFormName} from '../utils/stepSupport.ts';

type FormWorld = CustomWorld & {
    activeBookFormName?: string;
    submittedFormData?: Record<string, string>;
    existingCatalogMatchCount?: number;
};

function syncActiveFormNameFromPage(world: FormWorld): void {
    const currentUrl = world.page.url().toLowerCase();

    if (isOnRoute(currentUrl, envConfig.routes.editBook)) {
        world.activeBookFormName = 'edit book';
        return;
    }

    if (isOnRoute(currentUrl, envConfig.routes.addBook)) {
        world.activeBookFormName = 'add book';
    }
}

function formDataFromTable(dataTable: DataTable): Record<string, string> {
    const row = dataTable.hashes()[0];
    if (!row) {
        throw new Error('Expected a single form data row but none was provided.');
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

async function addBookFormIndicators(world: CustomWorld): Promise<boolean[]> {
    const addBookPage = world.pm.getAddBookPage();
    return Promise.all([
        addBookPage
            .header()
            .isVisible()
            .catch(() => false),
        addBookPage.titleInputField.isVisible().catch(() => false),
        addBookPage.authorInputField.isVisible().catch(() => false),
        addBookPage.genreSelect.isVisible().catch(() => false),
        addBookPage
            .submitBookButton()
            .isVisible()
            .catch(() => false),
        addBookPage
            .errorAlertBlock()
            .isVisible()
            .catch(() => false),
        world.page
            .locator('body')
            .getByText(new RegExp(appData.headings.addBook, 'i'))
            .isVisible()
            .catch(() => false),
    ]);
}

async function editBookFormIndicators(world: CustomWorld): Promise<boolean[]> {
    const editBookPage = world.pm.getEditBookPage();
    const bodyText = (
        (await world.page
            .locator('body')
            .textContent()
            .catch(() => '')) ?? ''
    ).toLowerCase();
    return Promise.all([
        editBookPage
            .header()
            .isVisible()
            .catch(() => false),
        editBookPage
            .titleInputField()
            .isVisible()
            .catch(() => false),
        editBookPage
            .authorInputField()
            .isVisible()
            .catch(() => false),
        editBookPage
            .genreInputField()
            .isVisible()
            .catch(() => false),
        editBookPage
            .updateBookButton()
            .isVisible()
            .catch(() => false),
        editBookPage
            .cancelButton()
            .isVisible()
            .catch(() => false),
        Promise.resolve(/edit book/.test(bodyText)),
        Promise.resolve(/save changes/.test(bodyText)),
        Promise.resolve(
            /title|author|genre|isbn|publication date|price/.test(bodyText),
        ),
    ]);
}

async function ensureAddBookFormPage(world: CustomWorld): Promise<void> {
    logger.info('Ensuring the add-book form page is open');
    if ((await addBookFormIndicators(world)).some(Boolean)) {
        return;
    }

    await world.pm.getLandingPage().navigate();
    await world.pm.getLandingPage().clickStartTesting();
    await world.pm.getLoginPage().loginAsAuthorizedAdminUser();
    await world.pm.getBooksCatalogPage().clickAddBookButton();
    if (!(await addBookFormIndicators(world)).some(Boolean)) {
        throw new Error('Failed to open the add-book form page.');
    }
}

async function ensureEditBookFormPage(world: CustomWorld): Promise<void> {
    logger.info('Ensuring the edit-book form page is open');
    if ((await editBookFormIndicators(world)).some(Boolean)) {
        return;
    }

    await world.pm.getLandingPage().navigate();
    await world.pm.getLandingPage().clickStartTesting();
    await world.pm.getLoginPage().loginAsAuthorizedAdminUser();
    await world.pm
        .getBooksCatalogPage()
        .clickActionForBook(
            appData.catalog.seededBooks[0].title,
            appData.buttons.edit,
        );
    if (!(await editBookFormIndicators(world)).some(Boolean)) {
        throw new Error('Failed to open the edit-book form page.');
    }
}

Given(
    'I am on the {string} form page',
    async function (this: CustomWorld, formName: string) {
        logger.info(`Navigating to form page ${formName}`);
        switch (normalizeBookFormName(formName)) {
            case 'addBook':
                (this as FormWorld).activeBookFormName = 'add book';
                await ensureAddBookFormPage(this);
                return;

            case 'editBook':
                (this as FormWorld).activeBookFormName = 'edit book';
                await ensureEditBookFormPage(this);
                return;

            default:
                throw new Error(`Unsupported form page: ${formName}`);
        }
    },
);

When(
    'I submit the {string} form with invalid details:',
    async function (this: CustomWorld, formName: string, dataTable: DataTable) {
        logger.info(`Submitting invalid details for form ${formName}`);
        const data = formDataFromTable(dataTable);

        switch (normalizeBookFormName(formName)) {
            case 'addBook':
                (this as FormWorld).activeBookFormName = 'add book';
                (this as FormWorld).submittedFormData = data;
                await ensureAddBookFormPage(this);
                (this as FormWorld).existingCatalogMatchCount = await this.pm
                    .getBooksCatalogPage()
                    .countBookRowsByDetails(data.Title, data.Author, data.ISBN);
                await this.pm.getAddBookPage().fillAndSubmitForm(data as any);
                return;

            case 'editBook': {
                (this as FormWorld).activeBookFormName = 'edit book';
                (this as FormWorld).submittedFormData = data;
                await ensureEditBookFormPage(this);
                (this as FormWorld).existingCatalogMatchCount = await this.pm
                    .getBooksCatalogPage()
                    .countBookRowsByDetails(data.Title, data.Author, data.ISBN);
                await this.pm.getEditBookPage().fillAndSubmitForm(data as any);
                return;
            }

            default:
                throw new Error(`Unsupported form submission target: ${formName}`);
        }
    },
);

Then(
    'I should remain on the {string} form page',
    async function (this: CustomWorld, formName: string) {
        logger.info(`Verifying the user remains on form page ${formName}`);
        switch (normalizeBookFormName(formName)) {
            case 'addBook': {
                if (!(await addBookFormIndicators(this)).some(Boolean)) {
                    throw new Error('Expected to remain on the add book form page.');
                }
                return;
            }

            case 'editBook': {
                if (!(await editBookFormIndicators(this)).some(Boolean)) {
                    throw new Error('Expected to remain on the edit book form page.');
                }
                return;
            }

            default:
                throw new Error(`Unsupported form page assertion: ${formName}`);
        }
    },
);

Then(
    'I should see the validation message {string}',
    async function (this: CustomWorld, expectedMessage: string) {
        syncActiveFormNameFromPage(this as FormWorld);

        try {
            if ((this as FormWorld).activeBookFormName === 'edit book') {
                await assertEditBookValidationMessage(
                    this.pm.getEditBookPage(),
                    expectedMessage,
                );
            } else {
                await assertAddBookValidationMessage(
                    this.pm.getAddBookPage(),
                    expectedMessage,
                    this.page,
                );
            }
        } catch (error: any) {
            throw new Error(
                `Test failed while verifying validation message. This is likely an application bug where the form is not displaying the expected validation message. Please investigate the application's behavior. Original error: ${error.message}`,
            );
        }
    },
);

Then(
    'I should see {string} displayed',
    async function (this: CustomWorld, expectedMessage: string) {
        if (isOnRoute(this.page.url(), envConfig.routes.editBook)) {
            (this as FormWorld).activeBookFormName = 'edit book';
        }

        if (isOnRoute(this.page.url(), envConfig.routes.addBook)) {
            (this as FormWorld).activeBookFormName = 'add book';
        }

        try {
            if ((this as FormWorld).activeBookFormName === 'edit book') {
                await assertEditBookValidationMessage(
                    this.pm.getEditBookPage(),
                    expectedMessage,
                );
            } else {
                await assertAddBookValidationMessage(
                    this.pm.getAddBookPage(),
                    expectedMessage,
                    this.page,
                );
            }
        } catch (error: any) {
            throw new Error(
                `Test failed while verifying displayed message. Original error: ${error.message}`,
            );
        }
    },
);

Then(
    'I should see a required field validation error for {string}',
    async function (this: CustomWorld, fieldName: string) {
        syncActiveFormNameFromPage(this as FormWorld);

        try {
            if ((this as FormWorld).activeBookFormName === 'edit book') {
                await assertEditBookNativeValidationMessage(
                    this.pm.getEditBookPage(),
                    fieldName,
                );
            } else {
                await assertAddBookRequiredFieldError(
                    this.pm.getAddBookPage(),
                    fieldName,
                    this.page,
                );
            }
        } catch (error: any) {
            throw new Error(
                `Test failed while verifying a required field error. This is likely an application bug where the form is not displaying the expected validation message. Please investigate the application's behavior. Original error: ${error.message}`,
            );
        }
    },
);

Then(
    'I should see a validation error for {string}',
    async function (this: CustomWorld, fieldName: string) {
        syncActiveFormNameFromPage(this as FormWorld);

        try {
            if ((this as FormWorld).activeBookFormName === 'edit book') {
                await assertEditBookValidationErrorOrRejection(
                    this,
                    fieldName,
                    (this as FormWorld).submittedFormData,
                    (this as FormWorld).existingCatalogMatchCount ?? 0,
                );
            } else {
                await assertAddBookValidationErrorOrRejection(
                    this,
                    fieldName,
                    (this as FormWorld).submittedFormData,
                    (this as FormWorld).existingCatalogMatchCount ?? 0,
                );
            }
        } catch (error: any) {
            throw new Error(
                `Test failed while verifying a validation error. This is likely an application bug where the form is not displaying the expected validation message. Please investigate the application's behavior. Original error: ${error.message}`,
            );
        }
    },
);
