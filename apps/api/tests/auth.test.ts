import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { createUser, resetDatabase } from './helpers';

const app = createApp({ rateLimits: { register: 1000 } });

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe('auth', () => {
  it('registers a user, hashes the password and never returns the hash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada', email: 'ADA@Example.test', password: 'Password123' })
      .expect(201);

    expect(res.body.user).toEqual({
      id: expect.any(String),
      name: 'Ada',
      email: 'ada@example.test',
      createdAt: expect.any(String),
    });
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|Password123/);

    const stored = await prisma.user.findUniqueOrThrow({ where: { email: 'ada@example.test' } });
    expect(stored.passwordHash).not.toBe('Password123');
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$12\$/);
  });

  it('web clients get the refresh token as an httpOnly cookie, not in the body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Web', email: 'web@example.test', password: 'Password123' })
      .expect(201);

    expect(res.body.refreshToken).toBeUndefined();
    expect(res.headers['set-cookie']?.[0]).toMatch(/ismo_rt=.+HttpOnly; SameSite=Strict/);
  });

  it('rejects duplicate emails with 409', async () => {
    const user = await createUser(app);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Copy', email: user.email.toUpperCase(), password: 'Password123' })
      .expect(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('validates registration input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'not-an-email', password: 'short' })
      .expect(400);
    expect(Object.keys(res.body.error.details)).toEqual(['name', 'email', 'password']);
  });

  it('logs in without returning sensitive fields, and rejects wrong passwords', async () => {
    const user = await createUser(app);
    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200);
    expect(Object.keys(ok.body.user).sort()).toEqual(['createdAt', 'email', 'id', 'name']);

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'WrongPassword1' })
      .expect(401);
    expect(bad.body.error.message).toBe('Invalid email or password');
  });

  it('requires a valid token on protected routes', async () => {
    await request(app).get('/api/auth/me').expect(401);
    await request(app).get('/api/projects').set('Authorization', 'Bearer garbage').expect(401);
  });

  it('rotates refresh tokens and revokes every session when an old one is reused', async () => {
    const user = await createUser(app);
    const first = await request(app)
      .post('/api/auth/refresh')
      .set('X-Client', 'mobile')
      .send({ refreshToken: user.refreshToken })
      .expect(200);
    expect(first.body.refreshToken).not.toBe(user.refreshToken);

    // Replaying the old token looks like theft: it fails and kills the new one too.
    await request(app)
      .post('/api/auth/refresh')
      .set('X-Client', 'mobile')
      .send({ refreshToken: user.refreshToken })
      .expect(401);
    await request(app)
      .post('/api/auth/refresh')
      .set('X-Client', 'mobile')
      .send({ refreshToken: first.body.refreshToken })
      .expect(401);
  });

  it('logout revokes the refresh token', async () => {
    const user = await createUser(app);
    await request(app).post('/api/auth/logout').send({ refreshToken: user.refreshToken }).expect(204);
    await request(app)
      .post('/api/auth/refresh')
      .set('X-Client', 'mobile')
      .send({ refreshToken: user.refreshToken })
      .expect(401);
  });

  it('rate-limits repeated failed logins', async () => {
    const limitedApp = createApp(); // fresh limiter state
    const attempt = () =>
      request(limitedApp).post('/api/auth/login').send({ email: 'nobody@example.test', password: 'Wrong123' });

    for (let i = 0; i < 10; i += 1) {
      expect((await attempt()).status).toBe(401);
    }
    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('RATE_LIMITED');
  });
});
