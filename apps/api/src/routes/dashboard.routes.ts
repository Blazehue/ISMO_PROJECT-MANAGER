import { Router } from 'express';
import * as dashboard from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/authenticate';

export const dashboardRoutes = Router().get('/', authenticate, dashboard.get);
