import type { ProjectStatus, TaskPriority, TaskStatus } from '../enums';

/** Dates travel as ISO-8601 strings in JSON. */
type ISODate = string;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: ISODate;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  /** Only returned to mobile clients (`X-Client: mobile`); web gets an httpOnly cookie. */
  refreshToken?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: ISODate;
  endDate: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
  taskCount: number;
  completedTaskCount: number;
  /** 0–100, based on completed tasks. */
  progress: number;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
  project: { id: string; name: string };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  /** Not completed and past their due date. */
  overdueTasks: number;
  projectsInProgress: number;
  recentProjects: Project[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
