import { loginSchema, refreshSchema, registerSchema } from '@ismo/shared';
import { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import type { RateLimiters } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';

export const authRoutes = (limiters: RateLimiters) =>
  Router()
    .post('/register', limiters.register, validate({ body: registerSchema }), auth.register)
    .post('/login', limiters.login, validate({ body: loginSchema }), auth.login)
    .post('/refresh', limiters.refresh, validate({ body: refreshSchema }), auth.refresh)
    .post('/logout', validate({ body: refreshSchema }), auth.logout)
    .get('/me', authenticate, auth.me);
