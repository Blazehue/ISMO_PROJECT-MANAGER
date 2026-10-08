import { z } from 'zod';

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

/** Required, trimmed, non-empty string. */
export const requiredText = (label: string, max: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

/** Optional free text. An empty string is stored as null so "cleared" is explicit. */
export const optionalText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .nullish()
    .transform((value) => (value === '' ? null : value));

const plausibleDate = (date: Date) => date.getUTCFullYear() >= MIN_YEAR && date.getUTCFullYear() <= MAX_YEAR;

/** Accepts ISO strings or Date objects; rejects garbage and absurd years. */
export const requiredDate = (label: string) =>
  z.coerce
    .date({ error: `${label} must be a valid date` })
    .refine(plausibleDate, `${label} must be between ${MIN_YEAR} and ${MAX_YEAR}`);

/** Like requiredDate, but null / '' clear the value and undefined leaves it untouched. */
export const optionalDate = (label: string) =>
  z.preprocess((value) => (value === '' ? null : value), requiredDate(label).nullable().optional());

export const idParamSchema = z.object({
  id: z.uuid('Invalid id'),
});
export type IdParam = z.infer<typeof idParamSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const searchSchema = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((value) => value || undefined);

export const nonEmptyUpdate = (value: Record<string, unknown>) =>
  Object.values(value).some((field) => field !== undefined);
