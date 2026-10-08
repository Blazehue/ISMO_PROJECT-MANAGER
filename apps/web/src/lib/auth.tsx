import type { AuthResponse, LoginInput, PublicUser, RegisterInput } from '@ismo/shared';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, onSessionExpired, refreshSession, setAccessToken } from './api';
import { toast } from 'sonner';
import { cinema } from './cinema';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: PublicUser | null;
  /** Set when the session ended on its own (expired / revoked), not by logout. */
  sessionExpired: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// A non-sensitive "this browser has a session" hint. The refresh token itself
// stays in the httpOnly cookie; this flag only lets logged-out visitors skip a
// refresh call that would certainly fail with a 401.
const SESSION_HINT = 'ismo-has-session';
const sessionHint = {
  get: () => {
    try {
      return localStorage.getItem(SESSION_HINT) === '1';
    } catch {
      return true; // storage unavailable: just try the refresh
    }
  },
  set: (value: boolean) => {
    try {
      if (value) localStorage.setItem(SESSION_HINT, '1');
      else localStorage.removeItem(SESSION_HINT);
    } catch {
      // ignore
    }
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>(() => (sessionHint.get() ? 'loading' : 'unauthenticated'));
  const [user, setUser] = useState<PublicUser | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const startSession = useCallback((data: AuthResponse) => {
    sessionHint.set(true);
    setAccessToken(data.accessToken);
    setUser(data.user);
    setSessionExpired(false);
    setStatus('authenticated');
  }, []);

  const endSession = useCallback(
    (expired: boolean) => {
      sessionHint.set(false);
      setAccessToken(null);
      setUser(null);
      setSessionExpired(expired);
      setStatus('unauthenticated');
      queryClient.clear();
    },
    [queryClient],
  );

  // Restore the session from the httpOnly refresh cookie on page load, then load
  // the current profile from GET /auth/me.
  useEffect(() => {
    if (!sessionHint.get()) return;
    refreshSession()
      .then(async (session) => {
        const { data } = await api.get<{ user: PublicUser }>('/auth/me');
        startSession({ ...session, user: data.user });
      })
      .catch(() => {
        sessionHint.set(false);
        setStatus('unauthenticated');
      });
  }, [startSession]);

  useEffect(() => onSessionExpired(() => endSession(true)), [endSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      sessionExpired,
      login: async (input) => {
        const { data } = await api.post<AuthResponse>('/auth/login', input, { skipAuthRefresh: true });
        startSession(data);
      },
      register: async (input) => {
        const { data } = await api.post<AuthResponse>('/auth/register', input, { skipAuthRefresh: true });
        startSession(data);
      },
      logout: async () => {
        toast.dismiss();
        await cinema.playOutro();
        try {
          await api.post('/auth/logout', {}, { skipAuthRefresh: true });
        } finally {
          endSession(false);
        }
      },
    }),
    [status, user, sessionExpired, startSession, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
