import {Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/Logger.ts';

Then(
    'the First Contentful Paint should be less than {int} milliseconds',
    async function (this: CustomWorld, maxTime: number) {
        const fcp = await this.page.evaluate(() => {
            const [paint] = performance.getEntriesByName('first-contentful-paint');
            return paint ? paint.startTime : 0;
        });

        logger.info(`First Contentful Paint: ${fcp.toFixed(2)}ms`);

        if (fcp > 0) {
            expect(fcp).toBeLessThan(maxTime);
            return;
        }

        logger.warn('FCP not recorded on this page load.');
    },
);

Then(
    'the page load time should be less than {int} milliseconds',
    async function (this: CustomWorld, maxLoadTime: number) {
        const navigationTiming = await this.page.evaluate(() =>
            performance.getEntriesByType('navigation').map((entry) => ({
                startTime: entry.startTime,
                loadEventEnd: (entry as PerformanceNavigationTiming).loadEventEnd,
            })),
        );

        const pageLoadTime =
            navigationTiming[0].loadEventEnd - navigationTiming[0].startTime;
        logger.info(`Page load time: ${pageLoadTime}ms`);
        expect(pageLoadTime).toBeLessThan(maxLoadTime);
    },
);
