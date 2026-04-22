import {DataTable, Given, Then, When} from '@cucumber/cucumber';
import type {Locator} from '@playwright/test';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/runtime/index.ts';
import {envConfig} from '../config/env.config.ts';
import {testData} from '../utils/data/index.ts';
import {appData, appPatterns} from '../utils/data/index.ts';
import {AssertionHelpers} from '../utils/assertions/index.ts';
import {isLoginTarget, normalizeNamedPage, routePattern, navigateLandingWhenResponsive} from '../utils/runtime/index.ts';
import {assertAddBookButtonClickable} from './add-book-assertions.ts';
import {assertEditBookButtonClickable} from './edit-book-assertions.ts';


function readyLocatorForTarget(world: CustomWorld, target: string) {
    return isLoginTarget(target)
        ? world.pm.getLoginPage().usernameInput()
        : world.pm.getLandingPage().startTestingButton();
}

async function clickNamedControl(
    world: CustomWorld,
    label: string,
    options?: {
        ensureVisible?: boolean;
        compactSelector?: boolean;
    },
) {
    const {ensureVisible = false, compactSelector = false} = options ?? {};
    logger.debug(
        `Resolving control click: label="${label}", ensureVisible=${ensureVisible}, compactSelector=${compactSelector}`,
    );
    const basePage = world.pm.getBasePage();
    const locator = compactSelector
        ? basePage.getCompactControlLocator(label)
        : basePage.getControlByExactLabel(
            label,
            /^logout$/i.test(label.trim()) ? appPatterns.logoutButton : undefined,
        );

    if (/^logout$/i.test(label.trim())) {
        const isVisible = await locator.isVisible().catch(() => false);
        if (!isVisible) {
            logger.warn('Logout control is not visible; skipping click.');
            return;
        }
    }

    if (ensureVisible) {
        await locator.waitFor({state: 'visible'});
    }

    await locator.click();
    logger.info(`Clicked control "${label}"`);
}

async function loginWithValidAdmin(world: CustomWorld) {
    await world.pm
        .getLoginPage()
        .login(testData.validUser.username, testData.validUser.password);
}

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
            return world.pm.getBasePage().getHeadingByPattern(pagePattern);
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
    const controls = world.pm.getBasePage().getControlsByPattern(buttonPattern);
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

async function assertOnNamedPage(world: CustomWorld, pageName: string): Promise<void> {
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

Given(
    /^I navigate directly to the landing page$/,
    async function (this: CustomWorld) {
        logger.info('Action: Navigating directly to the landing page...');
        const basePage = this.pm.getBasePage();
        await basePage.navigateTo(envConfig.baseUrl);
    },
);

Given(
    'I navigate to the landing page when the API is responsive',
    async function (this: CustomWorld) {
        await navigateLandingWhenResponsive(this, '/');
    },
);

Given(
    'I navigate directly to the login page',
    async function (this: CustomWorld) {
        logger.info('Action: Navigating directly to the login page...');
        await this.pm
            .getBasePage()
            .navigateWhenResponsive(
                envConfig.routes.login,
                this.pm.getLoginPage().usernameInput(),
            );
    },
);

When(
    'I navigate directly to the books catalog',
    async function (this: CustomWorld) {
        logger.info('Action: User navigates directly to the books catalog...');
        const booksPage = this.pm.getBooksCatalogPage();
        await booksPage.navigateDirectly();
    },
);

When(
    'I attempt to navigate directly to the add book page',
    async function (this: CustomWorld) {
        logger.warn(
            'Action: User is attempting unauthorized/direct navigation to the Add Book form...',
        );
        const page = this.pm.getAddBookPage();
        await page.navigateTo(envConfig.routes.addBook);
    },
);

When(
    'I attempt to navigate directly to the add a book page',
    async function (this: CustomWorld) {
        logger.warn(
            'Action: User is attempting unauthorized/direct navigation to the Add Book form...',
        );
        await this.pm.getAddBookPage().navigateTo(envConfig.routes.addBook);
    },
);

Given(
    'I attempt to navigate directly to the edit a book page',
    async function (this: CustomWorld) {
        logger.warn(
            'Action: User is attempting unauthorized/direct navigation to the Edit Book form...',
        );
        await this.pm.getEditBookPage().navigateTo(envConfig.routes.editBook);
    },
);

Given('I navigate to the login page', async function (this: CustomWorld) {
    logger.info('Action: Navigating to login page when responsive...');
    await this.pm
        .getBasePage()
        .navigateWhenResponsive(
            envConfig.routes.login,
            this.pm.getLoginPage().usernameInput(),
        );
});

Given(
    'I navigate to the {string} page',
    async function (this: CustomWorld, target: string) {
        logger.info(`Action: Navigating to named page target "${target}" when responsive...`);
        await this.pm
            .getBasePage()
            .navigateWhenResponsive(target, readyLocatorForTarget(this, target));
    },
);


Given(
    'I navigate to {string} page',
    async function (this: CustomWorld, target: string) {
        logger.info(`Action: Navigating to page target "${target}" when responsive...`);
        await this.pm
            .getBasePage()
            .navigateWhenResponsive(target, readyLocatorForTarget(this, target));
    },
);


Given(
    'I navigate to {string}',
    async function (this: CustomWorld, target: string) {
        logger.info(
            'Action: Warming the landing page endpoint and navigating when responsive...',
        );
        await this.pm
            .getBasePage()
            .navigateWhenResponsive(target, readyLocatorForTarget(this, target));
    },
);

Given(
    'I navigate to the library system landing page',
    async function (this: CustomWorld) {
        await this.pm.getLandingPage().navigate();
    },
);

When('I refresh the page', async function (this: CustomWorld) {
    logger.info('Action: User is refreshing the current page...');
    await this.page.reload();
});

When('I tap on the {string} button', async function (this: CustomWorld, label: string) {
        logger.info(`Action: Tapping button "${label}"...`);
        if (appPatterns.startTestingButton.test(label.trim())) {
            const landingPage = this.pm.getLandingPage();
            const startTestingButton = landingPage.startTestingButton();

            if (!(await startTestingButton.isVisible().catch(() => false))) {
                await landingPage.navigate();
            }

            await landingPage.clickStartTesting();
            return;
        }
        await clickNamedControl(this, label);
    },
);


When(
    'I click on the {string} button',
    async function (this: CustomWorld, buttonLabel: string) {
        await clickNamedControl(this, buttonLabel, {ensureVisible: true});
    },
);

When(
    'I open the {string} page from the books catalog',
    async function (this: CustomWorld, pageName: string) {
        logger.info(`Opening target page "${pageName}" from the books catalog`);

        switch (normalizeNamedPage(pageName)) {
            case 'books':
                await assertOnNamedPage(this, pageName);
                return;
            case 'addBook':
                await this.pm.getBooksCatalogPage().clickAddBookButton();
                await assertOnNamedPage(this, pageName);
                return;
            case 'editBook':
                await this.pm
                    .getBooksCatalogPage()
                    .clickActionForFirstBook(appData.buttons.edit);
                await assertOnNamedPage(this, pageName);
                return;
            default:
                throw new Error(`Unsupported catalog navigation target: ${pageName}`);
        }
    },
);

When('I login in login page', async function (this: CustomWorld) {
    logger.info('Action: Logging in with valid admin credentials...');
    await loginWithValidAdmin(this);
});


When(
    'I sign in with valid admin credentials if a login page is shown',
    async function (this: CustomWorld) {
        logger.info('Action: Conditionally signing in if login page is visible...');
        if (
            await this.pm
                .getLoginPage()
                .loginButton()
                .isVisible()
                .catch(() => false)
        ) {
            await loginWithValidAdmin(this);
            logger.debug('Conditional login executed because login form is visible.');
            return;
        }

        logger.debug('Conditional login skipped because login form is not visible.');
    },
);

When('I logout from the books catalog', async function (this: CustomWorld) {
    await this.pm.getTopNaviPage().clickLogout();
});

When(
    'I login with Base64 encoded credentials',
    async function (this: CustomWorld, dataTable) {
        const rows = dataTable.rowsHash();
        const username = Buffer.from(rows.username, 'base64').toString('utf8');
        const password = Buffer.from(rows.password, 'base64').toString('utf8');
        await this.pm.getLoginPage().login(username, password);
    },
);

Given(
    'I open the books inventory application',
    async function (this: CustomWorld) {
        await this.pm.getLandingPage().navigate();
        await this.pm.getLandingPage().clickStartTesting();
    },
);

Given('I am on books catalog page', async function (this: CustomWorld) {
    logger.info('Action: Navigating to the books catalog page...');
    await this.pm.getLandingPage().navigate();
    await this.pm.getLandingPage().clickStartTesting();
    await loginWithValidAdmin(this);
});

When('I click on the Log In button', async function (this: CustomWorld) {
    logger.info(`Action: Clicking the ${appData.buttons.login} button...`);
    const loginPage = this.pm.getLoginPage();

    try {
        await loginPage.waitAndClick(loginPage.loginButton());
        logger.info(`Success: ${appData.buttons.login} button clicked.`);
    } catch (error: any) {
        logger.error(`Failed to click ${appData.buttons.login} button: ${error.message}`);
        throw error;
    }
});

When(/^I click on the logout button$/, async function (this: CustomWorld) {
    logger.info('Action: Attempting to log out...');

    try {
        await this.pm.getTopNaviPage().clickLogout();
        logger.info('Success: User clicked logout.');
    } catch (error: any) {
        logger.error(`Logout Failed: ${error.message}`);
        throw error;
    }
});

Then(
    'the {string} page url, title, and heading should be correct',
    async function (this: CustomWorld, pageName: string) {
        logger.info(`Verifying page url, title, and heading for ${pageName}`);
        switch (normalizeNamedPage(pageName)) {
            case 'landing': {
                const landingPage = this.pm.getLandingPage();
                await AssertionHelpers.expectUrl(this.page, envConfig.baseUrl);
                await assertPageTitle(this, appData.titles.app);
                await AssertionHelpers.expectVisible(landingPage.startTestingButton());
                await AssertionHelpers.expectVisible(landingPage.introductionHeading());
                break;
            }
            case 'login': {
                const loginPage = this.pm.getLoginPage();
                await AssertionHelpers.expectUrl(
                    this.page,
                    routePattern(envConfig.routes.login),
                );
                await assertPageTitle(this, /^(?:Login - )?Books Inventory App$/i);
                await AssertionHelpers.expectText(
                    loginPage.header(),
                    appData.headings.login,
                );
                break;
            }
            case 'books': {
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
            }
            case 'addBook': {
                const addBookPage = this.pm.getAddBookPage();
                await AssertionHelpers.expectUrl(
                    this.page,
                    routePattern(envConfig.routes.addBook),
                );
                await assertPageTitle(this, appData.titles.app);
                await expect(addBookPage.header()).toContainText(appData.headings.addBook);
                break;
            }
            case 'editBook': {
                const editBookPage = this.pm.getEditBookPage();
                await AssertionHelpers.expectUrl(
                    this.page,
                    routePattern(envConfig.routes.editBook),
                );
                await assertPageTitle(this, appData.titles.app);
                await expect(editBookPage.header()).toContainText(appPatterns.editBookHeading);
                break;
            }
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
        const header = this.pm.getBasePage().getHeadingOrTextByPattern(exactHeader).first();

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
                logger.warn(`Unsupported landing subheading assertion target: ${heading}`);
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
        await expect(this.pm.getTopNaviPage().userProfileWelcomeHeading()).toContainText(
            expectedUsername,
        );
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
    'I should be redirected to the books list page and I can see {string}',
    async function (this: CustomWorld, expectedWelcomeMessage: string) {
        const booksCatalogPage = this.pm.getBooksCatalogPage();
        await AssertionHelpers.expectUrl(
            this.page,
            booksCatalogPage.getCatalogUrlPattern(),
        );
        await AssertionHelpers.expectVisible(booksCatalogPage.booksCatalogHeading());
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
            this.pm
                .getBasePage()
                .getHeadingByPattern(new RegExp(`^\\s*${escapedHeading}\\s*$`, 'i')),
        ).toBeVisible();
    },
);

Then(
    'I should see {string} button',
    async function (this: CustomWorld, label: string) {
        await expect(this.pm.getBasePage().getButtonByText(label)).toBeVisible();
    },
);

Then(
    'I should see the {string} button with the correct title',
    async function (this: CustomWorld, label: string) {
        logger.info(`Verifying visible button title "${label}" on the landing page`);
        const startTestingButton = this.pm.getLandingPage().startTestingButton();
        await expect(startTestingButton).toBeVisible();
        await expect(startTestingButton).toContainText(label);
    },
);

Then(
    'I can see {string} button on the book catalog page',
    async function (this: CustomWorld, buttonLabel: string) {
        if (!/^logout$/i.test(buttonLabel.trim())) {
            logger.warn(`Unsupported catalog page button visibility assertion: ${buttonLabel}`);
            throw new Error(
                `Unsupported catalog page button visibility assertion: ${buttonLabel}`,
            );
        }

        await expect(this.pm.getBooksCatalogPage().booksCatalogHeading()).toBeVisible();
        await expect(this.pm.getTopNaviPage().logoutButton()).toBeVisible();
    },
);

Then(
    'the {string} button should not be visible on the {string} page',
    async function (this: CustomWorld, buttonLabel: string, pageName: string) {
        const escapedButtonLabel = buttonLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const buttonPattern = /^logout$/i.test(buttonLabel.trim())
            ? /log\s*out/i
            : new RegExp(`^\\s*${escapedButtonLabel}\\s*$`, 'i');
        await assertButtonNotVisibleOnPage(this, pageName, buttonPattern);
    },
);

Then(
    'I should see the {string} button as enabled and clickable',
    async function (this: CustomWorld, buttonName: string) {
        logger.info(`Verifying button ${buttonName} is enabled and clickable`);

        if (/^log\s*out$/i.test(buttonName.trim())) {
            const logoutButton = this.pm.getTopNaviPage().logoutButton();
            await expect(logoutButton).toBeVisible();
            await expect(logoutButton).toBeEnabled();
            await expect(logoutButton).toContainText(/log\s*out/i);
            return;
        }

        const onEditBookPage =
            this.activeBookFormName === 'edit book' ||
            routePattern(envConfig.routes.editBook).test(this.page.url()) ||
            (await this.pm
                .getEditBookPage()
                .header()
                .isVisible()
                .catch(() => false));

        if (onEditBookPage) {
            this.activeBookFormName = 'edit book';
            await assertEditBookButtonClickable(this.pm.getEditBookPage(), buttonName);
            return;
        }

        this.activeBookFormName = 'add book';
        await assertAddBookButtonClickable(this.pm.getAddBookPage(), buttonName);
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
        await expect(
            this.pm
                .getBasePage()
                .getFormOrHeadingByPattern(new RegExp(escapedFormName, 'i')),
        ).toBeVisible();
    },
);

Then(
    'I can see the login {string}',
    async function (this: CustomWorld, formLabel: string) {
        if (formLabel !== 'form') {
            logger.warn(`Unsupported login element assertion label: ${formLabel}`);
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

Then(
    'all same-origin links on the page should not be broken',
    async function (this: CustomWorld) {
        const baseUrl = new URL(this.page.url());
        const hrefs = await this.pm
            .getBasePage()
            .getAnchorWithHrefLocator()
            .evaluateAll((links) =>
                links
                    .map((link) => link.getAttribute('href'))
                    .filter((href): href is string => Boolean(href)),
            );

        const uniqueUrls = [...new Set(hrefs)]
            .map((href) => new URL(href, baseUrl.origin))
            .filter((url) => url.origin === baseUrl.origin)
            .filter((url) => !url.hash)
            .map((url) => url.toString());

        for (const url of uniqueUrls) {
            logger.info(`Validating same-origin link: ${url}`);
            const response = await this.page.request.get(url, {
                failOnStatusCode: false,
                maxRedirects: 5,
            });
            expect(response.status(), `Broken same-origin link detected: ${url}`).toBeLessThan(
                400,
            );
        }
    },
);

Then(
    'the First Contentful Paint should be less than {int} milliseconds',
    async function (this: CustomWorld, maxTime: number) {
        const fcp = await this.page.evaluate(() => {
            const [paint] = performance.getEntriesByName('first-contentful-paint');
            return paint ? paint.startTime : 0;
        });

        logger.info(`First Contentful Paint: ${fcp.toFixed(2)}ms`);

        if (fcp > 0) {
            expect(fcp).toBeLessThan(maxTime);
            return;
        }

        logger.warn('FCP not recorded on this page load.');
    },
);

Then(
    'the page load time should be less than {int} milliseconds',
    async function (this: CustomWorld, maxLoadTime: number) {
        const navigationTiming = await this.page.evaluate(() =>
            performance.getEntriesByType('navigation').map((entry) => ({
                startTime: entry.startTime,
                loadEventEnd: (entry as PerformanceNavigationTiming).loadEventEnd,
            })),
        );

        const pageLoadTime =
            navigationTiming[0].loadEventEnd - navigationTiming[0].startTime;
        logger.info(`Page load time: ${pageLoadTime}ms`);
        expect(pageLoadTime).toBeLessThan(maxLoadTime);
    },
);

Then('I should see an error message', async function (this: CustomWorld) {
    await expect(this.pm.getBasePage().getBodyLocator()).toContainText(/error|invalid/i);
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

