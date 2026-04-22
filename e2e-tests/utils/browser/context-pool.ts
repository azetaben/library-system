import type {Browser, BrowserContext} from '@playwright/test';
import {logger} from '../runtime/logger.ts';
import {BrowserFactory} from './browser-factory.ts';

export interface PoolConfig {
    poolSize?: number;
    maxContextAge?: number;
    validateInterval?: number;
}

/**
 * Context pool to reduce context creation overhead.
 */
export class ContextPool {
    private pool: BrowserContext[] = [];
    private pendingContexts = new Set<BrowserContext>();
    private contextCreationTime = new WeakMap<BrowserContext, number>();
    private readonly browser: Browser;
    private readonly poolSize: number;
    private readonly maxContextAgeMs: number;

    constructor(browser: Browser, config: PoolConfig = {}) {
        this.browser = browser;
        this.poolSize = config.poolSize ?? 5;
        this.maxContextAgeMs = config.maxContextAge ?? 10 * 60 * 1000;
    }

    async acquire(): Promise<BrowserContext> {
        let context = this.pool.pop();

        if (context && this.isContextValid(context)) {
            logger.debug('Reusing context from pool');
            return context;
        }

        if (context) {
            try {
                await context.close().catch(() => {});
            } catch (error) {
                logger.warn(`Error closing invalid context: ${error}`);
            }
        }

        logger.debug(`Pool empty, creating new context (${this.pendingContexts.size + 1}/${this.poolSize})`);
        context = await BrowserFactory.createContext(this.browser);
        this.contextCreationTime.set(context, Date.now());
        this.pendingContexts.add(context);

        return context;
    }

    async release(context: BrowserContext): Promise<void> {
        try {
            await context.clearCookies();
            await context.close();
        } catch (error) {
            logger.warn(`Error resetting context: ${error}`);
        } finally {
            this.pendingContexts.delete(context);
        }
    }

    private isContextValid(context: BrowserContext): boolean {
        try {
            const createdTime = this.contextCreationTime.get(context);
            if (createdTime && Date.now() - createdTime > this.maxContextAgeMs) {
                logger.debug('Context too old, discarding');
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    async drain(): Promise<void> {
        logger.info(`Draining context pool (${this.pool.length} contexts)`);

        const closePromises = this.pool.map((context) =>
            context.close().catch((error) => {
                logger.warn(`Error closing context: ${error}`);
            })
        );

        await Promise.all(closePromises);
        this.pool = [];

        for (const context of this.pendingContexts) {
            try {
                await context.close();
            } catch (error) {
                logger.warn(`Error closing pending context: ${error}`);
            }
        }
        this.pendingContexts.clear();

        logger.info('Context pool drained');
    }

    getStats(): {available: number; pending: number; total: number} {
        return {
            available: this.pool.length,
            pending: this.pendingContexts.size,
            total: this.pool.length + this.pendingContexts.size,
        };
    }
}

