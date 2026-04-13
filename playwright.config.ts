import {defineConfig} from '@playwright/test';
import * as dotenv from 'dotenv';
import {envConfig} from './e2e-tests/config/env.config.js';

dotenv.config();

const environmentTargets = [
    {
        name: 'dev',
        baseURL: envConfig.environments.dev,
    },
    {
        name: 'staging',
        baseURL: envConfig.environments.staging,
    },
    {
        name: 'prod',
        baseURL: envConfig.environments.prod,
    },
] as const;
const browserProjects = [
    {name: 'chromium', browserName: 'chromium' as const},
    {name: 'firefox', browserName: 'firefox' as const},
    {name: 'webkit', browserName: 'webkit' as const},
] as const;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e-tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    expect: {
        timeout: envConfig.expectTimeoutMs,
    },
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL is overridden per environment project below. */
        baseURL: envConfig.baseUrl,
        headless: envConfig.headless,
        viewport: null,
        ignoreHTTPSErrors: envConfig.ignoreHttpsErrors,
        launchOptions: {
            args: [
                '--start-maximized',
                '--disable-extensions',
                '--disable-popup-blocking',
                '--no-sandbox',
            ],
            slowMo: envConfig.slowMoMs,
        },
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: envConfig.actionTimeoutMs,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'off',

        /* Take screenshots on failure */
        screenshot: 'only-on-failure',

        /* Record video on failure */
        video: 'retain-on-failure',
    },

    projects: environmentTargets.flatMap((environmentTarget) =>
        browserProjects.map((browserProject) => ({
            name: `${environmentTarget.name}-${browserProject.name}`,
            use: {
                baseURL: environmentTarget.baseURL,
                browserName: browserProject.browserName,
            },
        })),
    ),

    /* Start an application server when Azure DevOps or another CI job provides it explicitly. */
    webServer: envConfig.webServer.command && envConfig.webServer.url
        ? {
            command: envConfig.webServer.command,
            url: envConfig.webServer.url,
            reuseExistingServer: !process.env.CI,
            timeout: envConfig.navigationTimeoutMs,
        }
        : undefined,
});
