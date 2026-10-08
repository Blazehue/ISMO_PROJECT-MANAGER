import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Filters, sorting and paging live in the URL so they survive reloads and can
 * be shared. Setting a value to '' removes it.
 */
export function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const get = useCallback((key: string, fallback = '') => searchParams.get(key) ?? fallback, [searchParams]);

  const update = useCallback(
    (updates: Record<string, string>) =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const page = Number(searchParams.get('page') ?? 1) || 1;
  return { get, update, page };
}
