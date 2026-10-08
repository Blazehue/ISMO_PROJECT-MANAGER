import type { RequestHandler } from 'express';
import { unauthorized } from '../utils/AppError';
import { verifyAccessToken } from '../services/token.service';

/** Requires a valid `Authorization: Bearer <access token>` header. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw unauthorized();
  }
  req.user = { id: verifyAccessToken(header.slice('Bearer '.length).trim()) };
  next();
};

/** The authenticated user's id. Identity always comes from the token, never the request. */
export const currentUserId = (req: Express.Request): string => {
  if (!req.user) throw unauthorized();
  return req.user.id;
};
