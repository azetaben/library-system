import {logger} from '../utils/Logger.ts';

export class StringHelpers {
    static split(delimiter: string, value: string): string[] {
        logger.info(`Splitting "${value}" by "${delimiter}"`);
        return value.includes(delimiter) ? value.split(delimiter) : [value];
    }

    static normalizeText(value: string): string {
        return value.trim().replace(/\s+/g, ' ').toLowerCase();
    }
}
