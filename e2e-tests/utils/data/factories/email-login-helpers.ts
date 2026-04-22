import {faker} from '@faker-js/faker';
import {StringHelpers} from '../../text/string-helpers.ts';
import {logger} from '../../runtime/logger.ts';

export const uniqueEmail = (domain = 'example.test'): string => {
    const email = faker.internet.email({provider: domain});
    logger.info(`Generated unique email: ${email}`);
    return email;
};

export const uniqueUsername = (): string => {
    const username = `${faker.internet.username()}_${faker.string.alphanumeric(4)}`;
    logger.info(`Generated unique username: ${username}`);
    return username;
};

export const uniqueId = (prefix = 'test'): string => {
    const id = `${prefix}_${faker.string.alphanumeric(8)}`;
    logger.info(`Generated unique id: ${id}`);
    return id;
};

export const normalizeLoginText = (value: string): string =>
    StringHelpers.normalizeText(value);
