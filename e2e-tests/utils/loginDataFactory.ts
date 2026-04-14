import {faker} from '@faker-js/faker';
import type {LoginCredentials, NegativeLoginExample} from './login.types.ts';
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

    static sqlInjection(validPassword = 'admin'): LoginCredentials {
        logger.info('Generating SQL-injection-style login data');
        return {
            username: `' OR '1'='1`,
            password: validPassword,
        };
    }

    static leadingTrailingSpaces(): LoginCredentials {
        logger.info('Generating login data with leading and trailing spaces');
        return {
            username: ' admin ',
            password: ' admin ',
        };
    }

    static negativeExamples(validUsername = 'admin'): NegativeLoginExample[] {
        logger.info('Generating negative login examples');
        return [
            {
                key: 'unknown-user',
                description: 'Failed login with an unregistered username',
                expectedMessage: 'Invalid username or password',
                ...this.invalidUser(),
            },
            {
                key: 'wrong-password',
                description: 'Failed login with a valid username and wrong password',
                expectedMessage: 'Invalid username or password',
                ...this.invalidPassword(validUsername),
            },
            {
                key: 'empty-credentials',
                description: 'Failed login with completely empty credentials',
                expectedMessage: 'Please enter your username',
                ...this.empty(),
            },
            {
                key: 'sql-injection',
                description: 'Failed login with SQL injection style username input',
                expectedMessage: 'Invalid username or password',
                ...this.sqlInjection(),
            },
        ];
    }

    static negativeExampleByKey(
        key: string,
        validUsername = 'admin',
    ): NegativeLoginExample {
        logger.info(`Resolving negative login example "${key}"`);
        const example = this.negativeExamples(validUsername).find(
            (entry) => entry.key === key,
        );

        if (!example) {
            throw new Error(`Unsupported negative login example key: ${key}`);
        }

        return example;
    }
}
