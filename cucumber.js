export default function () {
    const regressionParallel = Math.max(
        1,
        Number.parseInt(process.env.CUCUMBER_REGRESSION_PARALLEL ?? '2', 10) || 2,
    );

    const runTimestamp = new Date().toISOString().replace(/[.:]/g, '-');
    const browserLabel = (process.env.BROWSER ?? 'unknown-browser')
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, '_');
    const jsonReportPath = `e2e-tests/reports/cucumber-json/cucumber-report-${browserLabel}-${runTimestamp}.json`;
    const htmlReportPath = `e2e-tests/reports/cucumber-html/cucumber-report-${browserLabel}.html`;

    const sharedConfig = {
        import: [
            'e2e-tests/config/**/*.ts',
            'e2e-tests/utils/**/*.ts',
            'e2e-tests/support/**/*.ts',
            'e2e-tests/steps/**/*.ts',
        ],
        format: [
            'progress',
            'summary',
            `html:${htmlReportPath}`,
            `json:${jsonReportPath}`,
            'allure-cucumberjs/reporter',
        ],
        tags: 'not @bug',
        publishQuiet: true,
        failFast: false,
        retry: 0,
    };

    return {
        default: {
            ...sharedConfig,
        },
        ci: {
            ...sharedConfig,
            format: [
                'progress',
                'summary',
                `html:${htmlReportPath}`,
                `json:${jsonReportPath}`,
                'allure-cucumberjs/reporter',
                'rerun:e2e-tests/reports/diagnostics/rerun.txt',
            ],
            parallel: 1,
        },
        smoke: {
            ...sharedConfig,
            tags: '@smoke and not @bug',
        },
        regression: {
            ...sharedConfig,
            tags: '@regression and not @bug',
            parallel: regressionParallel,
        },
        bug: {
            ...sharedConfig,
            tags: '@bug',
        },
        security: {
            ...sharedConfig,
            tags: '@security and not @bug',
        },
        performance: {
            ...sharedConfig,
            tags: '@performance and not @bug',
        },
        workflow: {
            ...sharedConfig,
            tags: '@workflow and not @bug',
        },
        uiContract: {
            ...sharedConfig,
            tags: '@ui-contract and not @bug',
        },
        debug: {
            ...sharedConfig,
            format: ['progress', 'summary'],
            retry: 0,
            failFast: true,
        },
        dryRun: {
            ...sharedConfig,
            dryRun: true,
            format: ['progress', 'summary'],
        },
    };
}
