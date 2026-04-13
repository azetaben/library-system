import {Given} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/Logger.ts';
import {envConfig} from '../config/env.config.ts';
import {isLoginTarget} from '../utils/stepSupport.ts';

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

Given('I click the start testing button', async function (this: CustomWorld) {
    await this.pm.getLandingPage().clickStartTesting();
});
