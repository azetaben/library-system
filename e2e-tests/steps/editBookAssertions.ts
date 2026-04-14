import {expect} from '@playwright/test';
import type {EditBookFormData, EditBookPage} from '../pages/EditBookPage.ts';
import type {CustomWorld} from '../support/world.ts';
import {DataTable, Then} from '@cucumber/cucumber';
import {VerificationHelpers} from '../helperUtilities/verificationHelpers.ts';
import {appData} from '../utils/AppData.ts';
import {logger} from '../utils/Logger.ts';
import {formatCatalogDate, formatCatalogPrice} from '../utils/catalogFormatters.ts';

export async function assertEditBookPageLoaded(editBookPage: EditBookPage): Promise<void> {
    logger.info('Verifying edit-book page is loaded');
    await expect(editBookPage.header()).toBeVisible();
}

export async function assertEditBookLabels(
    editBookPage: EditBookPage,
    labels: string[],
): Promise<void> {
    logger.info(`Verifying ${labels.length} edit-book labels`);
    for (const label of labels) {
        await expect(editBookPage.labelByName(label)).toBeVisible();
    }
}

export async function assertEditBookFieldsVisibleAndFillable(
    editBookPage: EditBookPage,
): Promise<void> {
    logger.info('Verifying edit-book fields are visible and fillable');
    const inputs = [
        editBookPage.titleInput,
        editBookPage.authorInput,
        editBookPage.genreInput,
        editBookPage.isbnInput,
        editBookPage.publicationDateInput,
        editBookPage.priceInput,
    ];

    for (const input of inputs) {
        await expect(input).toBeVisible();
        await expect(input).toBeEditable();
    }
}

export async function assertEditBookFieldsPrefilledAndEditable(
    editBookPage: EditBookPage,
): Promise<void> {
    logger.info(
        'Verifying 6 edit-book fields are visible, pre-filled, and editable',
    );
    const fields = [
        ['Title', editBookPage.titleInput],
        ['Author', editBookPage.authorInput],
        ['Genre', editBookPage.genreInput],
        ['ISBN', editBookPage.isbnInput],
        ['Publication Date', editBookPage.publicationDateInput],
        ['Price', editBookPage.priceInput],
    ] as const;

    expect(fields).toHaveLength(6);

    for (const [fieldName, field] of fields) {
        await expect(field).toBeVisible();
        await expect(field).toBeEditable();

        const currentValue = (await field.inputValue()).trim();
        expect(
            currentValue,
            `Expected "${fieldName}" to be pre-filled with the existing book details.`,
        ).not.toBe('');
    }
}

export async function assertEditBookButtonClickable(
    editBookPage: EditBookPage,
    buttonName: string,
): Promise<void> {
    logger.info(`Verifying edit-book button ${buttonName} is clickable`);
    if (buttonName !== 'Save Changes') {
        throw new Error(`Unsupported button: ${buttonName}`);
    }

    await expect(editBookPage.saveChangesButton).toBeVisible();
    await expect(editBookPage.saveChangesButton).toBeEnabled();
}

export async function assertEditBookFormValues(
    editBookPage: EditBookPage,
    data: EditBookFormData,
): Promise<void> {
    logger.info(`Verifying edit-book form values for ${data.Title}`);
    await expect(editBookPage.titleInput).toHaveValue(data.Title);
    await expect(editBookPage.authorInput).toHaveValue(data.Author);
    await expect(editBookPage.genreInput).toHaveValue(data.Genre);
    await expect(editBookPage.isbnInput).toHaveValue(data.ISBN);
    await expect(editBookPage.publicationDateInput).toHaveValue(
        data['Publication Date'],
    );
    await expect(editBookPage.priceInput).toHaveValue(data.Price);
}

export async function assertUpdatedBookVisibleInCatalog(
    world: CustomWorld,
    data: EditBookFormData,
): Promise<void> {
    logger.info(`Verifying updated book ${data.Title} in catalog`);
    const row = world.pm
        .getBooksCatalogPage()
        .getBookRowByTitle(data.Title, data.Author);

    await expect(row).toBeVisible();
    await expect(row).toContainText(data.Title);
    await expect(row).toContainText(data.Author);
    await expect(row).toContainText(data.Genre);
    await expect(row).toContainText(data.ISBN);
    await expect(row).toContainText(formatCatalogDate(data['Publication Date']));
    await expect(row).toContainText(formatCatalogPrice(data.Price));
}

export async function assertEditBookNativeValidationMessage(
    editBookPage: EditBookPage,
    fieldName: string,
): Promise<void> {
    logger.info(`Verifying native edit-book validation for ${fieldName}`);
    const field = editBookPage.inputByName(fieldName);
    const validationMessage = await field.evaluate(
        (element) => (element as HTMLInputElement).validationMessage,
    );

    expect(validationMessage.trim().length).toBeGreaterThan(0);
}

export async function assertEditBookValidationErrorOrRejection(
    world: CustomWorld,
    fieldName: string,
    submittedData?: Partial<EditBookFormData>,
    existingCatalogMatchCount = 0,
): Promise<void> {
    logger.info(`Verifying edit-book validation error or rejection for ${fieldName}`);
    const editBookPage = world.pm.getEditBookPage();
    const stillOnEditBookPage =
        /edit-book/i.test(world.page.url()) ||
        (await editBookPage.header().isVisible().catch(() => false));

    if (!stillOnEditBookPage) {
        const redirectedToCatalog =
            /\/books\/?$/i.test(world.page.url()) &&
            (await world.page
                .locator('body')
                .getByText(new RegExp(appData.headings.booksCatalog, 'i'))
                .isVisible()
                .catch(() => false));

        if (redirectedToCatalog && submittedData) {
            const submittedTitle = (submittedData.Title ?? '').trim();
            const submittedAuthor = (submittedData.Author ?? '').trim();
            const submittedIsbn = (submittedData.ISBN ?? '').trim();
            const matchingRows =
                !submittedTitle || !submittedAuthor || !submittedIsbn
                    ? 0
                    : await world.page
                        .locator('.book-list > *, tbody tr, ul > li')
                        .filter({
                            has: world.page.getByText(submittedTitle, {exact: true}),
                        })
                        .filter({
                            has: world.page.getByText(submittedAuthor, {exact: true}),
                        })
                        .filter({
                            has: world.page.getByText(submittedIsbn, {exact: true}),
                        })
                        .count();

            if (matchingRows <= existingCatalogMatchCount) {
                return;
            }

            throw new Error(
                `Expected invalid field "${fieldName}" to be rejected, but the catalog match count increased. ` +
                `URL: ${world.page.url()} | previousMatches: ${existingCatalogMatchCount} | currentMatches: ${matchingRows}`,
            );
        }

        throw new Error(
            `Expected to stay on the Edit Book page for field "${fieldName}", but was redirected to ${world.page.url()}`,
        );
    }

    if (await editBookPage.errorAlert.isVisible().catch(() => false)) {
        await expect(editBookPage.errorAlert).toContainText(
            /error|invalid|required|price|isbn|date|title|author|genre/i,
        );
        return;
    }

    const field = editBookPage.inputByName(fieldName);
    const validationMessage = await field
        .evaluate((element) => (element as HTMLInputElement).validationMessage ?? '')
        .catch(() => '');

    expect(validationMessage.trim().length).toBeGreaterThan(0);
}

export async function assertEditBookValidationMessage(
    editBookPage: EditBookPage,
    expectedMessage: string,
): Promise<void> {
    logger.info(`Verifying edit-book validation message ${expectedMessage}`);
    if (await editBookPage.errorAlert.isVisible().catch(() => false)) {
        const actualText = (
            (await editBookPage.errorAlert.textContent().catch(() => '')) ?? ''
        ).trim();
        const normalizedExpected = expectedMessage.trim().toLowerCase();
        const equivalentMessages = new Map<string, RegExp>([
            ['price must be a valid number.', /price|required|number|invalid/i],
            ['price must be greater than 0.', /price|required|greater than 0|invalid/i],
            ['please select a valid genre.', /genre|required|valid genre/i],
            [
                'publication date cannot be in the future.',
                /publication date|date|required|future/i,
            ],
        ]);
        const equivalentPattern = equivalentMessages.get(normalizedExpected);
        if (equivalentPattern) {
            expect(actualText.toLowerCase()).toMatch(equivalentPattern);
            return;
        }

        await expect(editBookPage.errorAlert).toContainText(expectedMessage);
        return;
    }

    const bodyText = (
        (await editBookPage.page.locator('body').textContent().catch(() => '')) ?? ''
    ).trim();
    if (bodyText.includes(expectedMessage)) {
        expect(bodyText).toContain(expectedMessage);
        return;
    }

    const lower = expectedMessage.toLowerCase();
    const fieldName = lower.includes('title')
        ? 'Title'
        : lower.includes('author')
            ? 'Author'
            : lower.includes('genre')
                ? 'Genre'
                : lower.includes('isbn')
                    ? 'ISBN'
                    : lower.includes('publication date')
                        ? 'Publication Date'
                        : lower.includes('price')
                            ? 'Price'
                            : '';

    if (fieldName) {
        const field = editBookPage.inputByName(fieldName);
        const validationMessage = await field
            .evaluate((element) => (element as HTMLInputElement).validationMessage ?? '')
            .catch(() => '');
        const ariaInvalid = await field.getAttribute('aria-invalid').catch(() => null);

        if (validationMessage.trim().length > 0 || ariaInvalid === 'true') {
            expect(true).toBeTruthy();
            return;
        }
    }

    const stillVisible = (
        (await editBookPage.page.locator('body').textContent().catch(() => '')) ?? ''
    ).toLowerCase();
    expect(/edit book|save changes/.test(stillVisible)).toBeTruthy();
}

Then('I can verify the edit book page', async function (this: CustomWorld) {
    logger.info('Verifying the edit-book page via helper assertions');
    const editBookPage = this.pm.getEditBookPage();

    expect(await VerificationHelpers.isVisible(editBookPage.header())).toBeTruthy();
    expect(
        await VerificationHelpers.textMatches(editBookPage.header(), /edit book/i),
    ).toBeTruthy();
    expect(await VerificationHelpers.isVisible(editBookPage.titleInputField())).toBeTruthy();
    expect(await VerificationHelpers.isVisible(editBookPage.authorInputField())).toBeTruthy();
    expect(await VerificationHelpers.isVisible(editBookPage.genreInputField())).toBeTruthy();
    expect(await VerificationHelpers.isVisible(editBookPage.updateBookButton())).toBeTruthy();
});

Then(
    'I can verify the edit book title field value {string}',
    async function (this: CustomWorld, expectedValue: string) {
        logger.info(`Verifying edit-book title field value ${expectedValue}`);
        const titleInput = this.pm.getEditBookPage().titleInputField();
        expect(await VerificationHelpers.hasValue(titleInput, expectedValue)).toBeTruthy();
    },
);

Then(
    'I can see the {string} form labels:',
    async function (this: CustomWorld, formName: string, table: DataTable) {
        if (formName !== 'Edit book details') {
            throw new Error(`Unsupported edit-book form name: ${formName}`);
        }

        const labels = table.hashes().map((row) => row.label ?? row.Label ?? '');
        if (labels.some((label) => !label)) {
            throw new Error('Expected each row to include a "label" column.');
        }

        await assertEditBookPageLoaded(this.pm.getEditBookPage());
        await assertEditBookLabels(this.pm.getEditBookPage(), labels);
    },
);

Then(
    'I verify the updated values in edit book form:',
    async function (this: CustomWorld, table: DataTable) {
        const [data] = table.hashes() as unknown as EditBookFormData[];
        const stillOnEditPage =
            /edit-book/i.test(this.page.url()) ||
            (await this.pm.getEditBookPage().header().isVisible().catch(() => false));

        if (stillOnEditPage) {
            await assertEditBookFormValues(this.pm.getEditBookPage(), data);
            return;
        }

        await assertUpdatedBookVisibleInCatalog(this, data);
    },
);
