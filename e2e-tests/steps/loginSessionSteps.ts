import {Given, When} from '@cucumber/cucumber';
import fs from 'node:fs';
import {CustomWorld} from '../support/world.ts';
import {testData} from '../utils/TestData.ts';
import {resolveProjectPath} from '../helperUtilities/pathHelpers.ts';
import {envConfig} from '../config/env.config.ts';
import {AssertionHelpers} from '../helperUtilities/assertionHelpers.ts';
import {logger} from '../utils/Logger.ts';
import {routePattern} from '../utils/stepSupport.ts';

const cookiesFile = resolveProjectPath(
    'e2e-tests',
    'reports',
    'diagnostics',
    'cookies.json',
);

async function navigateLandingWhenResponsive(
    world: CustomWorld,
    target: string,
) {
    logger.info(`Restoring session and navigating responsively to ${target}`);
    const landingPage = world.pm.getLandingPage();
    await world.pm
        .getBasePage()
        .navigateWhenResponsive(target, landingPage.startTestingButton());
}

async function ensureAuthenticatedCookies(world: CustomWorld): Promise<void> {
    if (fs.existsSync(cookiesFile)) {
        logger.info(`Using existing cookies file at ${cookiesFile}`);
        return;
    }

    logger.info('No cookies file found, creating authenticated cookies');
    await world.pm
        .getLandingPage()
        .navigateWhenResponsive('/', world.pm.getLandingPage().startTestingButton());
    await world.pm.getLandingPage().clickStartTesting();
    await AssertionHelpers.expectUrl(world.page, routePattern(envConfig.routes.login));
    await AssertionHelpers.expectVisible(world.pm.getLoginPage().usernameInput());
    await AssertionHelpers.expectVisible(world.pm.getLoginPage().passwordInput());
    await world.pm
        .getLoginPage()
        .login(testData.validUser.username, testData.validUser.password);
    await AssertionHelpers.expectUrl(
        world.page,
        world.pm.getBooksCatalogPage().getCatalogUrlPattern(),
    );
    await AssertionHelpers.expectVisible(world.pm.getBooksCatalogPage().bookList());

    const freshCookies = await world.page.context().cookies();
    fs.writeFileSync(cookiesFile, JSON.stringify(freshCookies, null, 2));
    logger.info(`Authenticated cookies saved to ${cookiesFile}`);
}

Given(
    'I restore the session to the landing page',
    async function (this: CustomWorld) {
        logger.info('Restoring session to landing page');
        await ensureAuthenticatedCookies(this);
        const cookies = JSON.parse(fs.readFileSync(cookiesFile, 'utf-8'));
        await this.page.context().addCookies(cookies);
        await navigateLandingWhenResponsive(this, envConfig.baseUrl);
    },
);

Given(
    'I restore the session to the login page',
    async function (this: CustomWorld) {
        logger.info('Restoring session to login page');
        await ensureAuthenticatedCookies(this);
        const cookies = JSON.parse(fs.readFileSync(cookiesFile, 'utf-8'));
        await this.page.context().addCookies(cookies);
        await this.page.goto(`${envConfig.baseUrl}${envConfig.routes.login}`);
    },
);

Given(
    'I restore the session to the books catalog page',
    async function (this: CustomWorld) {
        logger.info('Restoring session to books catalog page');
        await ensureAuthenticatedCookies(this);
        const cookies = JSON.parse(fs.readFileSync(cookiesFile, 'utf-8'));
        await this.page.context().addCookies(cookies);
        await this.pm.getBooksCatalogPage().navigateDirectly();
    },
);

When(
    'I try to open the protected books catalog directly',
    async function (this: CustomWorld) {
        logger.info('Attempting direct navigation to protected books catalog');
        await this.pm.getBooksCatalogPage().navigateDirectly();
    },
);
