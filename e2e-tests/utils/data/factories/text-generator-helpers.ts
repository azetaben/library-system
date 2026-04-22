import {faker} from '@faker-js/faker';
import {logger} from '../../runtime/logger.ts';

export class TextGeneratorHelpers {
    static lowerCase(length: number): string {
        logger.info(`Generating lowercase text of length ${length}`);
        return faker.string.alpha({length, casing: 'lower'});
    }

    static upperCase(length: number): string {
        logger.info(`Generating uppercase text of length ${length}`);
        return faker.string.alpha({length, casing: 'upper'});
    }

    static alphaNumeric(length = 15): string {
        logger.info(`Generating alphanumeric text of length ${length}`);
        return faker.string.alphanumeric(length);
    }
}
