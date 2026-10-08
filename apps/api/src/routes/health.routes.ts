import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const healthRoutes = Router().get('/', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', time: new Date().toISOString() });
});
