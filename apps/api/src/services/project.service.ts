import {
  isValidDateRange,
  type CreateProjectInput,
  type Paginated,
  type Project,
  type ProjectListQuery,
  type UpdateProjectInput,
} from '@ismo/shared';
import type { Prisma, Project as ProjectRow } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { notFound, validationError } from '../utils/AppError';
import { buildPagination, toSkipTake } from '../utils/pagination';

const toIsoDate = (date: Date | null) => (date ? date.toISOString() : null);

type TaskCounts = { total: number; completed: number };

const toProjectDto = (project: ProjectRow, counts: TaskCounts = { total: 0, completed: 0 }): Project => ({
  id: project.id,
  name: project.name,
  description: project.description,
  status: project.status,
  startDate: project.startDate.toISOString(),
  endDate: toIsoDate(project.endDate),
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString(),
  taskCount: counts.total,
  completedTaskCount: counts.completed,
  progress: counts.total === 0 ? 0 : Math.round((counts.completed / counts.total) * 100),
});

/** Total and completed task counts for a set of projects, in one grouped query. */
const getTaskCounts = async (projectIds: string[]) => {
  const counts = new Map<string, TaskCounts>();
  if (projectIds.length === 0) return counts;

  const groups = await prisma.task.groupBy({
    by: ['projectId', 'status'],
    where: { projectId: { in: projectIds } },
    _count: { _all: true },
  });
  for (const group of groups) {
    const entry = counts.get(group.projectId) ?? { total: 0, completed: 0 };
    entry.total += group._count._all;
    if (group.status === 'COMPLETED') entry.completed += group._count._all;
    counts.set(group.projectId, entry);
  }
  return counts;
};

export const withTaskCounts = async (projects: ProjectRow[]) => {
  const counts = await getTaskCounts(projects.map((project) => project.id));
  return projects.map((project) => toProjectDto(project, counts.get(project.id)));
};

/**
 * The ownership check. Every read or write of a single project goes through this.
 * Filtering on both id and userId means another user's project looks exactly like
 * one that doesn't exist (404), so ids can't be probed.
 */
export const getOwnedProjectOrThrow = async (userId: string, projectId: string) => {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw notFound('Project');
  return project;
};

export const listProjects = async (userId: string, query: ProjectListQuery): Promise<Paginated<Project>> => {
  const where: Prisma.ProjectWhereInput = {
    userId,
    ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
    ...(query.status && { status: query.status }),
  };
  const orderBy: Prisma.ProjectOrderByWithRelationInput[] = [
    query.sortBy === 'endDate'
      ? { endDate: { sort: query.sortOrder, nulls: 'last' } }
      : { [query.sortBy]: query.sortOrder },
    { id: 'asc' }, // stable order across pages
  ];

  const [rows, total] = await prisma.$transaction([
    prisma.project.findMany({ where, orderBy, ...toSkipTake(query) }),
    prisma.project.count({ where }),
  ]);

  return {
    data: await withTaskCounts(rows),
    pagination: buildPagination(query.page, query.limit, total),
  };
};

export const getProject = async (userId: string, projectId: string) => {
  const [project] = await withTaskCounts([await getOwnedProjectOrThrow(userId, projectId)]);
  return project!;
};

export const createProject = async (userId: string, input: CreateProjectInput) => {
  // `input` has been through the Zod schema, so it only holds whitelisted fields.
  // userId always comes from the token.
  const project = await prisma.project.create({ data: { ...input, userId } });
  return toProjectDto(project);
};

export const updateProject = async (userId: string, projectId: string, input: UpdateProjectInput) => {
  const existing = await getOwnedProjectOrThrow(userId, projectId);

  // A partial update may change only one date, so check the range after merging.
  const merged = {
    startDate: input.startDate ?? existing.startDate,
    endDate: input.endDate === undefined ? existing.endDate : input.endDate,
  };
  if (!isValidDateRange(merged)) {
    throw validationError({ endDate: ['End date cannot be before the start date'] });
  }

  await prisma.project.update({ where: { id: existing.id }, data: input });
  return getProject(userId, projectId);
};

export const deleteProject = async (userId: string, projectId: string) => {
  const existing = await getOwnedProjectOrThrow(userId, projectId);
  // Tasks are removed by the ON DELETE CASCADE foreign key.
  await prisma.project.delete({ where: { id: existing.id } });
};
