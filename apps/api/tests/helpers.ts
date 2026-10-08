import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

export const resetDatabase = async () => {
  // Cascades remove projects, tasks and refresh tokens.
  await prisma.user.deleteMany();
};

let counter = 0;

/** Registers a fresh user through the API and returns an authenticated agent helper. */
export const createUser = async (app: ReturnType<typeof createApp>) => {
  counter += 1;
  const credentials = {
    name: `Test User ${counter}`,
    email: `user${counter}-${Date.now()}@example.test`,
    password: 'Password123',
  };
  const res = await request(app).post('/api/auth/register').set('X-Client', 'mobile').send(credentials).expect(201);

  const auth = { Authorization: `Bearer ${res.body.accessToken as string}` };
  return { ...credentials, id: res.body.user.id as string, auth, refreshToken: res.body.refreshToken as string };
};

export const createProject = async (
  app: ReturnType<typeof createApp>,
  auth: Record<string, string>,
  overrides: Record<string, unknown> = {},
) => {
  const res = await request(app)
    .post('/api/projects')
    .set(auth)
    .send({ name: 'Project', startDate: '2026-01-01', ...overrides })
    .expect(201);
  return res.body.data as { id: string };
};

export const createTask = async (
  app: ReturnType<typeof createApp>,
  auth: Record<string, string>,
  projectId: string,
  overrides: Record<string, unknown> = {},
) => {
  const res = await request(app)
    .post('/api/tasks')
    .set(auth)
    .send({ projectId, name: 'Task', ...overrides })
    .expect(201);
  return res.body.data as { id: string };
};
