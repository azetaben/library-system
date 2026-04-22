import {Given} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/runtime/index.ts';
import {envConfig} from '../config/env.config.ts';
import {isLoginTarget} from '../utils/runtime/index.ts';

Given(
    'I am on the landing page',
    async function (this: CustomWorld, target?: string) {
        logger.info('Action: Navigating to the landing page...');
        const readyLocator = target && isLoginTarget(target)
            ? this.pm.getLoginPage().usernameInput()
            : this.pm.getLandingPage().startTestingButton();

        await this.pm
            .getBasePage()
            .navigateWhenResponsive(envConfig.baseUrl, readyLocator);
    },
);

