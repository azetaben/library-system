import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import report from 'multiple-cucumber-html-reporter';

const processLabel = `pid=${process.pid}`;

function log(level, message) {
    const line = `[${new Date().toISOString()}] [${processLabel}] ${level.toUpperCase()} ${message}`;
    if (level === 'warn' || level === 'error') {
        process.stderr.write(`${line}\n`);
        return;
    }

    process.stdout.write(`${line}\n`);
}

const scriptLogger = {
    info: (message) => log('info', message),
    warn: (message) => log('warn', message),
};

function shouldOpenReport() {
    const isCi = String(process.env.CI ?? '').toLowerCase() === 'true';
    if (isCi) {
        return false;
    }

    const noOpen = String(process.env.NO_OPEN ?? '').toLowerCase() === 'true';
    if (noOpen) {
        return false;
    }

    const openFlag = String(process.env.OPEN_CUCUMBER_REPORT ?? '1').toLowerCase();
    return !['0', 'false', 'no'].includes(openFlag);
}

function openReportInBrowser(reportPath) {
    if (!fs.existsSync(reportPath)) {
        scriptLogger.warn(`[multi-cucumber-report] Cannot open report because it does not exist: ${reportPath}`);
        return;
    }

    try {
        if (process.platform === 'win32') {
            const child = spawn('cmd', ['/c', 'start', '', reportPath], {
                detached: true,
                stdio: 'ignore',
            });
            child.unref();
            return;
        }

        const openCommand = process.platform === 'darwin' ? 'open' : 'xdg-open';
        const child = spawn(openCommand, [reportPath], {
            detached: true,
            stdio: 'ignore',
        });
        child.unref();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        scriptLogger.warn(`[multi-cucumber-report] Failed to open HTML report automatically: ${message}`);
    }
}

const rootDir = process.cwd();
const jsonDir = path.join(rootDir, 'e2e-tests', 'reports', 'cucumber-json');
const browserScope = String(process.env.BROWSER ?? '').trim();
const browserScopeLabel = browserScope.replace(/[^a-zA-Z0-9_-]+/g, '_');
const reportDir = browserScopeLabel
    ? path.join(rootDir, 'e2e-tests', 'reports', 'cucumber-html', browserScopeLabel)
    : path.join(rootDir, 'e2e-tests', 'reports', 'cucumber-html');
const reportIndexPath = path.join(reportDir, 'index.html');
const scopedJsonDir = browserScopeLabel
    ? path.join(jsonDir, `.tmp-${browserScopeLabel}`)
    : jsonDir;

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
    }
}

function getJsonResultFiles(dirPath) {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    return fs
        .readdirSync(dirPath)
        .filter((entry) => entry.toLowerCase().endsWith('.json'))
        .sort();
}

function getScopedJsonResultFiles(dirPath, scopeLabel) {
    const allJsonFiles = getJsonResultFiles(dirPath).filter(
        (entry) => entry.toLowerCase() !== 'cucumber-report.json',
    );

    if (!scopeLabel) {
        return allJsonFiles;
    }

    return allJsonFiles.filter((entry) =>
        entry.startsWith(`cucumber-report-${scopeLabel}-`),
    );
}

function prepareScopedJsonDir(sourceDir, targetDir, jsonFiles) {
    fs.rmSync(targetDir, {recursive: true, force: true});
    fs.mkdirSync(targetDir, {recursive: true});

    for (const jsonFile of jsonFiles) {
        fs.copyFileSync(path.join(sourceDir, jsonFile), path.join(targetDir, jsonFile));
    }
}

ensureDir(jsonDir);
ensureDir(reportDir);

const jsonFiles = getScopedJsonResultFiles(jsonDir, browserScopeLabel);

if (jsonFiles.length === 0) {
    const scopedMessage = browserScopeLabel
        ? ` for browser scope "${browserScopeLabel}"`
        : '';
    scriptLogger.warn(`[multi-cucumber-report] No cucumber JSON files found${scopedMessage} in: ${jsonDir}`);
    scriptLogger.warn('[multi-cucumber-report] Run `npm run test:e2e` first to generate report input.');
    process.exit(0);
}

if (browserScopeLabel) {
    prepareScopedJsonDir(jsonDir, scopedJsonDir, jsonFiles);
}

const effectiveJsonDir = browserScopeLabel ? scopedJsonDir : jsonDir;
const scopeMessage = browserScopeLabel ? ` for browser "${browserScopeLabel}"` : '';
scriptLogger.info(`[multi-cucumber-report] Aggregating ${jsonFiles.length} cucumber JSON file(s)${scopeMessage} from: ${effectiveJsonDir}`);

report.generate({
    jsonDir: effectiveJsonDir,
    reportPath: reportDir,
    reportName: browserScopeLabel
        ? `Books Inventory Cucumber Report (${browserScopeLabel})`
        : 'Books Inventory Cucumber Report',
    pageTitle: browserScopeLabel
        ? `Books Inventory Cucumber Report (${browserScopeLabel})`
        : 'Books Inventory Cucumber Report',
    displayDuration: true,
    displayReportTime: true,
    metadata: {
        browser: {
            name: process.env.BROWSER ?? 'chromium',
            version: 'latest',
        },
        device: process.env.CI ? 'CI runner' : 'local',
        platform: {
            name: process.platform,
            version: process.version,
        },
    },
    customData: {
        title: 'Run Info',
        data: [
            {label: 'Generated', value: new Date().toISOString()},
            {label: 'Environment', value: process.env.TEST_ENV ?? 'dev'},
            {label: 'Base URL', value: process.env.DEV_BASE_URL ?? process.env.BASE_URL ?? 'not set'},
            {label: 'Browser Scope', value: browserScopeLabel || 'all'},
        ],
    },
});

scriptLogger.info(`[multi-cucumber-report] HTML report generated at: ${reportIndexPath}`);

if (browserScopeLabel) {
    fs.rmSync(scopedJsonDir, {recursive: true, force: true});
}

if (shouldOpenReport()) {
    scriptLogger.info('[multi-cucumber-report] Opening HTML report in default browser...');
    openReportInBrowser(reportIndexPath);
}

