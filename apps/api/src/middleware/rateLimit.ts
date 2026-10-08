import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const minutes = (n: number) => n * 60 * 1000;

const limiter = (windowMs: number, limit: number, message: string, skipSuccessfulRequests = false) =>
  rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({ error: { code: 'RATE_LIMITED', message } });
    },
  });

/** Max requests per window, per client IP. */
export const DEFAULT_RATE_LIMITS = {
  login: 10, // failed attempts per 15 minutes
  register: 10, // per hour
  refresh: 30, // per minute
  api: 300, // per minute
};
export type RateLimits = typeof DEFAULT_RATE_LIMITS;

/**
 * Created per app instance (in-memory store, keyed by client IP).
 * Login only counts failed attempts, so normal users are never blocked.
 */
export const createRateLimiters = (overrides: Partial<RateLimits> = {}) => {
  const limits = { ...DEFAULT_RATE_LIMITS, ...overrides };
  return {
    login: limiter(minutes(15), limits.login, 'Too many failed login attempts. Try again in 15 minutes.', true),
    register: limiter(minutes(60), limits.register, 'Too many accounts created from this network. Try again later.'),
    refresh: limiter(minutes(1), limits.refresh, 'Too many requests. Slow down.'),
    api: limiter(minutes(1), limits.api, 'Too many requests. Slow down.'),
  };
};

export type RateLimiters = ReturnType<typeof createRateLimiters>;
