import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { getErrorMessage, getFieldErrors } from './api';

/** Puts server field errors next to their inputs and returns a general message. */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  const fieldErrors = getFieldErrors(error);
  if (fieldErrors) {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (messages?.[0]) setError(field as Path<T>, { type: 'server', message: messages[0] });
    }
  }
  return getErrorMessage(error);
}
