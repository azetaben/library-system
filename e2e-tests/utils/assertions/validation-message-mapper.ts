import {logger} from '../runtime/logger.ts';

export interface ValidationMessageRule {
    pattern: RegExp;
    description?: string;
}

export class ValidationMessageMapper {
    /**
     * Unified validation message equivalent patterns.
     * These patterns are used to match various UI error message formats
     * that represent the same validation rule across different forms.
     */
    private static readonly GENERIC_PATTERNS = new Map<string, RegExp>([
        // Genre validation
        [
            'please select a valid genre.',
            /genre\s*(is\s*)?required|please\s*select\s*a\s*valid\s*genre/i,
        ],

        // Publication date validation
        [
            'publication date cannot be in the future.',
            /publication\s*date|date.*(cannot\s*)?be\s*in\s*the\s*future|future\s*date/i,
        ],

        // Price validation - general
        [
            'price must be greater than 0.',
            /price\s*(must\s*)?be\s*greater\s*than\s*0|price.*invalid|must\s*be\s*positive/i,
        ],

        // Price validation - number format
        [
            'price must be a valid number.',
            /price.*number|price.*invalid|price.*format/i,
        ],

        // Title validation
        [
            'title is required.',
            /title\s*(is\s*)?required|please\s*enter.*title/i,
        ],

        // Author validation
        [
            'author is required.',
            /author\s*(is\s*)?required|please\s*enter.*author/i,
        ],
    ]);

    /**
     * Get the equivalent pattern for a given validation message.
     * Useful for flexible assertion matching when UI error messages vary.
     */
    static getEquivalentPattern(expectedMessage: string): RegExp | undefined {
        const normalized = expectedMessage.trim().toLowerCase();
        logger.debug(`Looking up pattern for message: "${normalized}"`);

        const pattern = this.GENERIC_PATTERNS.get(normalized);
        if (pattern) {
            logger.debug(`Found equivalent pattern: ${pattern}`);
        } else {
            logger.debug(`No equivalent pattern found for: "${normalized}"`);
        }

        return pattern;
    }

    /**
     * Check if actual error message matches expected message or its equivalent pattern.
     */
    static isEquivalentMessage(actual: string, expected: string): boolean {
        const normalizedActual = actual.trim().toLowerCase();
        const normalizedExpected = expected.trim().toLowerCase();

        // Exact match
        if (normalizedActual === normalizedExpected) {
            return true;
        }

        // Pattern match
        const pattern = this.getEquivalentPattern(expected);
        if (pattern) {
            return pattern.test(normalizedActual);
        }

        return false;
    }

    /**
     * Get all message patterns (useful for debugging or generating documentation)
     */
    static getAllPatterns(): Map<string, RegExp> {
        return new Map(this.GENERIC_PATTERNS);
    }
}

