import {statSync, readdirSync, rmSync, existsSync} from 'node:fs';
import path from 'node:path';
import {logger} from '../runtime/logger.ts';

export interface CleanupConfig {
    retentionDays?: number;
    keepLatestCount?: number;
    maxDiskMB?: number;
    dryRun?: boolean;
}

/**
 * Clean up old test artifacts (screenshots, traces, logs).
 */
export class ArtifactCleanup {
    private static readonly ARTIFACT_DIRS = [
        'e2e-tests/reports/screenshots',
        'e2e-tests/reports/traces',
        'e2e-tests/reports/logs',
    ];

    static cleanupOldArtifacts(config: CleanupConfig = {}): void {
        const {
            retentionDays = 7,
            keepLatestCount = 10,
            dryRun = false,
        } = config;

        const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

        for (const dir of this.ARTIFACT_DIRS) {
            if (!existsSync(dir)) {
                continue;
            }

            try {
                const files = readdirSync(dir, {withFileTypes: true})
                    .filter((f) => f.isFile())
                    .map((f) => ({
                        name: f.name,
                        path: path.join(dir, f.name),
                        mtime: statSync(path.join(dir, f.name)).mtimeMs,
                    }))
                    .sort((a, b) => b.mtime - a.mtime);

                const filesToDelete = files
                    .slice(keepLatestCount)
                    .filter((f) => f.mtime < cutoffTime);

                const totalSize = filesToDelete.reduce((sum, f) => {
                    try {
                        return sum + statSync(f.path).size;
                    } catch {
                        return sum;
                    }
                }, 0);

                const freedMB = totalSize / 1024 / 1024;
                logger.info(
                    `Cleanup ${dir}: ${filesToDelete.length} files, ${freedMB.toFixed(1)}MB freed`
                );

                if (!dryRun) {
                    for (const file of filesToDelete) {
                        try {
                            rmSync(file.path);
                        } catch (error) {
                            logger.warn(`Failed to delete ${file.path}: ${error}`);
                        }
                    }
                }
            } catch (error) {
                logger.warn(`Cleanup error in ${dir}: ${error}`);
            }
        }
    }

    static getTotalArtifactSize(): number {
        let totalBytes = 0;

        for (const dir of this.ARTIFACT_DIRS) {
            if (!existsSync(dir)) {
                continue;
            }

            try {
                const files = readdirSync(dir, {withFileTypes: true})
                    .filter((f) => f.isFile());

                for (const file of files) {
                    totalBytes += statSync(path.join(dir, file.name)).size;
                }
            } catch (error) {
                logger.warn(`Size check error in ${dir}: ${error}`);
            }
        }

        return totalBytes;
    }

    static cleanupScenarioArtifacts(scenarioName: string, dryRun: boolean = false): void {
        const sanitized = scenarioName.replace(/[^a-z0-9-]/gi, '_');

        for (const dir of this.ARTIFACT_DIRS) {
            if (!existsSync(dir)) {
                continue;
            }

            try {
                const files = readdirSync(dir)
                    .filter((f) => f.includes(sanitized));

                logger.debug(`Cleanup ${scenarioName}: ${files.length} artifacts`);

                if (!dryRun) {
                    for (const file of files) {
                        rmSync(path.join(dir, file));
                    }
                }
            } catch (error) {
                logger.warn(`Cleanup error for ${scenarioName}: ${error}`);
            }
        }
    }
}

