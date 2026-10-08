import type { RequestHandler } from 'express';
import { currentUserId } from '../middleware/authenticate';
import { getDashboard } from '../services/dashboard.service';

export const get: RequestHandler = async (req, res) => {
  res.json({ data: await getDashboard(currentUserId(req)) });
};
