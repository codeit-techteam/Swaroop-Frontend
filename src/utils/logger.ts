import { appConfig } from '@/config/env';
import type { LogLevel } from '@/types';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LOG_LEVEL: LogLevel = appConfig.isDev ? 'debug' : 'warn';

const shouldLog = (level: LogLevel): boolean => LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];

const formatMessage = (level: LogLevel, message: string, context?: unknown): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context !== undefined ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
};

export const logger = {
  debug: (message: string, context?: unknown): void => {
    if (shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.debug(formatMessage('debug', message, context));
    }
  },
  info: (message: string, context?: unknown): void => {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(formatMessage('info', message, context));
    }
  },
  warn: (message: string, context?: unknown): void => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, context));
    }
  },
  error: (message: string, context?: unknown): void => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, context));
    }
  },
};
