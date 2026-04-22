import {logger} from '../runtime/logger.ts';

export const CircuitState = {
    CLOSED: 'closed',
    OPEN: 'open',
    HALF_OPEN: 'half-open',
} as const;

export type CircuitState = (typeof CircuitState)[keyof typeof CircuitState];

export interface CircuitBreakerConfig {
    failureThreshold?: number;
    resetTimeoutMs?: number;
    halfOpenRequests?: number;
    onStateChange?: (state: CircuitState) => void;
}

/**
 * Circuit breaker to prevent cascading failures.
 */
export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount = 0;
    private successCount = 0;
    private lastFailureTime = 0;
    private readonly failureThreshold: number;
    private readonly resetTimeoutMs: number;
    private readonly halfOpenRequests: number;
    private readonly onStateChange?: (state: CircuitState) => void;

    constructor(config: CircuitBreakerConfig = {}) {
        this.failureThreshold = config.failureThreshold ?? 5;
        this.resetTimeoutMs = config.resetTimeoutMs ?? 60_000;
        this.halfOpenRequests = config.halfOpenRequests ?? 3;
        this.onStateChange = config.onStateChange;
    }

    async execute<T>(fn: () => Promise<T>, name: string = 'unknown'): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
                this.transitionTo(CircuitState.HALF_OPEN, name);
            } else {
                throw new Error(
                    `[CircuitBreaker] ${name} is OPEN. Service unavailable.`
                );
            }
        }

        try {
            const result = await fn();
            this.onSuccess(name);
            return result;
        } catch (error) {
            this.onFailure(name);
            throw error;
        }
    }

    private onSuccess(name: string): void {
        this.failureCount = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;

            if (this.successCount >= this.halfOpenRequests) {
                logger.info(`[CircuitBreaker] ${name}: Service recovered, CLOSED`);
                this.transitionTo(CircuitState.CLOSED, name);
            }
        }
    }

    private onFailure(name: string): void {
        this.lastFailureTime = Date.now();
        this.failureCount++;
        this.successCount = 0;

        logger.warn(
            `[CircuitBreaker] ${name}: Failure ${this.failureCount}/${this.failureThreshold}`
        );

        if (this.failureCount >= this.failureThreshold) {
            logger.error(`[CircuitBreaker] ${name}: Failure threshold exceeded, OPEN`);
            this.transitionTo(CircuitState.OPEN, name);
        }
    }

    private transitionTo(newState: CircuitState, name: string): void {
        if (this.state === newState) return;

        logger.info(`[CircuitBreaker] ${name}: ${this.state} → ${newState}`);
        this.state = newState;

        if (newState === CircuitState.HALF_OPEN) {
            this.successCount = 0;
        }

        this.onStateChange?.(newState);
    }

    getState(): CircuitState {
        return this.state;
    }

    reset(): void {
        this.transitionTo(CircuitState.CLOSED, 'reset');
        this.failureCount = 0;
        this.successCount = 0;
    }

    getStats(): {state: CircuitState; failures: number; successes: number} {
        return {
            state: this.state,
            failures: this.failureCount,
            successes: this.successCount,
        };
    }
}

let globalWarmupBreaker: CircuitBreaker;

export function getGlobalWarmupBreaker(): CircuitBreaker {
    if (!globalWarmupBreaker) {
        globalWarmupBreaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeoutMs: 30_000,
        });
    }
    return globalWarmupBreaker;
}

