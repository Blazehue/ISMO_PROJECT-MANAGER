import type {
  CreateProjectInput,
  CreateTaskInput,
  DashboardStats,
  Paginated,
  Project,
  Task,
  UpdateProjectInput,
  UpdateTaskInput,
} from '@ismo/shared';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const PAGE_SIZE = 20;

const clean = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));

export const keys = {
  dashboard: ['dashboard'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', 'detail', id] as const,
  tasks: ['tasks'] as const,
  task: (id: string) => ['tasks', 'detail', id] as const,
};

export const useDashboard = () =>
  useQuery({
    queryKey: keys.dashboard,
    queryFn: async () => (await api.get<{ data: DashboardStats }>('/dashboard')).data.data,
  });

/** Paginated with infinite scroll: the API pages through results 20 at a time. */
export const useProjects = (filters: { search?: string; status?: string }) =>
  useInfiniteQuery({
    queryKey: [...keys.projects, 'list', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      (
        await api.get<Paginated<Project>>('/projects', {
          params: clean({ ...filters, page: pageParam, limit: PAGE_SIZE, sortBy: 'createdAt', sortOrder: 'desc' }),
        })
      ).data,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });

export const useProject = (id: string, { enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: keys.project(id),
    queryFn: async () => (await api.get<{ data: Project }>(`/projects/${id}`)).data.data,
    enabled: enabled && Boolean(id),
  });

export const useTasks = (filters: { projectId?: string; search?: string; status?: string; priority?: string }) =>
  useInfiniteQuery({
    queryKey: [...keys.tasks, 'list', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      (
        await api.get<Paginated<Task>>('/tasks', {
          params: clean({ ...filters, page: pageParam, limit: PAGE_SIZE, sortBy: 'createdAt', sortOrder: 'desc' }),
        })
      ).data,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });

/** Tasks sorted by due date (soonest first), for the Home deadline widgets. */
export const useTasksByDueDate = () =>
  useQuery({
    queryKey: [...keys.tasks, 'by-due-date'],
    queryFn: async () =>
      (await api.get<Paginated<Task>>('/tasks', { params: { sortBy: 'dueDate', sortOrder: 'asc', limit: 100 } })).data
        .data,
  });

export const useTask = (id: string | undefined) =>
  useQuery({
    queryKey: keys.task(id ?? ''),
    queryFn: async () => (await api.get<{ data: Task }>(`/tasks/${id}`)).data.data,
    enabled: Boolean(id),
  });

const useInvalidateAll = () => {
  const queryClient = useQueryClient();
  return ({ deletedProjectId }: { deletedProjectId?: string } = {}) =>
    Promise.all([
      // Skip refetching a project that was just deleted (it would 404); its screen is about to unmount.
      queryClient.invalidateQueries({
        queryKey: keys.projects,
        predicate: (query) =>
          !(deletedProjectId && query.queryKey[1] === 'detail' && query.queryKey[2] === deletedProjectId),
      }),
      queryClient.invalidateQueries({ queryKey: keys.tasks }),
      queryClient.invalidateQueries({ queryKey: keys.dashboard }),
    ]);
};

export const useCreateTask = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => (await api.post<{ data: Task }>('/tasks', input)).data.data,
    onSuccess: () => invalidate(),
  });
};

export const useUpdateTask = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      (await api.put<{ data: Task }>(`/tasks/${id}`, input)).data.data,
    onSuccess: () => invalidate(),
  });
};

export const useDeleteTask = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => invalidate(),
  });
};

export const useCreateProject = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => (await api.post<{ data: Project }>('/projects', input)).data.data,
    onSuccess: () => invalidate(),
  });
};

export const useUpdateProject = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      (await api.put<{ data: Project }>(`/projects/${id}`, input)).data.data,
    onSuccess: () => invalidate(),
  });
};

export const useDeleteProject = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: (_data, id) => invalidate({ deletedProjectId: id }),
  });
};
