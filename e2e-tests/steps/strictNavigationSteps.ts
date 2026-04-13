import {When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/Logger.ts';
import {assertExactControlClickable, exactControlLocator} from './strictNavigationAssertions.ts';

When(
    'I click the exact text control {string}',
    async function (this: CustomWorld, label: string) {
        logger.info(`Clicking exact text control "${label}"`);
        await assertExactControlClickable(this, label);
        await exactControlLocator(this, label).click();
    },
);
