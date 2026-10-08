import { z } from 'zod';
import { SORT_ORDERS, TASK_PRIORITIES, TASK_SORT_FIELDS, TASK_STATUSES } from '../enums';
import { nonEmptyUpdate, optionalDate, optionalText, paginationSchema, requiredText, searchSchema } from './common';

const taskFields = z.object({
  projectId: z.uuid('A valid project is required'),
  name: requiredText('Task name', 160),
  description: optionalText('Description', 2000),
  priority: z.enum(TASK_PRIORITIES, { error: 'Priority must be Low, Medium or High' }),
  status: z.enum(TASK_STATUSES, { error: 'Status must be Pending, In Progress or Completed' }),
  dueDate: optionalDate('Due date'),
});

export const createTaskSchema = taskFields.extend({
  priority: taskFields.shape.priority.default('MEDIUM'),
  status: taskFields.shape.status.default('PENDING'),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/** Partial update; also used to mark a task complete with `{ status: 'COMPLETED' }`. */
export const updateTaskSchema = taskFields.partial().refine(nonEmptyUpdate, 'Provide at least one field to update');
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskListQuerySchema = paginationSchema.extend({
  projectId: z.uuid('Invalid project id').optional(),
  search: searchSchema,
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  /** `true` → only unfinished tasks whose due date has passed. */
  overdue: z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((value) => value === 'true' || value === '1'),
  sortBy: z.enum(TASK_SORT_FIELDS).default('createdAt'),
  sortOrder: z.enum(SORT_ORDERS).default('desc'),
});
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
