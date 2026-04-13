import {Before, When} from '@cucumber/cucumber';
import {CustomWorld} from '../support/world.ts';
import {logger} from '../utils/Logger.ts';
import {testData} from '../utils/TestData.ts';

type SecurityWorld = CustomWorld & {
    securityDialogMessages?: string[];
};

Before({tags: '@security'}, async function (this: SecurityWorld) {
    this.securityDialogMessages = [];
    this.page.on('dialog', async (dialog) => {
        this.securityDialogMessages?.push(dialog.message());
        await dialog.dismiss().catch(() => {
        });
    });
});

When(
    'I input login name as {string}',
    async function (this: SecurityWorld, username: string) {
        const resolvedUsername =
            username === 'valid_user' ? testData.validUser.username : username;
        await this.pm.getLoginPage().fillUsername(resolvedUsername);
        logger.info(`Entered login name: ${resolvedUsername}`);
    },
);

When(
    'I input password {string}',
    async function (this: SecurityWorld, password: string) {
        const resolvedPassword =
            password === 'valid_password' ? testData.validUser.password : password;
        await this.pm.getLoginPage().fillPassword(resolvedPassword);
        logger.info('Entered password value');
    },
);

