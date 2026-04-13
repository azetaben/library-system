import {After, AfterAll, Before, BeforeAll, setDefaultTimeout, Status,} from '@cucumber/cucumber';
import {BrowserFactory} from '../utils/BrowserFactory.ts';
import {PageManager} from '../pages/PageManager.ts';
import {CustomWorld} from './world.ts';
import type {Browser} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import * as allure from 'allure-js-commons';
import {ContentType} from 'allure-js-commons';
import {setGlobalTestRuntime} from 'allure-js-commons/sdk/runtime';
import {AllureCucumberTestRuntime} from 'allure-cucumberjs';
import {resetTestData, testData} from '../utils/TestData.ts';
import {envConfig} from '../config/env.config.ts';
import {
    cucumberJsonDir,
    getScreenshotPath,
    getTracePath,
    sanitizeReportFileName,
    screenshotsDir,
    tracesDir,
} from '../helperUtilities/reportHelpers.ts';
import {logger} from '../utils/Logger.ts';

setDefaultTimeout(envConfig.cucumberTimeoutMs);

let globalBrowser: Browser;

BeforeAll(async function () {
    logger.info('Starting test execution');
    setGlobalTestRuntime(new AllureCucumberTestRuntime());
    await mkdir(cucumberJsonDir, {recursive: true});
    await mkdir(screenshotsDir, {recursive: true});
    await mkdir(tracesDir, {recursive: true});
    globalBrowser = await BrowserFactory.launchBrowser();
    logger.info('Global browser initialized');
});

Before(async function (this: CustomWorld, scenario) {
    logger.info(`Starting scenario: ${scenario.pickle.name}`);
    resetTestData();
    const safeScenarioArtifactName = sanitizeReportFileName(scenario.pickle.name);

    this.context = await BrowserFactory.createContext(globalBrowser);

    // Start tracing before each scenario
    await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        name: safeScenarioArtifactName,
    });

    this.page = await BrowserFactory.createPage(this.context);
    this.pm = new PageManager(this.page);

    const featureName =
        scenario.gherkinDocument?.feature?.name ??
        path.basename(scenario.pickle.uri ?? 'unknown.feature', '.feature');
    const scenarioTags = scenario.pickle.tags.map((tag) =>
        tag.name.replace(/^@/, ''),
    );

    await allure.parentSuite('Cucumber E2E');
    await allure.suite(featureName);
    await allure.feature(featureName);
    await allure.story(scenario.pickle.name);
    await allure.description(
        `Scenario from ${scenario.pickle.uri ?? 'unknown feature file'}`,
    );
    await allure.parameter('baseUrl', envConfig.baseUrl);
    await allure.parameter('bookTitle', testData.validBook.title);

    if (scenarioTags.length > 0) {
        await allure.tags(...scenarioTags);
    }
});

After(async function (this: CustomWorld, scenario) {
    if (scenario.result?.status === Status.FAILED) {
        logger.error(`Scenario failed: ${scenario.pickle.name}`);
        // Capture screenshot on failure
        const screenshotPath = getScreenshotPath(scenario.pickle.name);
        const screenshot = await this.page.screenshot({
            path: screenshotPath,
            fullPage: true,
        });
        this.attach(screenshot, 'image/png');
        await allure.attachment('Failure screenshot', screenshot, ContentType.PNG);
    }

    // Stop tracing and save it
    const tracePath = getTracePath(scenario.pickle.name);
    await this.context.tracing.stop({path: tracePath});
    await allure.attachTrace('Playwright trace', tracePath);

    await this.page.close();
    await this.context.close();
    logger.info(`Finished scenario: ${scenario.pickle.name}`);
});

AfterAll(async function () {
    if (globalBrowser) {
        logger.info('Closing global browser');
        await globalBrowser.close();
    }
    logger.info('Test execution completed');
});
