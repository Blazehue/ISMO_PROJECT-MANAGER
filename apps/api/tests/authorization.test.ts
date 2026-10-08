import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { createProject, createTask, createUser, resetDatabase } from './helpers';

const app = createApp({ rateLimits: { register: 1000 } });

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

/** Alice owns a project with a task; Bob is a second, unrelated user. */
const setup = async () => {
  const alice = await createUser(app);
  const bob = await createUser(app);
  const project = await createProject(app, alice.auth, { name: 'Alice project' });
  const task = await createTask(app, alice.auth, project.id, { name: 'Alice task' });
  return { alice, bob, project, task };
};

describe('authorization (IDOR protection)', () => {
  it("returns 404 when reading, updating or deleting another user's project", async () => {
    const { bob, project } = await setup();

    await request(app).get(`/api/projects/${project.id}`).set(bob.auth).expect(404);
    await request(app).put(`/api/projects/${project.id}`).set(bob.auth).send({ name: 'Hacked' }).expect(404);
    await request(app).delete(`/api/projects/${project.id}`).set(bob.auth).expect(404);

    const stored = await prisma.project.findUniqueOrThrow({ where: { id: project.id } });
    expect(stored.name).toBe('Alice project');
  });

  it("returns 404 when reading, updating or deleting another user's task", async () => {
    const { bob, task } = await setup();

    await request(app).get(`/api/tasks/${task.id}`).set(bob.auth).expect(404);
    await request(app).put(`/api/tasks/${task.id}`).set(bob.auth).send({ status: 'COMPLETED' }).expect(404);
    await request(app).delete(`/api/tasks/${task.id}`).set(bob.auth).expect(404);

    const stored = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(stored.status).toBe('PENDING');
  });

  it("blocks creating a task in another user's project", async () => {
    const { bob, project } = await setup();
    await request(app).post('/api/tasks').set(bob.auth).send({ projectId: project.id, name: 'Sneaky' }).expect(404);
  });

  it("blocks moving your own task into another user's project", async () => {
    const { bob, project } = await setup();
    const bobProject = await createProject(app, bob.auth);
    const bobTask = await createTask(app, bob.auth, bobProject.id);

    await request(app).put(`/api/tasks/${bobTask.id}`).set(bob.auth).send({ projectId: project.id }).expect(404);
  });

  it('only lists and counts the caller’s own data', async () => {
    const { bob, project } = await setup();

    const projects = await request(app).get('/api/projects').set(bob.auth).expect(200);
    expect(projects.body.data).toEqual([]);

    const tasks = await request(app).get(`/api/tasks?projectId=${project.id}`).set(bob.auth).expect(200);
    expect(tasks.body.data).toEqual([]);

    const dashboard = await request(app).get('/api/dashboard').set(bob.auth).expect(200);
    expect(dashboard.body.data).toMatchObject({ totalProjects: 0, totalTasks: 0 });
  });

  it('ignores a userId smuggled into the request body', async () => {
    const { alice, bob } = await setup();
    const res = await request(app)
      .post('/api/projects')
      .set(bob.auth)
      .send({ name: 'Mine', startDate: '2026-01-01', userId: alice.id })
      .expect(201);

    const stored = await prisma.project.findUniqueOrThrow({ where: { id: res.body.data.id } });
    expect(stored.userId).toBe(bob.id);
  });
});
