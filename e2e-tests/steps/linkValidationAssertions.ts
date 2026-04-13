import {Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/Logger.ts';

Then(
    'all same-origin links on the page should not be broken',
    async function (this: CustomWorld) {
        const baseUrl = new URL(this.page.url());
        const hrefs = await this.page
            .locator('a[href]')
            .evaluateAll((links) =>
                links
                    .map((link) => link.getAttribute('href'))
                    .filter((href): href is string => Boolean(href)),
            );

        const uniqueUrls = [...new Set(hrefs)]
            .map((href) => new URL(href, baseUrl.origin))
            .filter((url) => url.origin === baseUrl.origin)
            .filter((url) => !url.hash)
            .map((url) => url.toString());

        for (const url of uniqueUrls) {
            logger.info(`Validating same-origin link: ${url}`);
            const response = await this.page.request.get(url, {
                failOnStatusCode: false,
                maxRedirects: 5,
            });
            expect(response.status(), `Broken same-origin link detected: ${url}`).toBeLessThan(
                400,
            );
        }
    },
);
