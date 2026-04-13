import path from 'node:path';
import {mkdirSync} from 'node:fs';
import {logger} from '../utils/Logger.ts';

export const reportsRoot = 'e2e-tests/reports';
export const cucumberJsonDir = path.join(reportsRoot, 'cucumber-json');
export const cucumberHtmlDir = path.join(reportsRoot, 'cucumber-html');
export const screenshotsDir = path.join(reportsRoot, 'screenshots');
export const tracesDir = path.join(reportsRoot, 'traces');
export const diagnosticsDir = path.join(reportsRoot, 'diagnostics');

export const sanitizeReportFileName = (value: string) =>
    value.replace(/[^a-zA-Z0-9_-]+/g, '_');

export const getScreenshotPath = (scenarioName: string) =>
    path.join(screenshotsDir, `${sanitizeReportFileName(scenarioName)}.png`);

export const getTracePath = (scenarioName: string) =>
    path.join(tracesDir, `${sanitizeReportFileName(scenarioName)}-trace.zip`);

export const buildArtifactPath = (folder: string, fileName: string) =>
    path.join(reportsRoot, folder, fileName);

export const ensureFrameworkArtifactDirs = () => {
    for (const dir of [
        cucumberJsonDir,
        cucumberHtmlDir,
        screenshotsDir,
        tracesDir,
        diagnosticsDir,
    ]) {
        logger.info(`Ensuring artifact directory exists: ${dir}`);
        mkdirSync(dir, {recursive: true});
    }
};
