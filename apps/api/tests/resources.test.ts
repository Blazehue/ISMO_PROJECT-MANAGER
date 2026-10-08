import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { createProject, createTask, createUser, resetDatabase } from './helpers';

const app = createApp({ rateLimits: { register: 1000 } });

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe('projects and tasks', () => {
  it('rejects invalid enums, empty names, bad dates and inverted date ranges', async () => {
    const { auth } = await createUser(app);

    const bad = await request(app)
      .post('/api/projects')
      .set(auth)
      .send({ name: '   ', status: 'HACKED', startDate: 'not-a-date' })
      .expect(400);
    expect(Object.keys(bad.body.error.details).sort()).toEqual(['name', 'startDate', 'status']);

    const inverted = await request(app)
      .post('/api/projects')
      .set(auth)
      .send({ name: 'P', startDate: '2026-05-01', endDate: '2026-04-01' })
      .expect(400);
    expect(inverted.body.error.details.endDate).toBeDefined();
  });

  it('re-checks the date range when only one date is updated', async () => {
    const { auth } = await createUser(app);
    const project = await createProject(app, auth, { startDate: '2026-05-01' });
    await request(app).put(`/api/projects/${project.id}`).set(auth).send({ endDate: '2026-04-01' }).expect(400);
  });

  it('marks a task complete and reflects it on the dashboard', async () => {
    const { auth } = await createUser(app);
    const project = await createProject(app, auth, { status: 'IN_PROGRESS' });
    const task = await createTask(app, auth, project.id, { priority: 'HIGH' });
    await createTask(app, auth, project.id);
    await createTask(app, auth, project.id, { status: 'IN_PROGRESS', dueDate: '2020-01-01' }); // overdue

    await request(app).put(`/api/tasks/${task.id}`).set(auth).send({ status: 'COMPLETED' }).expect(200);

    const { body } = await request(app).get('/api/dashboard').set(auth).expect(200);
    expect(body.data).toMatchObject({
      totalProjects: 1,
      totalTasks: 3,
      completedTasks: 1,
      pendingTasks: 1,
      inProgressTasks: 1,
      overdueTasks: 1,
      projectsInProgress: 1,
    });
    expect(body.data.recentProjects[0].progress).toBe(33);

    const overdue = await request(app).get('/api/tasks?overdue=true').set(auth).expect(200);
    expect(overdue.body.data).toHaveLength(1);
  });

  it('searches, filters, sorts and paginates tasks', async () => {
    const { auth } = await createUser(app);
    const project = await createProject(app, auth);
    await createTask(app, auth, project.id, { name: 'Write report', priority: 'LOW' });
    await createTask(app, auth, project.id, { name: 'Review report', priority: 'HIGH' });
    await createTask(app, auth, project.id, { name: 'Order reagents', priority: 'HIGH', status: 'COMPLETED' });

    const search = await request(app).get('/api/tasks?search=REPORT').set(auth).expect(200);
    expect(search.body.data).toHaveLength(2);

    const filtered = await request(app).get('/api/tasks?priority=HIGH&status=PENDING').set(auth).expect(200);
    expect(filtered.body.data.map((t: { name: string }) => t.name)).toEqual(['Review report']);

    const page = await request(app).get('/api/tasks?sortBy=name&sortOrder=asc&limit=2&page=2').set(auth).expect(200);
    expect(page.body.data.map((t: { name: string }) => t.name)).toEqual(['Write report']);
    expect(page.body.pagination).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });

  it('deleting a project removes its tasks', async () => {
    const { auth } = await createUser(app);
    const project = await createProject(app, auth);
    const task = await createTask(app, auth, project.id);

    await request(app).delete(`/api/projects/${project.id}`).set(auth).expect(204);
    await request(app).get(`/api/tasks/${task.id}`).set(auth).expect(404);
  });
});
