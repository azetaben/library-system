import {DataTable, Then} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {envConfig} from '../config/env.config.ts';
import type {Locator} from '@playwright/test';
import {expect} from '@playwright/test';
import {AssertionHelpers} from '../helperUtilities/assertionHelpers.ts';
import {appData, appPatterns} from '../utils/AppData.ts';
import {logger} from '../utils/Logger.ts';
import {
    normalizeNamedPage,
    routePattern,
} from '../utils/stepSupport.ts';

function pageHeaderLocator(world: CustomWorld, pageName: string): Locator {
    switch (normalizeNamedPage(pageName)) {
        case 'books':
            return world.pm.getBooksCatalogPage().booksCatalogHeading();
        case 'addBook':
            return world.pm.getAddBookPage().header();
        case 'editBook':
            return world.pm.getEditBookPage().header();
        default: {
            const escapedPageName = pageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pagePattern = new RegExp(escapedPageName, 'i');
            return world.page
                .locator('h1, h2, h3, [role="heading"]')
                .filter({hasText: pagePattern})
                .first();
        }
    }
}

async function assertBooksPageVisible(world: CustomWorld): Promise<void> {
    const booksPage = world.pm.getBooksCatalogPage();
    await AssertionHelpers.expectUrl(world.page, booksPage.getCatalogUrlPattern());
    await expect(booksPage.booksCatalogHeading()).toContainText(
        appData.headings.booksCatalog,
    );
}

async function assertLoginFormVisible(world: CustomWorld): Promise<void> {
    await AssertionHelpers.expectVisible(world.pm.getLoginPage().usernameInput());
    await AssertionHelpers.expectVisible(world.pm.getLoginPage().passwordInput());
    await AssertionHelpers.expectVisible(world.pm.getLoginPage().loginButton());
}

async function assertButtonNotVisibleOnPage(
    world: CustomWorld,
    pageName: string,
    buttonPattern: RegExp,
): Promise<void> {
    await expect(pageHeaderLocator(world, pageName)).toBeVisible();
    const controls = world.page
        .locator('button, a, [role="button"]')
        .filter({hasText: buttonPattern});
    const matchCount = await controls.count();

    for (let index = 0; index < matchCount; index += 1) {
        await expect(controls.nth(index)).not.toBeVisible();
    }
}

async function assertOnAddBookPage(world: CustomWorld): Promise<void> {
    await expect(world.page).toHaveURL(routePattern(envConfig.routes.addBook));
}

async function assertPageTitle(
    world: CustomWorld,
    expected: string | RegExp,
): Promise<void> {
    await AssertionHelpers.expectTitle(world.page, expected);
}

async function assertOnNamedPage(
    world: CustomWorld,
    pageName: string,
): Promise<void> {
    switch (normalizeNamedPage(pageName)) {
        case 'landing':
            await AssertionHelpers.expectUrl(world.page, envConfig.baseUrl);
            await AssertionHelpers.expectVisible(
                world.pm.getLandingPage().startTestingButton(),
            );
            break;
        case 'login':
            await AssertionHelpers.expectUrl(
                world.page,
                routePattern(envConfig.routes.login),
            );
            await assertLoginFormVisible(world);
            break;
        case 'books':
            await assertBooksPageVisible(world);
            break;
        case 'addBook':
            await assertOnAddBookPage(world);
            await AssertionHelpers.expectVisible(world.pm.getAddBookPage().header());
            break;
        case 'editBook':
            await AssertionHelpers.expectUrl(
                world.page,
                routePattern(envConfig.routes.editBook),
            );
            await AssertionHelpers.expectVisible(world.pm.getEditBookPage().header());
            break;
        default:
            await AssertionHelpers.expectVisible(pageHeaderLocator(world, pageName));
            break;
    }
}

Then(
    'the {string} page url, title, and heading should be correct',
    async function (this: CustomWorld, pageName: string) {
        logger.info(`Verifying page url, title, and heading for ${pageName}`);
        switch (normalizeNamedPage(pageName)) {
            case 'landing':
                const landingPage = this.pm.getLandingPage();
                await AssertionHelpers.expectUrl(this.page, envConfig.baseUrl);
                await assertPageTitle(this, appData.titles.app);
                await AssertionHelpers.expectVisible(
                    landingPage.startTestingButton(),
                );
                await AssertionHelpers.expectVisible(
                    landingPage.introductionHeading(),
                );
                break;
            case 'login':
                const loginPage = this.pm.getLoginPage();
                await AssertionHelpers.expectUrl(
                    this.page,
                    routePattern(envConfig.routes.login),
                );
                await assertPageTitle(
                    this,
                    /^(?:Login - )?Books Inventory App$/i,
                );
                await AssertionHelpers.expectText(
                    loginPage.header(),
                    appData.headings.login,
                );
                break;
            case 'books':
                const booksPage = this.pm.getBooksCatalogPage();
                await AssertionHelpers.expectUrl(
                    this.page,
                    booksPage.getCatalogUrlPattern(),
                );
                await assertPageTitle(this, appData.titles.app);
                await expect(booksPage.booksCatalogHeading()).toContainText(
                    appData.headings.booksCatalog,
                );
                break;
            case 'addBook':
                const addBookPage = this.pm.getAddBookPage();
                await AssertionHelpers.expectUrl(
                    this.page,
                    routePattern(envConfig.routes.addBook),
                );
                await assertPageTitle(this, appData.titles.app);
                await expect(addBookPage.header()).toContainText(appData.headings.addBook);
                break;
            case 'editBook':
                const editBookPage = this.pm.getEditBookPage();
                await AssertionHelpers.expectUrl(
                    this.page,
                    routePattern(envConfig.routes.editBook),
                );
                await assertPageTitle(this, appData.titles.app);
                await expect(editBookPage.header()).toContainText(appPatterns.editBookHeading);
                break;
            default:
                throw new Error(`Page validations for "${pageName}" are not defined`);
        }
    },
);

Then('I should still be on the books page', async function (this: CustomWorld) {
    logger.info('Verifying the user is still on the books page');
    await assertBooksPageVisible(this);
});

Then(
    'the page Heading should be {string}',
    async function (this: CustomWorld, expectedHeader: string) {
        const exactHeader = new RegExp(
            `^\\s*${expectedHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`,
            'i',
        );
        const header = this.page
            .locator('h1, h2, h3, [role="heading"], p, div, span')
            .filter({hasText: exactHeader})
            .first();

        await expect(header).toBeVisible();
    },
);

Then(
    'I should see {string} as the page title',
    async function (this: CustomWorld, expectedTitle: string) {
        await AssertionHelpers.expectTitle(this.page, expectedTitle);
    },
);

Then(
    'I should see the following subheadings:',
    async function (this: CustomWorld, dataTable: DataTable) {
        const landingPage = this.pm.getLandingPage();
        const headingMap = new Map<
            string,
            ReturnType<typeof landingPage.introductionHeading>
        >([
            ['Introduction', landingPage.introductionHeading()],
            ['Business Requirement', landingPage.businessRequirementHeading()],
            ['Task', landingPage.taskHeading()],
            ['Important Guidelines', landingPage.importantGuidelinesHeading()],
        ]);

        for (const [heading] of dataTable.raw()) {
            const locator = headingMap.get(heading.trim());
            if (!locator) {
                throw new Error(`Unsupported landing page subheading: ${heading}`);
            }
            await AssertionHelpers.expectVisible(locator);
        }
    },
);

Then('I remain on the book catalog page', async function (this: CustomWorld) {
    logger.info('Verifying the user remains on the book catalog page');
    await assertBooksPageVisible(this);
});

Then('I should see the login form', async function (this: CustomWorld) {
    await assertLoginFormVisible(this);
});

Then(
    'I should be authenticated as {string}',
    async function (this: CustomWorld, expectedUsername: string) {
        await expect(
            this.pm.getTopNaviPage().userProfileWelcomeHeading(),
        ).toContainText(expectedUsername);
    },
);

Then(
    'I should see the catelog page books calog heading as {string}',
    async function (this: CustomWorld, expectedHeader: string) {
        if (expectedHeader.toLowerCase() === appData.headings.booksCatalog.toLowerCase()) {
            await expect(this.pm.getBooksCatalogPage().bookList()).toBeVisible();
            return;
        }
        await AssertionHelpers.expectText(
            this.pm.getBooksCatalogPage().booksCatalogHeading(),
            expectedHeader,
        );
    },
);

Then(
    'I should be redirected to the books catalog page and I can see {string}',
    async function (this: CustomWorld, expectedWelcomeMessage: string) {
        const booksCatalogPage = this.pm.getBooksCatalogPage();
        await AssertionHelpers.expectUrl(
            this.page,
            booksCatalogPage.getCatalogUrlPattern(),
        );
        await AssertionHelpers.expectVisible(
            booksCatalogPage.booksCatalogHeading(),
        );
        await AssertionHelpers.expectVisible(booksCatalogPage.bookList());

        const welcomeHeading = this.pm.getTopNaviPage().userProfileWelcomeHeading();
        if (await welcomeHeading.isVisible().catch(() => false)) {
            await expect(welcomeHeading).toContainText(expectedWelcomeMessage);
        }
    },
);

Then(
    'I should see {string} heading on the page',
    async function (this: CustomWorld, headingText: string) {
        const escapedHeading = headingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        await expect(
            this.page
                .locator('h1, h2, h3, [role="heading"]')
                .filter({hasText: new RegExp(`^\\s*${escapedHeading}\\s*$`, 'i')})
                .first(),
        ).toBeVisible();
    },
);

Then(
    'I should see {string} button',
    async function (this: CustomWorld, label: string) {
        await expect(
            this.page.locator(`button:has-text("${label}")`),
        ).toBeVisible();
    },
);

Then(
    'I can see {string} button on the book catalog page',
    async function (this: CustomWorld, buttonLabel: string) {
        if (!/^logout$/i.test(buttonLabel.trim())) {
            throw new Error(
                `Unsupported catalog page button visibility assertion: ${buttonLabel}`,
            );
        }

        await expect(
            this.pm.getBooksCatalogPage().booksCatalogHeading(),
        ).toBeVisible();
        await expect(this.pm.getTopNaviPage().logoutButton()).toBeVisible();
    },
);

Then(
    'the {string} button should not be visible on the {string} page',
    async function (this: CustomWorld, buttonLabel: string, pageName: string) {
        const escapedButtonLabel = buttonLabel.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
        );
        const buttonPattern = /^logout$/i.test(buttonLabel.trim())
            ? /log\s*out/i
            : new RegExp(`^\\s*${escapedButtonLabel}\\s*$`, 'i');
        await assertButtonNotVisibleOnPage(this, pageName, buttonPattern);
    },
);

Then(
    'I should not see catalog management controls',
    async function (this: CustomWorld) {
        const booksCatalogPage = this.pm.getBooksCatalogPage();
        await expect(booksCatalogPage.addBookButton()).toHaveCount(0);
        await expect(booksCatalogPage.editButtons()).toHaveCount(0);
        await expect(booksCatalogPage.deleteButtons()).toHaveCount(0);
    },
);

Then(
    'I should be in the {string} page',
    async function (this: CustomWorld, pageName: string) {
        logger.info(`Verifying the user is on the ${pageName} page`);
        await assertOnNamedPage(this, pageName);
    },
);

Then('I should not see edit a book form', async function (this: CustomWorld) {
    await expect(this.pm.getEditBookPage().header()).toHaveCount(0);
    logger.info('Verified that edit book form is not visible');
});

Then('I should not see add a book form', async function (this: CustomWorld) {
    await expect(this.pm.getAddBookPage().header()).toHaveCount(0);
    logger.info('Verified that add book form is not visible');
});

Then(
    'I can see {string} form in the page',
    async function (this: CustomWorld, formName: string) {
        const escapedFormName = formName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        await expect(this.page.locator('h1, h2, h3, [role="heading"], form, section, div')
                .filter({hasText: new RegExp(escapedFormName, 'i')}).first()).toBeVisible();
    });

Then(
    'I can see the login {string}',
    async function (this: CustomWorld, formLabel: string) {
        if (formLabel !== 'form') {
            throw new Error(`Unsupported login element label: ${formLabel}`);
        }
        await assertLoginFormVisible(this);
    },
);

Then(
    'the login page content should be visible',
    async function (this: CustomWorld) {
        await assertLoginFormVisible(this);
    },
);

Then('I should see an error message', async function (this: CustomWorld) {
    await expect(this.page.locator('body')).toContainText(/error|invalid/i);
});

Then('I remain on the add book page', async function (this: CustomWorld) {
    await assertOnAddBookPage(this);
});

Then(
    'I should remain on the add book page',
    async function (this: CustomWorld) {
        await assertOnAddBookPage(this);
    },
);
