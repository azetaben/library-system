import {When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/runtime/index.ts';

When('I click on the Logout link in the top navigation',
    async function (this: CustomWorld) {
        logger.info('Action: Clicks on the "Logout" link in the Top Navigation.');
        await this.pm.getTopNaviPage().clickLogout();
    },
);
