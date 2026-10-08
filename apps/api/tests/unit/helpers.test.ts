import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from '../../src/services/token.service';
import { AppError } from '../../src/utils/AppError';
import { buildPagination, toSkipTake } from '../../src/utils/pagination';

describe('pagination helpers', () => {
  it('converts page/limit to skip/take', () => {
    expect(toSkipTake({ page: 1, limit: 10 })).toEqual({ skip: 0, take: 10 });
    expect(toSkipTake({ page: 3, limit: 20 })).toEqual({ skip: 40, take: 20 });
  });

  it('computes total pages and never reports zero pages', () => {
    expect(buildPagination(2, 10, 25)).toEqual({ page: 2, limit: 10, total: 25, totalPages: 3 });
    expect(buildPagination(1, 10, 0).totalPages).toBe(1);
  });
});

describe('access tokens', () => {
  const secret = process.env.JWT_ACCESS_SECRET!;

  it('round-trips the user id', () => {
    expect(verifyAccessToken(signAccessToken('user-123'))).toBe('user-123');
  });

  const expectAuthError = (token: string, code: string) => {
    try {
      verifyAccessToken(token);
      expect.unreachable('token should have been rejected');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe(code);
    }
  };

  it('rejects expired tokens with TOKEN_EXPIRED', () => {
    const expired = jwt.sign({}, secret, {
      algorithm: 'HS256',
      subject: 'u',
      issuer: 'ismo-api',
      audience: 'ismo-clients',
      expiresIn: -10,
    });
    expectAuthError(expired, 'TOKEN_EXPIRED');
  });

  it('rejects tokens signed with another secret, or with alg "none"', () => {
    const forged = jwt.sign({}, 'some-other-secret-that-is-long-enough!!', {
      subject: 'u',
      issuer: 'ismo-api',
      audience: 'ismo-clients',
    });
    expectAuthError(forged, 'INVALID_TOKEN');

    const unsigned = jwt.sign({ sub: 'u', iss: 'ismo-api', aud: 'ismo-clients' }, '', { algorithm: 'none' });
    expectAuthError(unsigned, 'INVALID_TOKEN');
  });
});
