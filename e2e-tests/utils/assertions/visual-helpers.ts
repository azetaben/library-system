import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import type {Page} from '@playwright/test';
import {getBrowserArtifactLabel, sanitizeReportFileName} from '../runtime/report-helpers.ts';
import {logger} from '../runtime/logger.ts';

const visualBaselineRoot = path.resolve(
    process.cwd(),
    'e2e-tests',
    'baselines',
    'visual',
);
const visualReportRoot = path.resolve(
    process.cwd(),
    'e2e-tests',
    'reports',
    'visual',
);

const isTruthyEnv = (value?: string) => {
    const normalized = (value ?? '').trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
};

const ensureDir = (dirPath: string) => {
    mkdirSync(dirPath, {recursive: true});
};

const resolveVisualPaths = (snapshotName: string) => {
    const browser = getBrowserArtifactLabel();
    const safeName = sanitizeReportFileName(snapshotName);
    const baselineDir = path.join(visualBaselineRoot, browser);
    const actualDir = path.join(visualReportRoot, browser, 'actual');
    const baselinePath = path.join(baselineDir, `${safeName}.png`);
    const actualPath = path.join(actualDir, `${safeName}.png`);

    ensureDir(baselineDir);
    ensureDir(actualDir);

    return {
        baselinePath,
        actualPath,
    };
};

export async function assertVisualSnapshot(
    page: Page,
    snapshotName: string,
): Promise<{baselinePath: string; actualPath: string}> {
    const {baselinePath, actualPath} = resolveVisualPaths(snapshotName);
    const currentScreenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
        scale: 'css',
    });

    writeFileSync(actualPath, currentScreenshot);

    const shouldUpdateBaseline = isTruthyEnv(process.env.VISUAL_UPDATE_BASELINE);
    const baselineExists = existsSync(baselinePath);
    if (shouldUpdateBaseline || !baselineExists) {
        writeFileSync(baselinePath, currentScreenshot);
        const action = baselineExists ? 'updated' : 'created';
        logger.info(`Visual baseline ${action}: ${baselinePath}`);
        return {baselinePath, actualPath};
    }

    const baselineScreenshot = readFileSync(baselinePath);
    const isMatch = baselineScreenshot.equals(currentScreenshot);

    if (!isMatch) {
        throw new Error(
            `Visual mismatch for snapshot "${snapshotName}". Baseline: ${baselinePath}. Actual: ${actualPath}. ` +
            'Run with VISUAL_UPDATE_BASELINE=true to refresh baseline intentionally.',
        );
    }

    logger.info(`Visual snapshot matched baseline: ${snapshotName}`);
    return {baselinePath, actualPath};
}


