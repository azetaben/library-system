import {logger} from '../runtime/logger.ts';

export interface WorkerMetrics {
    workerId: string;
    pid: number;
    scenariosRun: number;
    scenariosPassed: number;
    scenariosFailed: number;
    totalTimeMs: number;
    memoryUsageMB: number;
}

/**
 * Monitor worker health and performance in parallel execution.
 */
export class WorkerMonitor {
    private static readonly workers = new Map<string, WorkerMetrics>();

    static registerWorker(workerId: string = `worker-${process.pid}`): void {
        this.workers.set(workerId, {
            workerId,
            pid: process.pid,
            scenariosRun: 0,
            scenariosPassed: 0,
            scenariosFailed: 0,
            totalTimeMs: 0,
            memoryUsageMB: 0,
        });

        logger.info(`Registered worker: ${workerId} (PID: ${process.pid})`);
    }

    static recordScenario(
        workerId: string,
        passed: boolean,
        durationMs: number
    ): void {
        const worker = this.workers.get(workerId);
        if (!worker) return;

        worker.scenariosRun++;
        if (passed) {
            worker.scenariosPassed++;
        } else {
            worker.scenariosFailed++;
        }
        worker.totalTimeMs += durationMs;

        const memUsage = process.memoryUsage();
        worker.memoryUsageMB = memUsage.heapUsed / 1024 / 1024;

        logger.debug(
            `${workerId}: ${worker.scenariosPassed}/${worker.scenariosRun} passed ` +
            `(${worker.memoryUsageMB.toFixed(0)}MB)`
        );
    }

    static getMetrics(workerId: string): WorkerMetrics | undefined {
        return this.workers.get(workerId);
    }

    static getAllMetrics(): WorkerMetrics[] {
        return Array.from(this.workers.values());
    }

    static printSummary(): void {
        const allMetrics = this.getAllMetrics();
        if (allMetrics.length === 0) return;

        logger.info('=== Worker Summary ===');
        for (const worker of allMetrics) {
            const passRate = (
                (worker.scenariosPassed / worker.scenariosRun) * 100
            ).toFixed(1);
            logger.info(
                `${worker.workerId}: ${worker.scenariosPassed}/${worker.scenariosRun} passed ` +
                `(${passRate}%) | ${worker.totalTimeMs}ms | ${worker.memoryUsageMB.toFixed(0)}MB`
            );
        }
    }
}

