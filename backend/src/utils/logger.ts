import pino from 'pino';
import { env } from '../config/env';

/**
 * Structured logger using Pino.
 * In development: pretty-printed, human-readable output.
 * In production: JSON output (machine-readable, parseable by log aggregators).
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined,
});

export default logger;
