import type { DashboardStats } from '@ismo/shared';
import { prisma } from '../lib/prisma';
import { withTaskCounts } from './project.service';

const RECENT_PROJECTS = 5;

/** Every count is scoped to the authenticated user. */
export const getDashboard = async (userId: string): Promise<DashboardStats> => {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [totalProjects, projectsInProgress, taskGroups, overdueTasks, recent] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
    prisma.task.groupBy({
      by: ['status'],
      where: { project: { userId } },
      _count: { _all: true },
    }),
    prisma.task.count({
      where: { project: { userId }, status: { not: 'COMPLETED' }, dueDate: { lt: startOfToday } },
    }),
    prisma.project.findMany({
      where: { userId },
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      take: RECENT_PROJECTS,
    }),
  ]);

  const byStatus = (status: string) => taskGroups.find((group) => group.status === status)?._count._all ?? 0;

  return {
    totalProjects,
    totalTasks: taskGroups.reduce((sum, group) => sum + group._count._all, 0),
    completedTasks: byStatus('COMPLETED'),
    pendingTasks: byStatus('PENDING'),
    inProgressTasks: byStatus('IN_PROGRESS'),
    overdueTasks,
    projectsInProgress,
    recentProjects: await withTaskCounts(recent),
  };
};
