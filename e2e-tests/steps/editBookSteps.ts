import {DataTable, Given, Then, When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {testData} from '../utils/TestData.ts';
import {logger} from '../utils/Logger.ts';
import type {EditBookFormData} from '../pages/EditBookPage.ts';
import {
    assertEditBookButtonClickable,
    assertEditBookFieldsPrefilledAndEditable,
    assertEditBookFieldsVisibleAndFillable,
    assertEditBookNativeValidationMessage,
    assertEditBookPageLoaded,
} from './editBookAssertions.ts';
import {appData} from '../utils/AppData.ts';

const editBookPage = (world: CustomWorld) => world.pm.getEditBookPage();

type UpdatedBookDetails = {
    title: string;
    author: string;
    genre: string;
    isbn: string;
    publicationDate: string;
    price: string;
};

When(
    'the user updates the book with valid details',
    async function (this: CustomWorld) {
        const updatedTitle = `${testData.validBook.title} Updated`;
        logger.info(`Action: Updating a book with new title: "${updatedTitle}"...`);
        const currentEditBookPage = this.pm.getEditBookPage();

        try {
            await currentEditBookPage.updateBook(
                updatedTitle,
                testData.validBook.author,
                testData.validBook.genre,
            );
            logger.info('Success: Book successfully updated.');
        } catch (error: any) {
            logger.error(`Failed to update book details: ${error.message}`);
            throw error;
        }
    },
);

When(
    'the user clicks cancel on the edit book page',
    async function (this: CustomWorld) {
        logger.info('Action: Clicking the Cancel button on the edit book page...');
        const currentEditBookPage = this.pm.getEditBookPage();

        try {
            await currentEditBookPage.clickCancel();
            logger.info('Success: Cancel button clicked.');
        } catch (error: any) {
            logger.error(`Failed to click the Cancel button: ${error.message}`);
            throw error;
        }
    },
);

Given(
    'I am in the {string} page',
    async function (this: CustomWorld, pageName: string) {
        logger.info(`Navigating to page: ${pageName}`);

        if (pageName === 'Edit book details') {
            await assertEditBookPageLoaded(editBookPage(this));
            return;
        }

        if (pageName === appData.headings.addBook) {
            await this.pm.getAddBookPage().header().waitFor();
            return;
        }

        throw new Error(`Unsupported page: ${pageName}`);
    },
);

When(
    'I fill and submit the edit book form:',
    async function (this: CustomWorld, table: DataTable) {
        (this as CustomWorld & { activeBookFormName?: string }).activeBookFormName =
            'edit book';
        const [data] = table.hashes() as unknown as EditBookFormData[];
        (
            this as CustomWorld & {
                updatedBookDetails?: UpdatedBookDetails;
            }
        ).updatedBookDetails = {
            title: data.Title,
            author: data.Author,
            genre: data.Genre,
            isbn: data.ISBN,
            publicationDate: data['Publication Date'],
            price: data.Price,
        };
        await editBookPage(this).fillAndSubmitForm(data);
    },
);

Then(
    'I verify the edit book input fields are visible and fillable',
    async function (this: CustomWorld) {
        await assertEditBookFieldsVisibleAndFillable(editBookPage(this));
    },
);

Then(
    'I verify the {string} button is visible and clickable',
    async function (this: CustomWorld, buttonName: string) {
        await assertEditBookButtonClickable(editBookPage(this), buttonName);
    },
);

Then(
    'I should see 6 pre-filled editable edit book fields',
    async function (this: CustomWorld) {
        await assertEditBookFieldsPrefilledAndEditable(editBookPage(this));
    },
);

When(
    'I clear the {string} field',
    async function (this: CustomWorld, fieldName: string) {
        await editBookPage(this).clearField(fieldName);
    },
);

When(
    'I click the {string} button',
    async function (this: CustomWorld, buttonName: string) {
        await editBookPage(this).clickButton(buttonName);
    },
);

Then(
    'I verify the {string} field validation message is displayed',
    async function (this: CustomWorld, fieldName: string) {
        await assertEditBookNativeValidationMessage(editBookPage(this), fieldName);
    },
);
