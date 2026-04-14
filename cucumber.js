export default function () {
    const regressionParallel = Math.max(
        1,
        Number.parseInt(process.env.CUCUMBER_REGRESSION_PARALLEL ?? '2', 10) || 2,
    );

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
            'html:e2e-tests/reports/cucumber-html/cucumber-report.html',
            'json:e2e-tests/reports/cucumber-json/cucumber-report.json',
            'allure-cucumberjs/reporter',
        ],
        formatOptions: {
            snippetInterface: 'async-await',
        },
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
                'html:e2e-tests/reports/cucumber-html/cucumber-report.html',
                'json:e2e-tests/reports/cucumber-json/cucumber-report.json',
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
