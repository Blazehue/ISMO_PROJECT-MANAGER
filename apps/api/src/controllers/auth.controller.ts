import type { LoginInput, RefreshInput, RegisterInput } from '@ismo/shared';
import type { CookieOptions, Request, RequestHandler, Response } from 'express';
import { isProduction } from '../config/env';
import { currentUserId } from '../middleware/authenticate';
import * as authService from '../services/auth.service';
import { refreshTokenTtlMs, revokeRefreshToken } from '../services/token.service';
import { unauthorized } from '../utils/AppError';

const REFRESH_COOKIE = 'ismo_rt';

/**
 * Browsers keep the refresh token in an httpOnly cookie, out of reach of page
 * scripts. Mobile has no cookie jar, so it receives the token in the body and
 * stores it in the OS keystore (expo-secure-store).
 */
const isMobileClient = (req: Request) => req.get('x-client') === 'mobile';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  path: '/api/auth',
};

type Session = Awaited<ReturnType<typeof authService.login>>;

const sendSession = (req: Request, res: Response, status: number, session: Session) => {
  if (isMobileClient(req)) {
    res.status(status).json(session);
    return;
  }
  const { refreshToken, ...body } = session;
  res.cookie(REFRESH_COOKIE, refreshToken, { ...refreshCookieOptions, maxAge: refreshTokenTtlMs });
  res.status(status).json(body);
};

const readRefreshToken = (req: Request): string | undefined =>
  req.cookies?.[REFRESH_COOKIE] ?? (req.validated.body as RefreshInput | undefined)?.refreshToken;

export const register: RequestHandler = async (req, res) => {
  const session = await authService.register(req.validated.body as RegisterInput);
  sendSession(req, res, 201, session);
};

export const login: RequestHandler = async (req, res) => {
  const session = await authService.login(req.validated.body as LoginInput);
  sendSession(req, res, 200, session);
};

export const refresh: RequestHandler = async (req, res) => {
  const token = readRefreshToken(req);
  if (!token) throw unauthorized('Your session has expired. Please log in again.', 'SESSION_EXPIRED');

  try {
    sendSession(req, res, 200, await authService.refresh(token));
  } catch (err) {
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
    throw err;
  }
};

export const logout: RequestHandler = async (req, res) => {
  const token = readRefreshToken(req);
  if (token) await revokeRefreshToken(token);
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
  res.status(204).end();
};

export const me: RequestHandler = async (req, res) => {
  res.json({ user: await authService.getCurrentUser(currentUserId(req)) });
};
