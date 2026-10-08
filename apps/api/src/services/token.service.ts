import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { unauthorized } from '../utils/AppError';

const JWT_OPTIONS = { algorithm: 'HS256', issuer: 'ismo-api', audience: 'ismo-clients' } as const;
const DAY_MS = 24 * 60 * 60 * 1000;

export const refreshTokenTtlMs = env.REFRESH_TOKEN_TTL_DAYS * DAY_MS;

export const signAccessToken = (userId: string) =>
  jwt.sign({}, env.JWT_ACCESS_SECRET, {
    ...JWT_OPTIONS,
    subject: userId,
    expiresIn: env.ACCESS_TOKEN_TTL_MINUTES * 60,
  });

/** Returns the user id, or throws 401. The algorithm is pinned to block alg-confusion attacks. */
export const verifyAccessToken = (token: string): string => {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: [JWT_OPTIONS.algorithm],
      issuer: JWT_OPTIONS.issuer,
      audience: JWT_OPTIONS.audience,
    });
    if (typeof payload === 'string' || !payload.sub) throw new Error('Malformed token');
    return payload.sub;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw unauthorized('Your session has expired', 'TOKEN_EXPIRED');
    }
    throw unauthorized('Invalid access token', 'INVALID_TOKEN');
  }
};

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Creates an opaque refresh token. Only its SHA-256 hash is stored. */
export const createRefreshToken = async (userId: string) => {
  const token = randomBytes(32).toString('base64url');
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + refreshTokenTtlMs),
    },
  });
  return token;
};

/**
 * Exchanges a refresh token for a new one (rotation) and returns the owner's id.
 * Presenting an already-used token signals theft, so every session for that user
 * is revoked.
 */
export const rotateRefreshToken = async (token: string) => {
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
  const invalid = unauthorized('Your session has expired. Please log in again.', 'SESSION_EXPIRED');

  if (!stored) throw invalid;

  if (stored.revokedAt) {
    await revokeAllForUser(stored.userId);
    throw invalid;
  }
  if (stored.expiresAt.getTime() <= Date.now()) throw invalid;

  // Conditional update so two concurrent refreshes can't both succeed.
  const { count } = await prisma.refreshToken.updateMany({
    where: { id: stored.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (count !== 1) throw invalid;

  return { userId: stored.userId, refreshToken: await createRefreshToken(stored.userId) };
};

export const revokeRefreshToken = async (token: string) => {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

const revokeAllForUser = async (userId: string) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
