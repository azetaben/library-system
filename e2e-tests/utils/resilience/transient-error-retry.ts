import {logger} from '../runtime/logger.ts';

export interface RetryOptions {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
    retryableErrors?: (error: unknown) => boolean;
}

/**
 * Retry wrapper for transient failures.
 * Implements exponential backoff with jitter.
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
): Promise<T> {
    const {
        maxAttempts = 3,
        initialDelayMs = 100,
        maxDelayMs = 5000,
        backoffMultiplier = 2,
        retryableErrors = isTransientError,
    } = options;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            logger.debug(`Attempt ${attempt}/${maxAttempts}`);
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === maxAttempts) {
                logger.error(`All ${maxAttempts} attempts failed`);
                throw error;
            }

            if (!retryableErrors(error)) {
                logger.warn(`Non-transient error, not retrying: ${error}`);
                throw error;
            }

            const delayMs = Math.min(
                initialDelayMs * Math.pow(backoffMultiplier, attempt - 1),
                maxDelayMs,
            ) + Math.random() * 100; // Jitter

            logger.warn(
                `Attempt ${attempt} failed, retrying in ${delayMs.toFixed(0)}ms: ${error}`,
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    throw lastError;
}

/**
 * Classify if error is transient (can retry) or permanent (fail fast).
 */
export function isTransientError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    const message = error.message.toLowerCase();

    // Network timeouts - TRANSIENT
    if (
        message.includes('timeout') ||
        message.includes('econnrefused') ||
        message.includes('econnreset') ||
        message.includes('etimedout')
    ) {
        return true;
    }

    // Network errors - TRANSIENT
    if (
        message.includes('offline') ||
        message.includes('no such host') ||
        message.includes('connection reset') ||
        message.includes('connection refused')
    ) {
        return true;
    }

    // Temporary service issues - TRANSIENT
    if (
        message.includes('503') ||
        message.includes('502') ||
        message.includes('429') ||
        message.includes('enotfound')
    ) {
        return true;
    }

    // Permanent errors - DON'T RETRY
    if (
        message.includes('404') ||
        message.includes('401') ||
        message.includes('403') ||
        message.includes('invalid') ||
        message.includes('not found')
    ) {
        return false;
    }

    return true;
}

export function retryOnTransient<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
): Promise<T> {
    return withRetry(fn, {maxAttempts});
}

export function retryNavigation<T>(
    fn: () => Promise<T>,
): Promise<T> {
    return withRetry(fn, {
        maxAttempts: 3,
        initialDelayMs: 500,
        maxDelayMs: 5000,
    });
}

export function retryInteraction<T>(
    fn: () => Promise<T>,
): Promise<T> {
    return withRetry(fn, {
        maxAttempts: 2,
        initialDelayMs: 100,
        maxDelayMs: 1000,
    });
}

