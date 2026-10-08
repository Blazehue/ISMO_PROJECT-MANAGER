import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createRateLimiters, type RateLimits } from './middleware/rateLimit';
import { requestLogger } from './middleware/requestLogger';
import { apiRoutes } from './routes';

interface AppOptions {
  /** Override rate limits (used by tests that create many users). */
  rateLimits?: Partial<RateLimits>;
}

export const createApp = ({ rateLimits }: AppOptions = {}) => {
  const app = express();

  // Render and Vercel sit in front of the API; trust their X-Forwarded-For so
  // rate limiting keys on the real client IP.
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(requestLogger);
  app.use(helmet());
  // Only the web app's origin(s) may call the API from a browser. Mobile and
  // server-to-server calls send no Origin header and aren't affected by CORS.
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true, maxAge: 600 }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use('/api', apiRoutes(createRateLimiters(rateLimits)));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
