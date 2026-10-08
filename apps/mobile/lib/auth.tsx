import type { AuthResponse, LoginInput, PublicUser, RegisterInput } from '@ismo/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, onSessionExpired, refreshSession, SessionExpiredError, setAccessToken } from './api';
import { cinema } from './cinema';
import { persister } from './queryClient';
import { tokenStorage } from './secureStorage';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// Name and email only, so the app can greet you while offline. No secrets here.
const USER_KEY = 'ismo.user';

interface AuthContextValue {
  status: AuthStatus;
  user: PublicUser | null;
  /** Set when the session ended on its own (expired or revoked). */
  sessionExpired: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<PublicUser | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const startSession = useCallback(async (data: AuthResponse) => {
    if (data.refreshToken) await tokenStorage.set(data.refreshToken);
    setAccessToken(data.accessToken);
    setUser(data.user);
    setSessionExpired(false);
    setStatus('authenticated');
    AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user)).catch(() => {});
  }, []);

  const endSession = useCallback(
    async (expired: boolean) => {
      setAccessToken(null);
      await tokenStorage.clear();
      await AsyncStorage.removeItem(USER_KEY).catch(() => {});
      queryClient.clear();
      await persister.removeClient();
      setUser(null);
      setSessionExpired(expired);
      setStatus('unauthenticated');
    },
    [queryClient],
  );

  // Restore the session from the secure store on launch.
  useEffect(() => {
    (async () => {
      try {
        // Renew the session from the secure store, then load the profile from GET /auth/me.
        const session = await refreshSession();
        const { data } = await api.get<{ user: PublicUser }>('/auth/me');
        await startSession({ ...session, user: data.user });
      } catch (error) {
        if (error instanceof SessionExpiredError) {
          const hadSession = Boolean(await AsyncStorage.getItem(USER_KEY));
          await endSession(hadSession);
          return;
        }
        // Offline (or server unreachable) with a stored session: stay signed in and
        // show cached data. Requests will refresh the session once we're back online.
        const cached = await AsyncStorage.getItem(USER_KEY).catch(() => null);
        if (cached) {
          setUser(JSON.parse(cached) as PublicUser);
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
        }
      }
    })();
  }, [startSession, endSession]);

  useEffect(() => onSessionExpired(() => void endSession(true)), [endSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      sessionExpired,
      login: async (input) => {
        const { data } = await api.post<AuthResponse>('/auth/login', input, { skipAuthRefresh: true });
        await startSession(data);
      },
      register: async (input) => {
        const { data } = await api.post<AuthResponse>('/auth/register', input, { skipAuthRefresh: true });
        await startSession(data);
      },
      logout: async () => {
        await cinema.playOutro();
        const refreshToken = await tokenStorage.get();
        // Revoke on the server, but never block logging out on the network.
        api
          .post('/auth/logout', { refreshToken: refreshToken ?? undefined }, { skipAuthRefresh: true, timeout: 5000 })
          .catch(() => {});
        await endSession(false);
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
