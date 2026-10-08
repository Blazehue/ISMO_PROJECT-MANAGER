import { z } from 'zod';
import { PROJECT_SORT_FIELDS, PROJECT_STATUSES, SORT_ORDERS } from '../enums';
import {
  nonEmptyUpdate,
  optionalDate,
  optionalText,
  paginationSchema,
  requiredDate,
  requiredText,
  searchSchema,
} from './common';

const projectFields = z.object({
  name: requiredText('Project name', 120),
  description: optionalText('Description', 2000),
  status: z.enum(PROJECT_STATUSES, { error: 'Status must be Not Started, In Progress or Completed' }),
  startDate: requiredDate('Start date'),
  endDate: optionalDate('End date'),
});

type DateRange = { startDate?: Date | null; endDate?: Date | null };

/** Shared with the API service, which re-checks after merging a partial update. */
export const isValidDateRange = ({ startDate, endDate }: DateRange) =>
  !startDate || !endDate || endDate.getTime() >= startDate.getTime();

const dateRangeIssue = { message: 'End date cannot be before the start date', path: ['endDate'] };

export const createProjectSchema = projectFields
  .extend({ status: projectFields.shape.status.default('NOT_STARTED') })
  .refine(isValidDateRange, dateRangeIssue);
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = projectFields
  .partial()
  .refine(nonEmptyUpdate, 'Provide at least one field to update')
  .refine(isValidDateRange, dateRangeIssue);
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectListQuerySchema = paginationSchema.extend({
  search: searchSchema,
  status: z.enum(PROJECT_STATUSES).optional(),
  sortBy: z.enum(PROJECT_SORT_FIELDS).default('createdAt'),
  sortOrder: z.enum(SORT_ORDERS).default('desc'),
});
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
