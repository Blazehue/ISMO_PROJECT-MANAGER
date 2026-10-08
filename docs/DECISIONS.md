# Design decisions

The reasoning behind the main choices, and the trade-offs I accepted.

## Architecture

```
React web (Vercel) ─┐
                    ├──► Express API (Render) ──► PostgreSQL (Neon)
Expo Android app  ──┘
```

- **One API for both clients.** The web and Android apps call the same endpoints with the same validation.
  There's no mobile-specific backend, so data can't drift between platforms.
- **React + Vite rather than Next.js.** The backend is a separate Express API that the mobile app also
  needs. Next.js's server features would either go unused or duplicate that API. A static SPA is simpler
  to deploy and to reason about.
- **pnpm monorepo with `packages/shared`.** The Zod schemas, enums, API types and design tokens are
  written once and used by the API, the web app and the mobile app. A validation rule changed in one
  place applies to the API's checks and to both apps' forms. The shared package ships TypeScript source;
  each consumer's bundler (tsup, Vite, Metro) compiles it, so there's no extra build step.

## Security

**Authorization (IDOR prevention) is enforced inside the queries.**

- Every project lookup filters on `{ id, userId }`, and every task lookup on `{ id, project: { userId } }`.
  There's no "fetch, then compare owner" step that could be forgotten.
- This lives in two helpers, `getOwnedProjectOrThrow` and `getOwnedTaskOrThrow`, which every
  read/update/delete goes through.
- Creating a task, or moving one to another project, also checks that the _destination_ project is
  yours.
- Someone else's resource returns **404, not 403**, so ids can't be probed for existence.
- `userId` is never read from the request; it always comes from the verified token. Zod strips unknown
  fields, so a smuggled `userId` in a body is dropped (covered by a test).

**Tokens.**

- **Access token:** a 15-minute JWT, kept in memory only.
- **Refresh token:** an opaque random value stored only as a SHA-256 hash. It rotates on every use.
  Reusing an old one is treated as theft and revokes every session for that user.
- **Web:** the refresh token sits in an `httpOnly; Secure; SameSite=Strict` cookie, scoped to
  `/api/auth`. Page scripts can't read it, and cross-site requests can't send it.
- **Android:** there's no cookie jar, so the token is returned in the body and kept in
  `expo-secure-store` (Android Keystore). AsyncStorage is never used for it.
- **Same-origin API for the web.** Vercel rewrites `/api/*` to the Render API, so the cookie is
  first-party. That keeps it working in Safari, which blocks third-party cookies, and lets the cookie be
  `SameSite=Strict`.
- **CORS** is still an explicit allowlist (`CORS_ORIGINS`), never `*`.
- **Passwords** are hashed with bcrypt at cost 12. Login compares against a dummy hash when the email
  doesn't exist, so response timing doesn't reveal which emails are registered. The error message is
  the same for a wrong email and a wrong password.

**Input validation.** Every body, query string and path parameter is parsed with Zod before reaching a
controller. That covers required fields, trimmed non-empty strings, email format, real calendar dates,
`endDate >= startDate`, enum values and UUIDs. Partial updates re-check the date range against the
stored values.

**SQL injection.** All queries go through Prisma's query builder, which uses parameterized queries.
There is no raw SQL with user input.

**Rate limiting.**

- Login counts only _failed_ attempts (10 per 15 minutes per IP), so legitimate users aren't blocked.
- Register is 10 per hour.
- `trust proxy` is set because Render (and Vercel's rewrite) sit in front of the API. Without it,
  every client would share the proxy's IP.
- Trade-off: the limiter's memory store is per instance. With several instances it would need Redis.

**Other hardening.**

- `helmet` security headers and a 100 kB body limit.
- One central error handler: clients get a consistent `{ error }` shape, and stack traces are never
  returned.
- pino logs every request, with `authorization`, `cookie`, password and token fields redacted.

## Data model

- `users 1─N projects 1─N tasks`, plus `refresh_tokens`.
- Tasks carry no `user_id`; ownership is resolved through the project. The schema stays normalized, and
  there is one source of truth for ownership.
- Foreign keys cascade on delete. Status and priority are Postgres enums. Project and task dates are
  `date` columns, so they can't shift with time zones.
- Indexes match the query patterns. See [ERD.md](./ERD.md).

## API design

- RESTful resources with the required endpoints, plus `/auth/refresh` and `/health`.
- Lists are paginated (`page`, `limit` ≤ 100) and return `{ data, pagination }`.
- Search, filters and sorting go in query params. Sorting uses an allowlist of fields, with a stable
  secondary sort on `id` so pages don't overlap.
- Updates are partial (`PUT` with any subset of fields), so "mark complete" is
  `PUT /tasks/:id {"status":"COMPLETED"}`.
- The dashboard counts run in parallel and are scoped to the user. Per-project progress comes from a
  single `groupBy`, not one query per project.

## Web app

- TanStack Query handles caching, loading and error states. After any mutation, projects, tasks and
  dashboard data are invalidated together.
- The axios interceptor refreshes once on a 401 and retries. Refreshes are single-flight: parallel
  requests (and React StrictMode's double mount) share one refresh, because a second refresh would replay
  a rotated token and trip reuse detection. If refreshing fails, the app goes to
  `/login?reason=expired` with a clear message.
- Filters, sort and page live in the URL, so they survive reloads and can be shared.
- Each route is code-split, so the landing page doesn't download the app.
- The design (Flowgenix-inspired) uses tokens from `packages/shared/src/design.ts`. Light, dark and
  system themes apply before first paint, so there's no flash. Motion respects `prefers-reduced-motion`.

## Android app

- Expo Router screens: auth, three tabs (Home / Projects / Me), project detail, and a task form sheet.
- **Pull-to-refresh** on every list. TanStack Query refetches when the app returns to the foreground or
  the network comes back (NetInfo is wired into its `onlineManager`).
- **Expired login.** A failed refresh clears the secure store, and the route guard
  (`Stack.Protected`) sends the user to login with "Your session has expired".
- **No network.** An offline banner appears on every screen. Network errors say "You're offline" with a
  retry button instead of a blank screen. Startup with a stored session but no connection stays signed in.
- **Offline viewing (bonus).** The query cache is persisted to AsyncStorage, so the last-seen projects
  and tasks are readable offline. It's cleared on logout.

## Testing

**Unit tests** (`apps/api/tests/unit`) cover the shared Zod schemas, the token verification
(expired, forged and `alg: none` tokens are rejected) and the pagination helpers.

**Integration tests** (Vitest + Supertest) run against a real PostgreSQL database:

- auth: hashing, no hash in responses, cookie vs body token, duplicate email, rotation, reuse detection,
  logout revocation
- authorization: cross-user read, update, delete, create and move all get 404; lists and dashboard are
  scoped to the user; a smuggled `userId` is ignored
- validation: enums, empty strings, bad dates, date ranges
- the login rate limit
- dashboard counts, overdue filtering, search, filter, sort and pagination, cascade delete

## Trade-offs and what I'd do next

- **Rate-limit store is per instance.** Move it to Redis to scale horizontally.
- **Expired tokens linger.** Add a scheduled cleanup of expired or revoked refresh tokens.
- **No roles or audit log.** Skipped as out of scope for the 2-day window. The ownership helpers are the
  natural place to add team/role checks.
- **Push notifications** for tasks due tomorrow would need an Expo push-token table and a daily job.

## Why this fits ISMO

The domain is deliberately generic: projects, tasks, statuses and deadlines. The same structure could
track experiment runs, device builds, sample batches or customer orders around organ-on-chip work.
Adding domain entities (for example linking tasks to a device or a sample) would extend the schema
without changing the security model, because ownership would still flow through the project.
