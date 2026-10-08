export type FieldErrors = Record<string, string[]>;

/** An expected, client-facing error. Anything else is treated as a 500. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: FieldErrors,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (resource: string) => new AppError(404, 'NOT_FOUND', `${resource} not found`);

export const unauthorized = (message = 'Authentication required', code = 'UNAUTHORIZED') =>
  new AppError(401, code, message);

export const validationError = (details: FieldErrors) =>
  new AppError(400, 'VALIDATION_ERROR', 'Some fields are invalid', details);
