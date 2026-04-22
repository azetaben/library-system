import {logger} from '../runtime/logger.ts';

export interface MemoryMetrics {
    heapUsedMB: number;
    heapTotalMB: number;
    externalMB: number;
    timestamp: Date;
}

/**
 * Monitor and track memory usage for scenarios.
 */
export class MemoryMonitor {
    private static readonly MAX_HEAP_MB = 1024;
    private static readonly WARNING_THRESHOLD = 0.8;
    private static readonly CRITICAL_THRESHOLD = 0.95;

    static getMetrics(): MemoryMetrics {
        const usage = process.memoryUsage();
        return {
            heapUsedMB: usage.heapUsed / 1024 / 1024,
            heapTotalMB: usage.heapTotal / 1024 / 1024,
            externalMB: usage.external / 1024 / 1024,
            timestamp: new Date(),
        };
    }

    static checkHealth(maxHeapMB: number = this.MAX_HEAP_MB): 'ok' | 'warning' | 'critical' {
        const metrics = this.getMetrics();
        const usageRatio = metrics.heapUsedMB / maxHeapMB;

        logger.debug(
            `Memory: ${metrics.heapUsedMB.toFixed(0)}MB / ${maxHeapMB}MB (${(usageRatio * 100).toFixed(1)}%)`
        );

        if (usageRatio >= this.CRITICAL_THRESHOLD) {
            logger.error(`CRITICAL: Memory usage at ${(usageRatio * 100).toFixed(1)}%`);
            return 'critical';
        }

        if (usageRatio >= this.WARNING_THRESHOLD) {
            logger.warn(`WARNING: Memory usage at ${(usageRatio * 100).toFixed(1)}%`);
            return 'warning';
        }

        return 'ok';
    }

    static forceGarbageCollection(): void {
        if (global.gc) {
            logger.debug('Forcing garbage collection');
            global.gc();
        }
    }

    static getSnapshot(): MemoryMetrics {
        return this.getMetrics();
    }

    static compareSnapshots(
        before: MemoryMetrics,
        after: MemoryMetrics,
    ): {heapDeltaMB: number; durationMs: number} {
        return {
            heapDeltaMB: after.heapUsedMB - before.heapUsedMB,
            durationMs: after.timestamp.getTime() - before.timestamp.getTime(),
        };
    }
}

