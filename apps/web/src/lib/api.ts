import type { ApiErrorBody, AuthResponse } from '@ismo/shared';
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

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

// The API sleeps on Render's free tier when idle. While it wakes (up to about a
// minute), the Vercel proxy answers 502/503/504 before the request reaches the
// app, so reads and auth calls are safe to retry. Other writes are not retried,
// so a create can never be applied twice.
const WAKE_DELAYS_MS = [2000, 3000, 5000, 5000, 8000, 8000, 10000, 10000, 10000];
const WAKE_TOAST_ID = 'server-waking';
const isGatewayError = (error: AxiosError) => !!error.response && [502, 503, 504].includes(error.response.status);
const isRetryableCall = (config: InternalAxiosRequestConfig) =>
  ['get', 'head'].includes(config.method ?? 'get') || /^\/?auth\/(login|register|refresh|me)$/.test(config.url ?? '');

api.interceptors.response.use(
  (response) => {
    toast.dismiss(WAKE_TOAST_ID);
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _wakeAttempt?: number }) | undefined;
    if (!config || !isGatewayError(error) || !isRetryableCall(config)) throw error;

    const attempt = config._wakeAttempt ?? 0;
    if (attempt >= WAKE_DELAYS_MS.length) {
      toast.dismiss(WAKE_TOAST_ID);
      throw error;
    }
    toast.loading('Waking up the server…', {
      id: WAKE_TOAST_ID,
      description: 'The free hosting tier sleeps when idle. This can take up to a minute.',
    });
    config._wakeAttempt = attempt + 1;
    await new Promise((resolve) => setTimeout(resolve, WAKE_DELAYS_MS[attempt]));
    return api(config);
  },
);

/** Starts waking the API in the background so it's ready by the time someone logs in. */
export const warmUpApi = () => {
  void fetch(`${api.defaults.baseURL}/health`, { cache: 'no-store' }).catch(() => {});
};

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
