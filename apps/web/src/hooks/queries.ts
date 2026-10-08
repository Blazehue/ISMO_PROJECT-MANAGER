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
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ProjectFilters {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskFilters extends ProjectFilters {
  projectId?: string;
  priority?: string;
  overdue?: boolean;
}

/** Drop empty filters so URLs stay clean. */
const params = (filters: object) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''));

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', 'detail', id] as const,
  tasks: ['tasks'] as const,
};

export const useDashboard = () =>
  useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => (await api.get<{ data: DashboardStats }>('/dashboard')).data.data,
  });

export const useProjects = (filters: ProjectFilters, { enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: [...queryKeys.projects, 'list', filters],
    queryFn: async () => (await api.get<Paginated<Project>>('/projects', { params: params(filters) })).data,
    placeholderData: keepPreviousData,
    enabled,
  });

export const useProject = (id: string) =>
  useQuery({
    queryKey: queryKeys.project(id),
    queryFn: async () => (await api.get<{ data: Project }>(`/projects/${id}`)).data.data,
  });

export const useTasks = (filters: TaskFilters) =>
  useQuery({
    queryKey: [...queryKeys.tasks, filters],
    queryFn: async () => (await api.get<Paginated<Task>>('/tasks', { params: params(filters) })).data,
    placeholderData: keepPreviousData,
  });

/** Open tasks sorted by due date, for the dashboard's deadline widgets. */
export const useTasksByDueDate = () =>
  useQuery({
    queryKey: [...queryKeys.tasks, 'by-due-date'],
    queryFn: async () =>
      (await api.get<Paginated<Task>>('/tasks', { params: { sortBy: 'dueDate', sortOrder: 'asc', limit: 100 } })).data
        .data,
  });

/** A single task (GET /tasks/:id), e.g. the latest copy before editing. */
export const useTask = (id: string | undefined) =>
  useQuery({
    queryKey: [...queryKeys.tasks, 'detail', id],
    queryFn: async () => (await api.get<{ data: Task }>(`/tasks/${id}`)).data.data,
    enabled: Boolean(id),
  });

/** Projects, tasks and the dashboard all derive from the same data, so refresh them together. */
const useInvalidateAll = () => {
  const queryClient = useQueryClient();
  return ({ deletedProjectId }: { deletedProjectId?: string } = {}) =>
    Promise.all([
      // Skip refetching a project that was just deleted (it would 404); its screen is about to unmount.
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects,
        predicate: (query) =>
          !(deletedProjectId && query.queryKey[1] === 'detail' && query.queryKey[2] === deletedProjectId),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ]);
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
