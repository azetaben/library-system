import {After, AfterAll, Before, BeforeAll, setDefaultTimeout, Status,} from '@cucumber/cucumber';
import {BrowserFactory} from '../utils/browser/index.ts';
import {PageManager} from '../pages/page-manager.ts';
import {CustomWorld} from './world.ts';
import type {Browser} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import * as allure from 'allure-js-commons';
import {ContentType} from 'allure-js-commons';
import {setGlobalTestRuntime} from 'allure-js-commons/sdk/runtime';
import {AllureCucumberTestRuntime} from 'allure-cucumberjs';
import {resetTestData, testData} from '../utils/data/index.ts';
import {envConfig} from '../config/env.config.ts';
import {
    cucumberJsonDir,
    getBrowserQualifiedArtifactName,
    getScreenshotPath,
    getTracePath,
    sanitizeReportFileName,
    screenshotsDir,
    tracesDir,
} from '../utils/runtime/index.ts';
import {logger} from '../utils/runtime/index.ts';
import {MemoryMonitor} from '../utils/resilience/index.ts';
import {ArtifactCleanup} from '../utils/resilience/index.ts';
import {initializeGlobalRateLimiter} from '../utils/resilience/index.ts';
import {ContextPool} from '../utils/browser/index.ts';
import {WorkerMonitor} from '../utils/resilience/index.ts';

setDefaultTimeout(envConfig.cucumberTimeoutMs);

let globalBrowser: Browser;
let contextPool: ContextPool;
let scenarioMemorySnapshot: ReturnType<typeof MemoryMonitor.getSnapshot>;
const workerId = `worker-${process.pid}`;
const getActiveBrowserArtifactLabel = () => process.env.BROWSER?.trim() || envConfig.browser;

BeforeAll(async function () {
    logger.info(`Starting test execution in process ${process.pid}`);
    setGlobalTestRuntime(new AllureCucumberTestRuntime());
    await mkdir(cucumberJsonDir, {recursive: true});
    await mkdir(screenshotsDir, {recursive: true});
    await mkdir(tracesDir, {recursive: true});

    // Cleanup old artifacts before test run
    logger.info('Cleaning up old test artifacts');
    ArtifactCleanup.cleanupOldArtifacts({
        retentionDays: 7,
        keepLatestCount: 20,
    });

    const totalArtifactSize = ArtifactCleanup.getTotalArtifactSize();
    logger.info(`Total artifact size: ${(totalArtifactSize / 1024 / 1024).toFixed(1)}MB`);

    // Initialize rate limiter
    const rps = parseInt(process.env.RATE_LIMIT_RPS ?? '10');
    initializeGlobalRateLimiter({rps});

    globalBrowser = await BrowserFactory.launchBrowser();

    // Initialize context pool
    contextPool = new ContextPool(globalBrowser, {
        poolSize: parseInt(process.env.CONTEXT_POOL_SIZE ?? '5'),
    });

    // Register worker
    WorkerMonitor.registerWorker(workerId);

    logger.info(`Global browser initialized with context pool in process ${process.pid}`);
});

Before(async function (this: CustomWorld, scenario) {
    logger.info(`Starting scenario in process ${process.pid}: ${scenario.pickle.name}`);
    resetTestData();
    const safeScenarioArtifactName = sanitizeReportFileName(scenario.pickle.name);
    const browserArtifactLabel = getActiveBrowserArtifactLabel();
    const browserQualifiedScenarioArtifactName = getBrowserQualifiedArtifactName(
        safeScenarioArtifactName,
    );

    // Memory snapshot at start
    scenarioMemorySnapshot = MemoryMonitor.getSnapshot();
    logger.debug(`Scenario start memory: ${scenarioMemorySnapshot.heapUsedMB.toFixed(0)}MB`);

    // Check memory health
    const health = MemoryMonitor.checkHealth();
    if (health === 'critical') {
        logger.error('Memory critical, forcing GC');
        MemoryMonitor.forceGarbageCollection();
    }

    // Use context pool
    this.context = await contextPool.acquire();

    // Start tracing before each scenario
    logger.debug(`Starting trace capture: ${safeScenarioArtifactName}`);
    await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        name: browserQualifiedScenarioArtifactName,
    });

    this.page = await BrowserFactory.createPage(this.context);
    this.pm = new PageManager(this.page);
    logger.debug(`Scenario browser context and page created: ${scenario.pickle.name}`);

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
    await allure.parameter('browser', browserArtifactLabel);
    await allure.parameter('baseUrl', envConfig.baseUrl);
    await allure.parameter('bookTitle', testData.validBook.title);

    if (scenarioTags.length > 0) {
        await allure.tags(...scenarioTags);
    }
});

After(async function (this: CustomWorld, scenario) {
    const failed = scenario.result?.status === Status.FAILED;
    const browserArtifactLabel = getActiveBrowserArtifactLabel();
    logger.info(
        `Finalizing scenario in process ${process.pid}: ${scenario.pickle.name} (status=${scenario.result?.status ?? 'unknown'})`,
    );

    // Memory metrics after scenario
    const endSnapshot = MemoryMonitor.getSnapshot();
    const delta = MemoryMonitor.compareSnapshots(scenarioMemorySnapshot, endSnapshot);
    logger.info(
        `Scenario memory delta: ${delta.heapDeltaMB >= 0 ? '+' : ''}${delta.heapDeltaMB.toFixed(1)}MB over ${delta.durationMs}ms`
    );

    // Record scenario metrics
    const duration = scenario.result?.duration?.nanos ?? 0;
    const durationMs = duration / 1_000_000;
    const passed = scenario.result?.status !== Status.FAILED;
    WorkerMonitor.recordScenario(workerId, passed, durationMs);

    if (failed) {
        logger.error(`Scenario failed in process ${process.pid}: ${scenario.pickle.name}`);
        // Capture screenshot on failure
        const screenshotPath = getScreenshotPath(scenario.pickle.name);
        logger.debug(`Capturing failure screenshot: ${screenshotPath}`);
        const screenshot = await this.page.screenshot({
            path: screenshotPath,
            fullPage: true,
        });
        this.attach(screenshot, 'image/png');
        await allure.attachment(
            `Failure screenshot (${browserArtifactLabel})`,
            screenshot,
            ContentType.PNG,
        );
        logger.info(`Attached failure screenshot for scenario: ${scenario.pickle.name}`);
    } else {
        // Cleanup artifacts for skipped/pending scenarios
        if (scenario.result?.status === Status.PENDING ||
            scenario.result?.status === Status.SKIPPED) {
            logger.debug(`Cleaning up artifacts for skipped scenario: ${scenario.pickle.name}`);
            ArtifactCleanup.cleanupScenarioArtifacts(scenario.pickle.name);
        }
    }

    // Stop tracing; only persist to disk when the scenario failed or SAVE_TRACES_ON_PASS=true
    if (failed || envConfig.saveTracesOnPass) {
        const tracePath = getTracePath(scenario.pickle.name);
        logger.debug(`Stopping trace and saving artifact: ${tracePath}`);
        await this.context.tracing.stop({path: tracePath});
        await allure.attachTrace(`Playwright trace (${browserArtifactLabel})`, tracePath);
        logger.info(`Attached Playwright trace for scenario: ${scenario.pickle.name}`);
    } else {
        logger.debug('Stopping trace without persisting artifact (passing scenario).');
        await this.context.tracing.stop();
    }

    logger.debug(`Closing page for scenario: ${scenario.pickle.name}`);
    await this.page.close();

    // Return context to pool
    if (this.context) {
        await contextPool.release(this.context);
    }

    logger.info(`Finished scenario in process ${process.pid}: ${scenario.pickle.name}`);
});

AfterAll(async function () {
    // Final memory report
    const finalMetrics = MemoryMonitor.getMetrics();
    logger.info(
        `Final memory state: ${finalMetrics.heapUsedMB.toFixed(0)}MB used / ${finalMetrics.heapTotalMB.toFixed(0)}MB allocated`
    );

    // Worker summary
    WorkerMonitor.printSummary();

    // Drain context pool
    if (contextPool) {
        logger.info('Draining context pool');
        await contextPool.drain();
    }

    if (globalBrowser) {
        logger.info(`Closing global browser in process ${process.pid}`);
        await globalBrowser.close();
    }
    logger.info(`Test execution completed in process ${process.pid}`);
});
