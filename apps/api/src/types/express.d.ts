declare global {
  namespace Express {
    interface Request {
      /** Set by the `authenticate` middleware from the verified access token. */
      user?: { id: string };
      /** Set by the `validate` middleware: parsed, trusted request data. */
      validated: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
