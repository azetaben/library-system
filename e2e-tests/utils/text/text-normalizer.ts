import {logger} from '../runtime/logger.ts';

export class TextNormalizer {
    /**
     * Remove leading/trailing whitespace and convert to lowercase.
     * Use for case-insensitive comparisons.
     */
    static toLowerCase(value: string): string {
        logger.debug(`Normalizing text to lowercase: "${value}"`);
        return value.trim().toLowerCase();
    }

    /**
     * Normalize whitespace (collapse multiple spaces to single space) and trim.
     * Use for whitespace-insensitive comparisons.
     */
    static normalizeWhitespace(value: string): string {
        logger.debug(`Normalizing whitespace: "${value}"`);
        return value.replace(/\s+/g, ' ').trim();
    }

    /**
     * Full normalization: whitespace + lowercase.
     * Use for flexible text matching.
     */
    static normalize(value: string): string {
        logger.debug(`Full text normalization: "${value}"`);
        return this.toLowerCase(this.normalizeWhitespace(value));
    }

    /**
     * Normalize for regex escaping + pattern building.
     * Use before building regex patterns.
     */
    static normalizeForPattern(value: string): string {
        return value.trim();
    }

    /**
     * Check if two strings are equivalent after normalization.
     */
    static areEquivalent(
        actual: string,
        expected: string,
        normalizationMode: 'exact' | 'case-insensitive' | 'whitespace' | 'full' = 'full',
    ): boolean {
        switch (normalizationMode) {
            case 'exact':
                return actual === expected;
            case 'case-insensitive':
                return this.toLowerCase(actual) === this.toLowerCase(expected);
            case 'whitespace':
                return this.normalizeWhitespace(actual) === this.normalizeWhitespace(expected);
            case 'full':
                return this.normalize(actual) === this.normalize(expected);
        }
    }
}

