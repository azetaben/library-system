import {Given, When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/Logger.ts';
import {envConfig} from '../config/env.config.ts';
import {testData} from '../utils/TestData.ts';
import {appData, appPatterns} from '../utils/AppData.ts';
import {isLoginTarget} from '../utils/stepSupport.ts';

async function navigateLandingWhenResponsive(
    world: CustomWorld,
    target: string,
) {
    logger.info(
        'Action: Warming the landing page endpoint and navigating when responsive...',
    );
    const landingPage = world.pm.getLandingPage();
    await world.pm
        .getBasePage()
        .navigateWhenResponsive(target, landingPage.startTestingButton());
}

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
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const locator = compactSelector
        ? world.page
            .locator(
                `button:has-text("${label}"), a:has-text("${label}"), [role="button"]:has-text("${label}")`,
            )
            .first()
        : world.page
            .locator('button, a, [role="button"]')
            .filter({
                hasText: /^logout$/i.test(label.trim())
                    ? appPatterns.logoutButton
                    : new RegExp(`^\\s*${escapedLabel}\\s*$`, 'i'),
            })
            .first();

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
}

async function loginWithValidAdmin(world: CustomWorld) {
    await world.pm
        .getLoginPage()
        .login(testData.validUser.username, testData.validUser.password);
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
        await navigateLandingWhenResponsive(this, envConfig.baseUrl);
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
        await this.pm
            .getBasePage()
            .navigateWhenResponsive(target, readyLocatorForTarget(this, target));
    },
);


Given(
    'I navigate to {string} page',
    async function (this: CustomWorld, target: string) {
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

When(
    'I tap on the {string} button',
    async function (this: CustomWorld, label: string) {
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

/*When(
  'I tap on the {string}',
  async function (this: CustomWorld, label: string) {
    logger.info(`Action: Tapping control "${label}"...`);
    await clickNamedControl(this, label, { compactSelector: true });
  },
);*/

When(
    'I click on the {string} button',
    async function (this: CustomWorld, buttonLabel: string) {
        await clickNamedControl(this, buttonLabel, {ensureVisible: true});
    },
);

When('I login in login page', async function (this: CustomWorld) {
    await loginWithValidAdmin(this);
});

When(
    'I login as an authenticated admin user with username {string} and password {string}',
    async function (this: CustomWorld, username: string, password: string) {
        await this.pm.getLoginPage().login(username, password);
    },
);

When(
    'I sign in with valid admin credentials if a login page is shown',
    async function (this: CustomWorld) {
        if (
            await this.pm
                .getLoginPage()
                .loginButton()
                .isVisible()
                .catch(() => false)
        ) {
            await loginWithValidAdmin(this);
        }
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
