import {Then} from '@cucumber/cucumber';
import {readFileSync} from 'node:fs';
import {CustomWorld} from '../support/world.ts';
import {AssertionHelpers, assertVisualSnapshot} from '../utils/assertions/index.ts';
import {envConfig} from '../config/env.config.ts';
import {logger, normalizeNamedPage, routePattern} from '../utils/runtime/index.ts';

function expectedPageUrlPattern(world: CustomWorld, pageName: string): string | RegExp {
    const normalizedPage = normalizeNamedPage(pageName);

    if (!normalizedPage) {
        throw new Error(`Unsupported page for visual assertion: ${pageName}`);
    }

    if (normalizedPage === 'login') {
        return routePattern(envConfig.routes.login);
    }

    if (normalizedPage === 'books') {
        return world.pm.getBooksCatalogPage().getCatalogUrlPattern();
    }

    if (normalizedPage === 'addBook') {
        return routePattern(envConfig.routes.addBook);
    }

    if (normalizedPage === 'editBook') {
        return routePattern(envConfig.routes.editBook);
    }

    throw new Error(`Unsupported page for visual assertion: ${pageName}`);
}

Then(
    'the {string} page should match the visual baseline {string}',
    async function (this: CustomWorld, pageName: string, snapshotName: string) {
        logger.info(
            `Running visual assertion for page "${pageName}" with snapshot "${snapshotName}"`,
        );

        await AssertionHelpers.expectUrl(this.page, expectedPageUrlPattern(this, pageName));
        const {actualPath} = await assertVisualSnapshot(this.page, snapshotName);
        this.attach(readFileSync(actualPath), 'image/png');

    },
);

