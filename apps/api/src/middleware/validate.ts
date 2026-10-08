import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Parses the request against Zod schemas and stores the trusted result on
 * `req.validated`. Unknown fields are stripped, so clients can't smuggle in
 * values like `userId`. A ZodError becomes a 400 in the error handler.
 */
export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, _res, next) => {
    req.validated = {
      body: schemas.body?.parse(req.body ?? {}),
      query: schemas.query?.parse(req.query),
      params: schemas.params?.parse(req.params),
    };
    next();
  };
