import type {Page} from '@playwright/test';
import {expect} from '@playwright/test';
import type {AddBookData, AddBookPage} from '../pages/add-book-page.ts';
import type {CustomWorld} from '../support/world.ts';
import {VerificationHelpers} from '../utils/assertions/index.ts';
import {appData} from '../utils/data/index.ts';
import {logger} from '../utils/runtime/index.ts';
import {REQUIRED_ADD_BOOK_ERRORS} from '../utils/data/index.ts';
import {formatCatalogDate, formatCatalogPrice} from '../utils/text/index.ts';
import {ValidationMessageMapper} from '../utils/assertions/index.ts';

type RequiredAddBookError = {
    field: (typeof REQUIRED_ADD_BOOK_ERRORS)[number]['field'];
    message: (typeof REQUIRED_ADD_BOOK_ERRORS)[number]['message'];
};

export async function assertAddBookFieldsVisibleAndFillable(
    addBookPage: AddBookPage,
    expectedCount?: number,
): Promise<void> {
    logger.info('Verifying add-book fields are visible and fillable');
    const fields = [
        addBookPage.titleInputField,
        addBookPage.authorInputField,
        addBookPage.genreSelect,
        addBookPage.isbnInputField,
        addBookPage.publicationDateInputField,
        addBookPage.priceInputField,
    ];

    if (expectedCount !== undefined && expectedCount !== fields.length) {
        throw new Error(
            `Expected ${expectedCount} add-book fields but page defines ${fields.length}.`,
        );
    }

    for (const field of fields) {
        await expect(field).toBeVisible();
        await expect(field).toBeEditable();
    }
}

export async function assertAddBookButtonClickable(
    addBookPage: AddBookPage,
    buttonName: string,
): Promise<void> {
    logger.info(`Verifying add-book button ${buttonName} is clickable`);
    if (buttonName !== 'Add Book') {
        throw new Error(`Unsupported add-book button: ${buttonName}`);
    }

    await expect(addBookPage.submitBookButton()).toBeVisible();
    await expect(addBookPage.submitBookButton()).toBeEnabled();
}

export async function assertAddBookPageLoaded(addBookPage: AddBookPage): Promise<void> {
    logger.info('Verifying add-book page is loaded');
    await expect(addBookPage.header()).toBeVisible();
    await expect(addBookPage.header()).toContainText(appData.headings.addBook);
}

export async function assertAddBookFormLabels(
    addBookPage: AddBookPage,
    formName: string,
    labels: string[],
): Promise<void> {
    logger.info(`Verifying ${labels.length} add-book form labels`);
    await expect(addBookPage.header()).toContainText(formName);

    for (const label of labels) {
        const locator = addBookPage.labelByText(label);
        await expect(locator).toBeVisible();
        await expect(locator).toContainText(label);
    }
}

export async function assertBooksCatalogAfterAdd(world: CustomWorld): Promise<void> {
    logger.info('Verifying redirect to books catalog after add-book submit');
    const heading = world.pm.getBooksCatalogPage().booksCatalogHeading();
    try {
        await expect(heading).toBeVisible({timeout: 10000});
    } catch (error) {
        const errorLocator = world.pm.getAddBookPage().errorAlertBlock();
        const errorMessage = (await errorLocator.textContent())?.trim();
        if (errorMessage) {
            throw new Error(
                `Failed to navigate to Book List page. Error on page: "${errorMessage}"`,
            );
        }
        throw new Error(
            `Failed to navigate to Book List page after adding a book. Current URL: ${world.page.url()}`,
        );
    }
    await expect(heading).toContainText(appData.headings.booksCatalog);
}

export async function assertStoredBookVisibleInCatalog(
    world: CustomWorld,
): Promise<void> {
    const submittedDetails = world.addedBookDetails;
    if (!submittedDetails) {
        throw new Error(
            'No submitted add-book details were captured for verification.',
        );
    }

    const row = world.pm
        .getBooksCatalogPage()
        .getBookRowByTitle(submittedDetails.title, submittedDetails.author);

    await expect(row).toBeVisible();
    await expect(row).toContainText(submittedDetails.title);
    await expect(row).toContainText(submittedDetails.author);
    await expect(row).toContainText(submittedDetails.isbn);
    await expect(row).toContainText(submittedDetails.genre);
    await expect(row).toContainText(
        formatCatalogDate(submittedDetails.publicationDate),
    );
    await expect(row).toContainText(formatCatalogPrice(submittedDetails.price));
}

export async function assertAddBookPageSummary(addBookPage: AddBookPage): Promise<void> {
    logger.info('Verifying add-book page summary state');
    await expect(addBookPage.header()).toBeVisible();
    await expect(addBookPage.header()).toContainText(appData.headings.addBook);
    await expect(addBookPage.titleInputField).toBeVisible();
    await expect(addBookPage.authorInputField).toBeVisible();
    await expect(addBookPage.genreSelect).toBeVisible();
    await expect(addBookPage.isbnInputField).toBeVisible();
    await expect(addBookPage.publicationDateInputField).toBeVisible();
    await expect(addBookPage.priceInputField).toBeVisible();
    await expect(addBookPage.submitBookButton()).toBeEnabled();
}

export async function assertAddBookTitleFieldValue(
    addBookPage: AddBookPage,
    expectedValue: string,
): Promise<void> {
    logger.info(`Verifying add-book title field value ${expectedValue}`);
    expect(
        await VerificationHelpers.hasValue(addBookPage.titleInputField, expectedValue),
    ).toBeTruthy();
}

export async function assertAddBookRequiredFieldError(
    addBookPage: AddBookPage,
    fieldName: string,
    page: Page,
): Promise<void> {
    logger.info(`Verifying required field error for add-book field ${fieldName}`);
    const isStillOnAddBookPage = /add-book/i.test(page.url());
    if (!isStillOnAddBookPage) {
        throw new Error(
            `Expected to stay on the Add Book page to see a validation error, but was redirected to ${page.url()}`,
        );
    }

    const specificError = addBookPage.requiredErrorByField(fieldName);
    if (await specificError.isVisible().catch(() => false)) {
        await expect(specificError).toBeVisible();
        return;
    }

    if (await addBookPage.errorAlertBlock().isVisible().catch(() => false)) {
        const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const alertText = (
            (await addBookPage.errorAlertBlock().textContent().catch(() => '')) ?? ''
        ).trim();
        if (new RegExp(`${escapedFieldName}\\s+is\\s+required`, 'i').test(alertText)) {
            return;
        }
    }

    const field = addBookPage.fieldByName(fieldName);
    const fieldState = await field
        .evaluate((element) => {
            const input = element as HTMLInputElement | HTMLSelectElement;
            const currentValue =
                input instanceof HTMLSelectElement ? input.value : (input.value ?? '');

            return {
                validationMessage: input.validationMessage ?? '',
                valueMissing: Boolean(input.validity?.valueMissing),
                valid: Boolean(input.validity?.valid),
                checkValidity:
                    typeof input.checkValidity === 'function'
                        ? input.checkValidity()
                        : true,
                ariaInvalid: input.getAttribute('aria-invalid'),
                required:
                    input.hasAttribute('required') ||
                    input.getAttribute('aria-required') === 'true',
                value: currentValue,
            };
        })
        .catch(() => null);

    if (!fieldState) {
        throw new Error(
            `Could not inspect add-book field "${fieldName}" after submit. Current URL: ${page.url()}`,
        );
    }

    if (fieldState.validationMessage.trim().length > 0) {
        return;
    }

    if (fieldState.valueMissing) {
        return;
    }

    if (fieldState.ariaInvalid === 'true') {
        return;
    }

    if (
        fieldState.required &&
        fieldState.value.trim() === '' &&
        (!fieldState.valid || !fieldState.checkValidity)
    ) {
        return;
    }

    throw new Error(
        `Expected a required validation error for "${fieldName}" but no required-state signal was found. ` +
        `URL: ${page.url()} | ` +
        `validationMessage: "${fieldState.validationMessage}" | ` +
        `valueMissing: ${fieldState.valueMissing} | ` +
        `valid: ${fieldState.valid} | ` +
        `checkValidity: ${fieldState.checkValidity} | ` +
        `ariaInvalid: ${fieldState.ariaInvalid ?? '<null>'} | ` +
        `required: ${fieldState.required} | ` +
        `value: "${fieldState.value}"`,
    );
}

export async function assertAddBookValidationErrorOrRejection(
    world: CustomWorld,
    fieldName: string,
    submittedData?: Partial<AddBookData>,
    existingCatalogMatchCount = 0,
): Promise<void> {
    logger.info(`Verifying add-book validation error or rejection for ${fieldName}`);
    const addBookPage = world.pm.getAddBookPage();
    const stillOnAddBookPage =
        /add-book/i.test(world.page.url()) ||
        (await addBookPage.header().isVisible().catch(() => false));

    if (!stillOnAddBookPage) {
        const booksCatalogPage = world.pm.getBooksCatalogPage();
        const redirectedToCatalog =
            /\/books\/?$/i.test(world.page.url()) &&
            (await booksCatalogPage
                .booksCatalogHeading()
                .isVisible()
                .catch(() => false));

        if (redirectedToCatalog && submittedData) {
            const submittedTitle = (submittedData.Title ?? '').trim();
            const submittedAuthor = (submittedData.Author ?? '').trim();
            const submittedIsbn = (submittedData.ISBN ?? '').trim();
            const matchingRows =
                !submittedTitle || !submittedAuthor || !submittedIsbn
                    ? 0
                    : await booksCatalogPage.countBookRowsByDetails(
                        submittedTitle,
                        submittedAuthor,
                        submittedIsbn,
                    );

            if (matchingRows <= existingCatalogMatchCount) {
                return;
            }

            throw new Error(
                `Expected invalid field "${fieldName}" to be rejected, but the catalog match count increased. ` +
                `URL: ${world.page.url()} | previousMatches: ${existingCatalogMatchCount} | currentMatches: ${matchingRows}`,
            );
        }

        throw new Error(
            `Expected to stay on the Add Book page for field "${fieldName}", but was redirected to ${world.page.url()}`,
        );
    }

    if (await addBookPage.errorAlertBlock().isVisible().catch(() => false)) {
        await expect(addBookPage.errorAlertBlock()).toContainText(
            /error|invalid|required|price|isbn|date|title|author|genre/i,
        );
        return;
    }

    const field = addBookPage.fieldByName(fieldName);
    const validationMessage = await field
        .evaluate((element) => (element as HTMLInputElement).validationMessage ?? '')
        .catch(() => '');

    expect(validationMessage.trim().length).toBeGreaterThan(0);
}

export async function assertAddBookValidationMessage(
    addBookPage: AddBookPage,
    expectedMessage: string,
): Promise<void> {
    logger.info(`Verifying add-book validation message: ${expectedMessage}`);
    const alertBlock = addBookPage.errorAlertBlock();

    if (await alertBlock.isVisible().catch(() => false)) {
        const actualText = (
            (await alertBlock.textContent().catch(() => '')) ?? ''
        ).trim();

        if (ValidationMessageMapper.isEquivalentMessage(actualText, expectedMessage)) {
            logger.debug('Validation message matched using equivalent pattern');
            return;
        }

        await expect(alertBlock).toContainText(expectedMessage);
        return;
    }

    await expect(addBookPage.getBodyLocator()).toContainText(expectedMessage);
}

export async function getCurrentRequiredAddBookErrors(
    addBookPage: AddBookPage,
): Promise<RequiredAddBookError[]> {
    const currentValues = await Promise.all(
        REQUIRED_ADD_BOOK_ERRORS.map(async ({field, message}) => {
            const locator = addBookPage.fieldByName(field);
            const value = await locator
                .evaluate((element) => {
                    if (element instanceof HTMLSelectElement) {
                        return (element.value ?? '').trim();
                    }

                    return ((element as HTMLInputElement).value ?? '').trim();
                })
                .catch(() => '');

            return {
                field,
                message,
                isMissing: value.length === 0,
            };
        }),
    );

    return currentValues
        .filter((entry) => entry.isMissing)
        .map(({field, message}) => ({field, message}));
}

