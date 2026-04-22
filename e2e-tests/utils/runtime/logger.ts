import {appendFileSync, existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';

type LogLevelName = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevelName, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

const normalizeLevel = (value?: string): LogLevelName => {
    const normalized = value?.trim().toLowerCase();
    if (normalized === 'debug') {
        return 'debug';
    }
    if (normalized === 'warn') {
        return 'warn';
    }
    if (normalized === 'error') {
        return 'error';
    }
    return 'info';
};

const activeLevel = normalizeLevel(process.env.LOG_LEVEL);
const consoleEnabled = process.env.LOG_TO_CONSOLE !== '0';
const fileEnabled = process.env.LOG_TO_FILE !== '0';
const logsDir = path.resolve(process.cwd(), 'e2e-tests', 'reports', 'logs');
const browserLabel = (process.env.BROWSER?.trim() || 'unknown-browser')
    .replace(/[^a-zA-Z0-9_-]+/g, '_');
const frameworkLogFile = path.join(logsDir, `framework-${browserLabel}.log`);
const errorLogFile = path.join(logsDir, `error-${browserLabel}.log`);
const processLabel = `pid=${process.pid}`;

const ensureLogsDir = (): void => {
    if (!fileEnabled || existsSync(logsDir)) {
        return;
    }

    mkdirSync(logsDir, {recursive: true});
};

const serializeMessage = (message: unknown): string => {
    if (typeof message === 'string') {
        return message;
    }
    if (message instanceof Error) {
        return message.stack || message.message;
    }
    if (message === undefined) {
        return '';
    }

    try {
        return JSON.stringify(message);
    } catch {
        return String(message);
    }
};

const writeToConsole = (level: LogLevelName, line: string): void => {
    if (!consoleEnabled) {
        return;
    }

    const output = `${line}\n`;
    if (level === 'warn' || level === 'error') {
        process.stderr.write(output);
        return;
    }

    process.stdout.write(output);
};

const writeToFile = (level: LogLevelName, line: string): void => {
    if (!fileEnabled) {
        return;
    }

    ensureLogsDir();
    appendFileSync(frameworkLogFile, `${line}\n`, 'utf8');
    if (level === 'error') {
        appendFileSync(errorLogFile, `${line}\n`, 'utf8');
    }
};

const log = (level: LogLevelName, message?: unknown): void => {
    if (LOG_LEVELS[level] < LOG_LEVELS[activeLevel]) {
        return;
    }

    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${processLabel}] ${level.toUpperCase()} ${serializeMessage(message)}`;
    writeToConsole(level, line);
    writeToFile(level, line);
};

export const logger = {
    debug: (message?: unknown) => log('debug', message),
    info: (message?: unknown) => log('info', message),
    warn: (message?: unknown) => log('warn', message),
    error: (message?: unknown) => log('error', message),
};
