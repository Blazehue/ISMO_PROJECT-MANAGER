import { Router } from 'express';
import type { RateLimiters } from '../middleware/rateLimit';
import { authRoutes } from './auth.routes';
import { dashboardRoutes } from './dashboard.routes';
import { healthRoutes } from './health.routes';
import { projectRoutes } from './project.routes';
import { taskRoutes } from './task.routes';

export const apiRoutes = (limiters: RateLimiters) =>
  Router()
    .use('/health', healthRoutes)
    .use(limiters.api)
    .use('/auth', authRoutes(limiters))
    .use('/projects', projectRoutes)
    .use('/tasks', taskRoutes)
    .use('/dashboard', dashboardRoutes);
