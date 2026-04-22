import {existsSync} from 'node:fs';
import {spawn, spawnSync} from 'node:child_process';
import {chromium, firefox, webkit} from '@playwright/test';

const DEFAULT_BROWSERS = ['chromium', 'firefox', 'webkit'];
const DEFAULT_FEATURE = 'features/auth/tc-26-cross-browser-login.feature';
const DEFAULT_SCENARIO = 'Cross-browser login succeeds with valid credentials';

const cliArgs = new Set(process.argv.slice(2));
const dryRun = cliArgs.has('--dry-run');
const installMissingFromCli = cliArgs.has('--install-missing');
const configuredBrowsers = (process.env.CROSS_BROWSER_BROWSERS ?? DEFAULT_BROWSERS.join(','))
    .split(',')
    .map((browserName) => browserName.trim().toLowerCase())
    .filter(Boolean);
const featurePath = process.env.CROSS_BROWSER_FEATURE ?? DEFAULT_FEATURE;
const scenarioName = process.env.CROSS_BROWSER_SCENARIO ?? DEFAULT_SCENARIO;
const tags = process.env.CROSS_BROWSER_TAGS;
const isHeadless = (process.env.HEADLESS ?? 'false').toLowerCase() === 'true';
const autoInstallMissing =
    installMissingFromCli ||
    (process.env.CROSS_BROWSER_AUTO_INSTALL ?? 'true').toLowerCase() === 'true';
const allowPartial =
    (process.env.CROSS_BROWSER_ALLOW_PARTIAL ?? 'false').toLowerCase() === 'true';

const browserTypeByName = {
    chromium,
    firefox,
    webkit,
};

function getMissingBrowsers(browserNames) {
    return browserNames.filter((browserName) => {
        const browserType = browserTypeByName[browserName];
        if (!browserType) {
            return true;
        }

        try {
            const executablePath = browserType.executablePath();
            return !executablePath || !existsSync(executablePath);
        } catch {
            return true;
        }
    });
}

function installBrowsers(browserNames) {
    if (browserNames.length === 0) {
        return true;
    }

    const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const result = spawnSync(command, ['playwright', 'install', ...browserNames], {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
    });

    return result.status === 0;
}

function buildCucumberArgs() {
    const args = [
        '--import',
        'tsx',
        './node_modules/@cucumber/cucumber/bin/cucumber-js',
        featurePath,
    ];

    if (dryRun) {
        args.push('-p', 'dryRun');
        return args;
    }

    if (tags && tags.trim().length > 0) {
        args.push('--tags', tags.trim());
    } else {
        args.push('--name', scenarioName);
    }

    return args;
}

function runBrowser(browserName) {
    const args = buildCucumberArgs();
    const startedAt = Date.now();

    const child = spawn(process.execPath, args, {
        cwd: process.cwd(),
        env: {
            ...process.env,
            FORCE_COLOR: '1',
            HEADLESS: process.env.HEADLESS ?? 'true',
            BROWSER: browserName,
            CUCUMBER_REGRESSION_PARALLEL: '1',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    const prefix = `[${browserName}]`;
    child.stdout.on('data', (chunk) => {
        process.stdout.write(`${prefix} ${String(chunk)}`);
    });
    child.stderr.on('data', (chunk) => {
        process.stderr.write(`${prefix} ${String(chunk)}`);
    });

    return new Promise((resolve) => {
        child.on('close', (code, signal) => {
            resolve({
                browserName,
                code: code ?? 1,
                signal: signal ?? null,
                durationMs: Date.now() - startedAt,
            });
        });
    });
}

console.log('Running login example in parallel browsers...');
console.log(`Browsers: ${configuredBrowsers.join(', ')}`);
console.log(`Feature: ${featurePath}`);
console.log(`Mode: ${dryRun ? 'dry-run' : isHeadless ? 'headless' : 'headed'}`);
if (!dryRun && tags && tags.trim().length > 0) {
    console.log(`Tags: ${tags.trim()}`);
} else if (!dryRun) {
    console.log(`Scenario: ${scenarioName}`);
}

let browsersToRun = [...configuredBrowsers];

if (!dryRun) {
    let missingBrowsers = getMissingBrowsers(browsersToRun);
    if (missingBrowsers.length > 0) {
        console.warn(`Missing Playwright browser executables: ${missingBrowsers.join(', ')}`);

        if (autoInstallMissing) {
            console.log(`Installing missing browsers: ${missingBrowsers.join(', ')}`);
            const installOk = installBrowsers(missingBrowsers);
            if (!installOk) {
                console.error('Playwright browser install failed.');
                process.exit(1);
            }
            missingBrowsers = getMissingBrowsers(browsersToRun);
        }

        if (missingBrowsers.length > 0) {
            if (allowPartial) {
                browsersToRun = browsersToRun.filter(
                    (browserName) => !missingBrowsers.includes(browserName),
                );
                console.warn(
                    `Continuing with available browsers only: ${browsersToRun.join(', ')}`,
                );
            } else {
                console.error(
                    `Cannot run cross-browser login. Missing browser executables: ${missingBrowsers.join(', ')}. ` +
                    'Run: npx playwright install',
                );
                process.exit(1);
            }
        }
    }
}

if (browsersToRun.length === 0) {
    console.error('No available browsers to run.');
    process.exit(1);
}

const results = await Promise.all(browsersToRun.map((browser) => runBrowser(browser)));

console.log('\nCross-browser summary:');
for (const result of results) {
    const status = result.code === 0 ? 'PASSED' : 'FAILED';
    console.log(
        `- ${result.browserName}: ${status} (exit=${result.code}, duration=${result.durationMs}ms${result.signal ? `, signal=${result.signal}` : ''})`,
    );
}

const hasFailures = results.some((result) => result.code !== 0);
process.exit(hasFailures ? 1 : 0);

