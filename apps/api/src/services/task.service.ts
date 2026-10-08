import type { CreateTaskInput, Paginated, Task, TaskListQuery, UpdateTaskInput } from '@ismo/shared';
import type { Prisma } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { notFound } from '../utils/AppError';
import { buildPagination, toSkipTake } from '../utils/pagination';
import { getOwnedProjectOrThrow } from './project.service';

const taskSelect = {
  id: true,
  projectId: true,
  name: true,
  description: true,
  priority: true,
  status: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  project: { select: { id: true, name: true } },
} satisfies Prisma.TaskSelect;

type TaskRow = Prisma.TaskGetPayload<{ select: typeof taskSelect }>;

const toTaskDto = (task: TaskRow): Task => ({
  ...task,
  dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});

const startOfTodayUtc = () => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

/** Tasks have no userId; ownership is resolved through the parent project. */
const ownedBy = (userId: string): Prisma.TaskWhereInput => ({ project: { userId } });

export const getOwnedTaskOrThrow = async (userId: string, taskId: string) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, ...ownedBy(userId) },
    select: taskSelect,
  });
  if (!task) throw notFound('Task');
  return task;
};

export const listTasks = async (userId: string, query: TaskListQuery): Promise<Paginated<Task>> => {
  const where: Prisma.TaskWhereInput = {
    ...ownedBy(userId),
    ...(query.projectId && { projectId: query.projectId }),
    ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
    ...(query.status && { status: query.status }),
    ...(query.priority && { priority: query.priority }),
    // AND keeps this composable with an explicit status filter.
    ...(query.overdue && {
      AND: [{ status: { not: 'COMPLETED' } }, { dueDate: { lt: startOfTodayUtc() } }],
    }),
  };
  const orderBy: Prisma.TaskOrderByWithRelationInput[] = [
    query.sortBy === 'dueDate'
      ? { dueDate: { sort: query.sortOrder, nulls: 'last' } }
      : { [query.sortBy]: query.sortOrder },
    { id: 'asc' },
  ];

  const [rows, total] = await prisma.$transaction([
    prisma.task.findMany({ where, orderBy, select: taskSelect, ...toSkipTake(query) }),
    prisma.task.count({ where }),
  ]);

  return { data: rows.map(toTaskDto), pagination: buildPagination(query.page, query.limit, total) };
};

export const getTask = async (userId: string, taskId: string) => toTaskDto(await getOwnedTaskOrThrow(userId, taskId));

export const createTask = async (userId: string, input: CreateTaskInput) => {
  // Without this check a user could add tasks to someone else's project.
  await getOwnedProjectOrThrow(userId, input.projectId);
  const task = await prisma.task.create({ data: input, select: taskSelect });
  return toTaskDto(task);
};

export const updateTask = async (userId: string, taskId: string, input: UpdateTaskInput) => {
  const existing = await getOwnedTaskOrThrow(userId, taskId);
  // Moving a task is a write to the destination project too, so check that as well.
  if (input.projectId && input.projectId !== existing.projectId) {
    await getOwnedProjectOrThrow(userId, input.projectId);
  }
  const task = await prisma.task.update({ where: { id: existing.id }, data: input, select: taskSelect });
  return toTaskDto(task);
};

export const deleteTask = async (userId: string, taskId: string) => {
  const existing = await getOwnedTaskOrThrow(userId, taskId);
  await prisma.task.delete({ where: { id: existing.id } });
};
