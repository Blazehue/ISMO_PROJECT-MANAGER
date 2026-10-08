import type { LoginInput, PublicUser, RegisterInput } from '@ismo/shared';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AppError, unauthorized } from '../utils/AppError';
import { createRefreshToken, rotateRefreshToken, signAccessToken } from './token.service';

const BCRYPT_ROUNDS = 12;

// Compared against when the email doesn't exist, so response time doesn't reveal
// which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-password', BCRYPT_ROUNDS);

/** The only user fields that ever leave the API. */
export const publicUserSelect = { id: true, name: true, email: true, createdAt: true } as const;

type PublicUserRow = { id: string; name: string; email: string; createdAt: Date };
// Fields are picked explicitly (never spread) so a full row with passwordHash
// can't leak through by accident.
const toPublicUser = (user: PublicUserRow): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
});

const issueSession = async (user: PublicUserRow) => ({
  user: toPublicUser(user),
  accessToken: signAccessToken(user.id),
  refreshToken: await createRefreshToken(user.id),
});

export const register = async ({ name, email, password }: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists', {
      email: ['An account with this email already exists'],
    });
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) },
    select: publicUserSelect,
  });
  return issueSession(user);
};

export const login = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordMatches) {
    throw unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }
  return issueSession(user);
};

export const refresh = async (token: string) => {
  const { userId, refreshToken } = await rotateRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw unauthorized('Your session has expired. Please log in again.', 'SESSION_EXPIRED');

  return { user: toPublicUser(user), accessToken: signAccessToken(user.id), refreshToken };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw unauthorized('Account no longer exists', 'INVALID_TOKEN');
  return toPublicUser(user);
};
