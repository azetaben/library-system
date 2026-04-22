import {logger} from '../runtime/logger.ts';

export interface RateLimiterConfig {
    rps?: number;
    burstSize?: number;
    keyPrefix?: string;
}

/**
 * Rate limiter using token bucket algorithm.
 */
export class RateLimiter {
    private tokens = 0;
    private lastRefillTime = Date.now();
    private readonly maxTokens: number;
    private readonly refillRatePerMs: number;

    constructor(config: RateLimiterConfig = {}) {
        const rps = config.rps ?? 10;
        const burstSize = config.burstSize ?? rps * 2;

        this.maxTokens = burstSize;
        this.tokens = burstSize;
        this.refillRatePerMs = rps / 1000;
    }

    async checkAndWait(key: string = 'default'): Promise<number> {
        const now = Date.now();
        const timeSinceLastRefill = now - this.lastRefillTime;

        this.tokens = Math.min(
            this.maxTokens,
            this.tokens + timeSinceLastRefill * this.refillRatePerMs
        );

        this.lastRefillTime = now;

        if (this.tokens >= 1) {
            this.tokens -= 1;
            logger.debug(`RateLimit[${key}]: Allow (tokens: ${this.tokens.toFixed(2)})`);
            return 0;
        }

        const waitMs = (1 - this.tokens) / this.refillRatePerMs;
        logger.debug(
            `RateLimit[${key}]: Throttle ${waitMs.toFixed(0)}ms (tokens: ${this.tokens.toFixed(2)})`
        );

        await new Promise((resolve) => setTimeout(resolve, waitMs));
        this.tokens -= 1;

        return waitMs;
    }

    reset(): void {
        this.tokens = this.maxTokens;
        this.lastRefillTime = Date.now();
        logger.debug('RateLimiter reset');
    }

    getState(): {tokens: number; maxTokens: number} {
        return {
            tokens: this.tokens,
            maxTokens: this.maxTokens,
        };
    }
}

let globalRateLimiter: RateLimiter;

export function initializeGlobalRateLimiter(config?: RateLimiterConfig): RateLimiter {
    globalRateLimiter = new RateLimiter(config);
    logger.info(`Global rate limiter initialized: ${config?.rps ?? 10} req/sec`);
    return globalRateLimiter;
}

export function getGlobalRateLimiter(): RateLimiter {
    if (!globalRateLimiter) {
        globalRateLimiter = new RateLimiter();
    }
    return globalRateLimiter;
}

export async function withRateLimit<T>(
    fn: () => Promise<T>,
    key: string = 'default'
): Promise<T> {
    const limiter = getGlobalRateLimiter();
    await limiter.checkAndWait(key);
    return fn();
}

