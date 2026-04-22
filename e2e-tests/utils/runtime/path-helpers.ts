import path from 'node:path';
import {logger} from './logger.ts';

export const resolveProjectPath = (...segments: string[]): string => {
    const resolvedPath = path.resolve(process.cwd(), ...segments);
    logger.info(`Resolved project path: ${resolvedPath}`);
    return resolvedPath;
};
