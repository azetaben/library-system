import {DataTable, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/runtime/index.ts';
import {testData} from '../utils/data/index.ts';

Then(
    'I should see the following error login messages:',
    async function (this: CustomWorld, dataTable: DataTable) {
        const expectedErrors = dataTable.raw().flat().map((value) => value.trim()).filter(Boolean);
        const body = this.pm.getLoginPage().getBodyLocator();

        for (const errorText of expectedErrors) {
            await expect(body).toContainText(errorText);
            logger.info(`Verified login error message: "${errorText}"`);
        }
    },
);

Then(
    'I should see {string} alert:',
    async function (this: CustomWorld, _label: string, dataTable: DataTable) {
        const bodyText = ((await this.pm.getLoginPage().getBodyLocator().textContent()) ?? '').trim();
        const rawRows = dataTable.raw();
        const candidateGroups =
            rawRows.length > 1 && rawRows[0].length === 1
                ? rawRows.slice(1).map((row) => row[0]?.trim()).filter(Boolean)
                : rawRows.flat().map((value) => value.trim()).filter(Boolean);

        for (const group of candidateGroups) {
            const candidates = group.split(/\s+OR\s+/i).map((value) => value.trim()).filter(Boolean);
            const matchedCandidate = candidates.find((candidate) => bodyText.includes(candidate));
            expect(
                matchedCandidate,
                `Expected one of [${candidates.join(', ')}] to be visible in the page body, but none matched.`,
            ).toBeTruthy();
        }
    },
);

Then(
    'I should see {string} alert',
    async function (this: CustomWorld, candidateGroup: string) {
        const bodyText = ((await this.pm.getLoginPage().getBodyLocator().textContent()) ?? '').trim();
        const candidates = candidateGroup.split(/\s+OR\s+/i).map((value) => value.trim()).filter(Boolean);
        const matchedCandidate = candidates.find((candidate) => bodyText.includes(candidate));
        expect(
            matchedCandidate,
            `Expected one of [${candidates.join(', ')}] to be visible in the page body, but none matched.`,
        ).toBeTruthy();
    },
);

Then(
    'the page URL should not contain any SQL keywords',
    async function (this: CustomWorld) {
        const url = this.page.url().toLowerCase();
        const sqlKeywords = ['select', 'insert', 'update', 'delete', 'drop', 'union', 'where', 'truncate'];

        for (const keyword of sqlKeywords) {
            expect(url).not.toContain(keyword);
        }
    },
);

Then(
    'no alert should be triggered by the payload',
    async function (this: CustomWorld) {
        await this.page.waitForTimeout(1000);
        expect(this.securityDialogMessages ?? []).toEqual([]);
    },
);

Then(
    'the password field should have the type {string}',
    async function (this: CustomWorld, expectedType: string) {
        const type = await this.pm.getLoginPage().getPasswordInput().getAttribute('type');
        expect(type).toBe(expectedType);
    },
);

Then(
    'any typed character in the password field should be masked',
    async function (this: CustomWorld) {
        const passwordField = this.pm.getLoginPage().getPasswordInput();
        await passwordField.fill(testData.validUser.password);
        const type = await passwordField.getAttribute('type');
        expect(type).toBe('password');
    },
);

Then(
    'I should see a generic error message {string}',
    async function (this: CustomWorld, expectedError: string) {
        await expect(this.pm.getLoginPage().getErrorMessage()).toContainText(expectedError);
    },
);

Then(
    'the error message should not indicate whether the username or password was incorrect',
    async function (this: CustomWorld) {
        const actualError = await this.pm.getLoginPage().getErrorMessage().textContent();
        const loweredError = actualError?.toLowerCase() || '';
        const isSpecific =
            loweredError.includes('user not found') ||
            loweredError.includes('invalid password');

        expect(isSpecific).toBeFalsy();
    },
);

Then(
    'session cookies should have {string} and {string} flags enabled',
    async function (this: CustomWorld, flag1: string, flag2: string) {
        const cookies = await this.context.cookies();
        const sessionCookies = cookies.filter((cookie) =>
            /session|customer|phpsessid/i.test(cookie.name),
        );

        if (sessionCookies.length === 0) {
            logger.warn('No session cookies found to validate.');
            return;
        }

        for (const cookie of sessionCookies) {
            if (flag1 === 'HttpOnly' || flag2 === 'HttpOnly') {
                expect(cookie.httpOnly).toBeTruthy();
            }

            if ((flag1 === 'Secure' || flag2 === 'Secure') && this.page.url().startsWith('https')) {
                expect(cookie.secure).toBeTruthy();
            }
        }
    },
);
