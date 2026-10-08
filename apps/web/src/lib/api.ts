import type { ApiErrorBody, AuthResponse } from '@ismo/shared';
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * Same-origin `/api` by default: Vite proxies it in development and Vercel
 * rewrites it in production, so the refresh cookie is always first-party.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
  timeout: 30_000,
});

// The access token lives only in memory, never in localStorage, so an XSS bug
// can't lift it from storage. On reload it's restored with the httpOnly
// refresh cookie.
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

type SessionListener = () => void;
const sessionExpiredListeners = new Set<SessionListener>();
export const onSessionExpired = (listener: SessionListener) => {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
};

// One refresh in flight at a time. Parallel 401s share it, and so do React
// StrictMode double-mounts. Otherwise the second call would replay a rotated
// token and trigger reuse detection.
let refreshInFlight: Promise<AuthResponse> | null = null;
export const refreshSession = () => {
  refreshInFlight ??= api
    .post<AuthResponse>('/auth/refresh', {}, { skipAuthRefresh: true })
    .then(({ data }) => {
      setAccessToken(data.accessToken);
      return data;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
};

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Don't try to refresh on 401 (auth endpoints themselves). */
    skipAuthRefresh?: boolean;
  }
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(undefined, async (error: AxiosError<ApiErrorBody>) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

  if (error.response?.status !== 401 || !original || original.skipAuthRefresh || original._retried) {
    throw error;
  }

  original._retried = true;
  try {
    await refreshSession();
  } catch {
    setAccessToken(null);
    sessionExpiredListeners.forEach((listener) => listener());
    throw error;
  }
  return api(original);
});

/** A human-readable message for any API or network error. */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return error.code === 'ECONNABORTED'
        ? 'The server took too long to respond. Please try again.'
        : "Can't reach the server. Check your connection and try again.";
    }
    return error.response.data?.error?.message ?? fallback;
  }
  return fallback;
};

/** Field-level validation errors from a 400/409 response, if any. */
export const getFieldErrors = (error: unknown): Record<string, string[]> | undefined =>
  axios.isAxiosError<ApiErrorBody>(error) ? error.response?.data?.error?.details : undefined;
