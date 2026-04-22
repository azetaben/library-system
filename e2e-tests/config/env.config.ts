import * as dotenv from 'dotenv';
import {logger} from '../utils/runtime/index.ts';

dotenv.config({path: '.env', quiet: true});
dotenv.config({path: '.env.example', quiet: true});

const getString = (
    primaryKey: string,
    fallbackKey?: string,
): string | undefined =>
    process.env[primaryKey]?.trim() ||
    (fallbackKey ? process.env[fallbackKey]?.trim() : undefined);

const getBoolean = (primaryKey: string, defaultValue: boolean): boolean => {
    const raw = process.env[primaryKey]?.trim().toLowerCase();
    if (!raw) {
        return defaultValue;
    }

    return ['1', 'true', 'yes', 'on'].includes(raw);
};

const getNumber = (primaryKey: string, defaultValue: number): number => {
    const raw = process.env[primaryKey]?.trim();
    if (!raw) {
        return defaultValue;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : defaultValue;
};

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');
const normalizeOptionalBaseUrl = (value?: string): string | undefined =>
    value ? normalizeBaseUrl(value) : undefined;


const testEnvironment = (getString('TEST_ENV') ?? 'dev').toLowerCase();
const environments = {
    dev: normalizeOptionalBaseUrl(
        getString('DEV_BASE_URL') ??
        getString('BASE_URL', 'PLAYWRIGHT_BASE_URL'),
    ),
    staging: normalizeOptionalBaseUrl(getString('STAGING_BASE_URL')),
    prod: normalizeOptionalBaseUrl(getString('PROD_BASE_URL')),
} as const;

const baseUrlByEnvironment = {
    dev: environments.dev,
    staging: environments.staging ?? environments.dev,
    prod: environments.prod ?? environments.staging ?? environments.dev,
} as const;

const resolvedTestEnvironment =
    testEnvironment === 'staging' || testEnvironment === 'prod'
        ? testEnvironment
        : 'dev';

const baseUrl = baseUrlByEnvironment[resolvedTestEnvironment];

if (!baseUrl) {
    throw new Error(
        'Missing base URL configuration. Set DEV_BASE_URL or BASE_URL in .env/.env.example.',
    );
}

export const envConfig = {
    environment: resolvedTestEnvironment,
    baseUrl,
    environments: baseUrlByEnvironment,
    browser: getString('BROWSER', 'PW_BROWSER') ?? 'chromium',
    username: getString('TEST_USERNAME', 'LOGIN_USERNAME') ?? '',
    password: getString('TEST_PASSWORD', 'LOGIN_PASSWORD') ?? '',
    headless: getBoolean('HEADLESS', Boolean(process.env.CI)),
    slowMoMs: getNumber('SLOW_MO_MS', 0),
    cucumberTimeoutMs: getNumber('CUCUMBER_TIMEOUT_MS', 120_000),
    actionTimeoutMs: getNumber('ACTION_TIMEOUT_MS', 10_000),
    expectTimeoutMs: getNumber('EXPECT_TIMEOUT_MS', 10_000),
    defaultTimeoutMs: getNumber('DEFAULT_TIMEOUT_MS', 15_000),
    navigationTimeoutMs: getNumber('NAVIGATION_TIMEOUT_MS', 30_000),
    responsiveWarmupTimeoutMs: getNumber('RESPONSIVE_WARMUP_TIMEOUT_MS', 90_000),
    responsiveFastResponseThresholdMs: getNumber('RESPONSIVE_FAST_RESPONSE_THRESHOLD_MS', 2_000),
    responsiveConsecutiveFastResponses: getNumber('RESPONSIVE_CONSECUTIVE_FAST_RESPONSES', 1),
    responsivePollIntervalMs: getNumber('RESPONSIVE_POLL_INTERVAL_MS', 1_500),
    responsiveRequestTimeoutMs: getNumber('RESPONSIVE_REQUEST_TIMEOUT_MS', 4_000),
    responsiveCacheTtlMs: getNumber('RESPONSIVE_CACHE_TTL_MS', 180_000),
    entryResponsiveWarmupTimeoutMs: getNumber('ENTRY_RESPONSIVE_WARMUP_TIMEOUT_MS', 120_000),
    entryResponsiveFastResponseThresholdMs: getNumber(
        'ENTRY_RESPONSIVE_FAST_RESPONSE_THRESHOLD_MS',
        12_000,
    ),
    entryResponsiveConsecutiveFastResponses: getNumber(
        'ENTRY_RESPONSIVE_CONSECUTIVE_FAST_RESPONSES',
        1,
    ),
    entryResponsivePollIntervalMs: getNumber('ENTRY_RESPONSIVE_POLL_INTERVAL_MS', 1_500),
    entryResponsiveRequestTimeoutMs: getNumber('ENTRY_RESPONSIVE_REQUEST_TIMEOUT_MS', 15_000),
    entryResponsiveCacheTtlMs: getNumber('ENTRY_RESPONSIVE_CACHE_TTL_MS', 300_000),
    viewportWidth: getNumber('VIEWPORT_WIDTH', 1280),
    viewportHeight: getNumber('VIEWPORT_HEIGHT', 720),
    acceptDownloads: getBoolean('ACCEPT_DOWNLOADS', true),
    ignoreHttpsErrors: getBoolean('IGNORE_HTTPS_ERRORS', true),
    saveTracesOnPass: getBoolean('SAVE_TRACES_ON_PASS', false),
    webServer: {
        command: getString('PLAYWRIGHT_WEB_SERVER_COMMAND'),
        url: normalizeOptionalBaseUrl(getString('PLAYWRIGHT_WEB_SERVER_URL')),
    },
    routes: {
        landing: '/',
        login: '/login',
        books: '/books',
        addBook: '/add-book',
        editBook: '/edit-book',
    },
} as const;

logger.info(
    `Environment configuration loaded for environment ${envConfig.environment} using base URL ${envConfig.baseUrl} with browser ${envConfig.browser}.`,
);
