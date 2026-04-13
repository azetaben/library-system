import {When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/Logger.ts';

When(
    'the user clicks on the Logout link in the top navigation',
    async function (this: CustomWorld) {
        logger.info('Action: User clicks on the "Logout" link in the Top Navigation.');
        await this.pm.getTopNaviPage().clickLogout();
    },
);
