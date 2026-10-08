export const PROJECT_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const PROJECT_SORT_FIELDS = ['createdAt', 'name', 'startDate', 'endDate', 'status'] as const;
export type ProjectSortField = (typeof PROJECT_SORT_FIELDS)[number];

export const TASK_SORT_FIELDS = ['createdAt', 'name', 'dueDate', 'priority', 'status'] as const;
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];
