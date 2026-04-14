import fs from 'node:fs/promises';
import path from 'node:path';
import { cucumberHtmlDir, reportsRoot } from '../e2e-tests/helperUtilities/reportHelpers.ts';

const projectRoot = process.cwd();
const reportRoot = path.join(projectRoot, reportsRoot);
const sourceHtmlReport = path.join(projectRoot, cucumberHtmlDir, 'cucumber-report.html');
const outputHtmlReport = path.join(reportRoot, 'cucumber-report.html');

await fs.mkdir(reportRoot, { recursive: true });
if (sourceHtmlReport !== outputHtmlReport) {
  await fs.copyFile(sourceHtmlReport, outputHtmlReport);
}
