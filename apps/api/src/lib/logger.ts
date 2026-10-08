import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
  // Never let credentials reach the logs.
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.refreshToken',
      '*.accessToken',
    ],
    censor: '[REDACTED]',
  },
  ...(env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } },
  }),
});
