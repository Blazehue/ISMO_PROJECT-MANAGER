import type { ApiErrorBody, AuthResponse } from '@ismo/shared';
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './secureStorage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000/api';

/** The same API the web app uses. `X-Client: mobile` asks for the refresh token in the body. */
export const api = axios.create({
  baseURL: API_URL,
  // Free-tier hosting can take a while to wake up.
  timeout: 30_000,
  headers: { 'X-Client': 'mobile' },
});

// Short-lived access token: memory only.
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

type Listener = () => void;
const expiredListeners = new Set<Listener>();
export const onSessionExpired = (listener: Listener) => {
  expiredListeners.add(listener);
  return () => {
    expiredListeners.delete(listener);
  };
};

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
  }
}

/** Thrown when the session can't be renewed (as opposed to a network failure). */
export class SessionExpiredError extends Error {}

// One refresh at a time: refresh tokens rotate, so a second parallel refresh
// would replay a used token and trip reuse detection.
let refreshInFlight: Promise<AuthResponse> | null = null;

export const refreshSession = () => {
  refreshInFlight ??= (async () => {
    const refreshToken = await tokenStorage.get();
    if (!refreshToken) throw new SessionExpiredError('No stored session');
    try {
      const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken }, { skipAuthRefresh: true });
      if (data.refreshToken) await tokenStorage.set(data.refreshToken);
      setAccessToken(data.accessToken);
      return data;
    } catch (error) {
      // Only a 401 means the session is over; offline / timeouts keep it for later.
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await tokenStorage.clear();
        throw new SessionExpiredError('Session expired');
      }
      throw error;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

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
  } catch (refreshError) {
    if (refreshError instanceof SessionExpiredError) {
      setAccessToken(null);
      expiredListeners.forEach((listener) => listener());
    }
    throw error;
  }
  return api(original);
});

export const isNetworkError = (error: unknown) => axios.isAxiosError(error) && !error.response;

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return error.code === 'ECONNABORTED'
        ? 'The server took too long to respond. Please try again.'
        : "Can't reach the server. Check your internet connection.";
    }
    return error.response.data?.error?.message ?? fallback;
  }
  return fallback;
};

export const getFieldErrors = (error: unknown): Record<string, string[]> | undefined =>
  axios.isAxiosError<ApiErrorBody>(error) ? error.response?.data?.error?.details : undefined;
