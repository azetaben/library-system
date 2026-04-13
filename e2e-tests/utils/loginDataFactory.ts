import {faker} from '@faker-js/faker';
import type {LoginCredentials} from './login.types.ts';
import {logger} from './Logger.ts';

export class LoginDataFactory {
    static invalidUser(): LoginCredentials {
        logger.info('Generating invalid-user login data');
        return {
            username: `${faker.internet.username()}_fake`,
            password: faker.internet.password(),
        };
    }

    static invalidPassword(validUsername: string): LoginCredentials {
        logger.info(
            `Generating invalid-password login data for user ${validUsername}`,
        );
        return {
            username: validUsername,
            password: faker.string.alphanumeric(3),
        };
    }

    static empty(): LoginCredentials {
        logger.info('Generating empty login data');
        return {
            username: '',
            password: '',
        };
    }
}
