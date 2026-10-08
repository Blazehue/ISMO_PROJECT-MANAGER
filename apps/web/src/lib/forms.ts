import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { getErrorMessage, getFieldErrors } from './api';

/**
 * Maps a failed API call onto the form: field errors go next to their inputs,
 * anything else is returned as a general message.
 */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  const fieldErrors = getFieldErrors(error);
  if (fieldErrors) {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (messages?.[0]) setError(field as Path<T>, { type: 'server', message: messages[0] });
    }
  }
  return getErrorMessage(error);
}
