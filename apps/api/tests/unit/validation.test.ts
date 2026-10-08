import {
  createProjectSchema,
  createTaskSchema,
  isValidDateRange,
  loginSchema,
  registerSchema,
  taskListQuerySchema,
  updateTaskSchema,
} from '@ismo/shared';
import { describe, expect, it } from 'vitest';

// Unit tests for the shared Zod schemas: the same rules the web and mobile forms use.

describe('registerSchema', () => {
  it('normalises email and accepts a valid account', () => {
    const parsed = registerSchema.parse({
      name: '  Ada Lovelace ',
      email: ' ADA@Example.TEST ',
      password: 'Password1',
    });
    expect(parsed).toEqual({ name: 'Ada Lovelace', email: 'ada@example.test', password: 'Password1' });
  });

  it.each([
    ['empty name', { name: '   ', email: 'a@b.co', password: 'Password1' }],
    ['bad email', { name: 'Ada', email: 'not-an-email', password: 'Password1' }],
    ['short password', { name: 'Ada', email: 'a@b.co', password: 'Pass1' }],
    ['password without a number', { name: 'Ada', email: 'a@b.co', password: 'Passwordx' }],
    ['password over bcrypt limit', { name: 'Ada', email: 'a@b.co', password: `A1${'x'.repeat(80)}` }],
  ])('rejects %s', (_, input) => {
    expect(registerSchema.safeParse(input).success).toBe(false);
  });

  it('login only requires a non-empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });
});

describe('project schemas', () => {
  it('applies defaults, coerces dates and strips unknown fields', () => {
    const parsed = createProjectSchema.parse({ name: 'P', startDate: '2026-01-01', userId: 'attacker' });
    expect(parsed.status).toBe('NOT_STARTED');
    expect(parsed.startDate).toBeInstanceOf(Date);
    expect(parsed).not.toHaveProperty('userId');
  });

  it('turns an empty description or end date into null', () => {
    const parsed = createProjectSchema.parse({ name: 'P', startDate: '2026-01-01', description: '', endDate: '' });
    expect(parsed.description).toBeNull();
    expect(parsed.endDate).toBeNull();
  });

  it.each([
    ['invalid status', { name: 'P', startDate: '2026-01-01', status: 'HACKED' }],
    ['invalid date', { name: 'P', startDate: 'yesterday' }],
    ['absurd year', { name: 'P', startDate: '1066-10-14' }],
    ['end before start', { name: 'P', startDate: '2026-05-01', endDate: '2026-04-30' }],
  ])('rejects %s', (_, input) => {
    expect(createProjectSchema.safeParse(input).success).toBe(false);
  });

  it('isValidDateRange allows open-ended and same-day ranges', () => {
    const day = new Date('2026-05-01');
    expect(isValidDateRange({ startDate: day, endDate: null })).toBe(true);
    expect(isValidDateRange({ startDate: day, endDate: day })).toBe(true);
    expect(isValidDateRange({ startDate: day, endDate: new Date('2026-04-01') })).toBe(false);
  });
});

describe('task schemas', () => {
  it('defaults priority and status', () => {
    const parsed = createTaskSchema.parse({ projectId: crypto.randomUUID(), name: 'T' });
    expect(parsed).toMatchObject({ priority: 'MEDIUM', status: 'PENDING' });
  });

  it('requires a valid project id', () => {
    expect(createTaskSchema.safeParse({ projectId: '123', name: 'T' }).success).toBe(false);
  });

  it('accepts a partial update such as marking complete, but not an empty one', () => {
    expect(updateTaskSchema.parse({ status: 'COMPLETED' })).toEqual({ status: 'COMPLETED' });
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });

  it('parses list queries with defaults, limits and the overdue flag', () => {
    expect(taskListQuerySchema.parse({})).toMatchObject({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      overdue: false,
    });
    expect(taskListQuerySchema.parse({ overdue: 'true', page: '3' })).toMatchObject({ overdue: true, page: 3 });
    expect(taskListQuerySchema.safeParse({ limit: '1000' }).success).toBe(false);
    expect(taskListQuerySchema.safeParse({ sortBy: 'passwordHash' }).success).toBe(false);
  });
});
