# API reference

One REST API serves both the web app and the Android app. Base URL:

| Environment           | Base URL                                                      |
| --------------------- | ------------------------------------------------------------- |
| Local                 | `http://localhost:4000/api`                                   |
| Deployed              | `https://<your-api>.onrender.com/api`                         |
| Web app (same origin) | `/api`, which Vite (dev) and Vercel (prod) forward to the API |

All request and response bodies are JSON. Dates are ISO-8601 strings; date-only fields
(`startDate`, `endDate`, `dueDate`) accept `YYYY-MM-DD`.

---

## Authentication

Endpoints marked **(auth required)** need an access token:

```
Authorization: Bearer <accessToken>
```

| Token                                         | Lifetime                      | Web app                                      | Android app                                            |
| --------------------------------------------- | ----------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| Access token (JWT, HS256)                     | 15 minutes                    | Memory only                                  | Memory only                                            |
| Refresh token (random 256-bit, stored hashed) | 30 days, rotated on every use | `httpOnly; SameSite=Strict` cookie `ismo_rt` | Response body → `expo-secure-store` (Android Keystore) |

Clients choose the refresh-token transport with a header:

- **No header (browsers):** the refresh token is set as an httpOnly cookie and is **not** in the body.
- **`X-Client: mobile`:** the refresh token is returned in the body, and `refresh`/`logout` accept it in the body.

When an access token expires, the API returns `401` with code `TOKEN_EXPIRED`. Clients then call
`POST /auth/refresh` once and retry. If the refresh also fails (`SESSION_EXPIRED`), the user must log
in again. Reusing an already-rotated refresh token revokes **all** of that user's sessions (theft
detection).

---

## Errors

Every error has the same shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields are invalid",
    "details": { "email": ["Enter a valid email address"] }
  }
}
```

| Status | `code`                            | When                                                                                                                |
| ------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 400    | `VALIDATION_ERROR`                | Missing/invalid fields, bad dates, invalid enum values, empty strings, bad UUIDs. `details` maps fields to messages |
| 400    | `INVALID_JSON`                    | Malformed JSON body                                                                                                 |
| 401    | `UNAUTHORIZED`                    | No `Authorization` header                                                                                           |
| 401    | `INVALID_TOKEN` / `TOKEN_EXPIRED` | Bad or expired access token                                                                                         |
| 401    | `INVALID_CREDENTIALS`             | Wrong email or password (same message for both)                                                                     |
| 401    | `SESSION_EXPIRED`                 | Refresh token missing, expired, revoked or reused                                                                   |
| 404    | `NOT_FOUND`                       | Resource doesn't exist **or belongs to another user** (indistinguishable by design)                                 |
| 409    | `EMAIL_TAKEN`                     | Registering an email that already exists                                                                            |
| 413    | `PAYLOAD_TOO_LARGE`               | Body over 100 kB                                                                                                    |
| 429    | `RATE_LIMITED`                    | Too many requests (see below)                                                                                       |
| 500    | `INTERNAL_ERROR`                  | Unexpected error; details are logged, never returned                                                                |

### Rate limits (per client IP)

| Endpoint                | Limit                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| `POST /auth/login`      | 10 **failed** attempts per 15 minutes (successful logins don't count) |
| `POST /auth/register`   | 10 per hour                                                           |
| `POST /auth/refresh`    | 30 per minute                                                         |
| Everything under `/api` | 300 per minute                                                        |

Responses include the standard `RateLimit` and `RateLimit-Policy` headers.

---

## Auth endpoints

### `POST /auth/register`

```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "Password123" }
```

- `name`: 2–100 characters.
- `email`: valid email, stored lowercase, unique.
- `password`: 8–72 characters, with at least one letter and one number.

**201** (web):

```json
{
  "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com", "createdAt": "2026-10-06T14:54:10.936Z" },
  "accessToken": "eyJhbGciOi..."
}
```

Also sets the `ismo_rt` cookie. With `X-Client: mobile`, the body also has `"refreshToken": "..."` and no cookie is set.
Errors: `400`, `409 EMAIL_TAKEN`, `429`.

### `POST /auth/login`

```json
{ "email": "jane@example.com", "password": "Password123" }
```

**200**: same shape as register. Errors: `400`, `401 INVALID_CREDENTIALS`, `429`.

### `POST /auth/refresh`

Exchanges the refresh token for a new access token **and** a new refresh token. The old one is revoked.

- **Web:** send no body; the cookie is used.
- **Mobile:** send `X-Client: mobile` and `{ "refreshToken": "..." }`.

**200**: same shape as login. Errors: `401 SESSION_EXPIRED`.

### `POST /auth/logout`

Revokes the refresh token (from the cookie, or `{ "refreshToken": "..." }` in the body) and clears the
cookie. Doesn't require an access token, so an expired session can still log out. **204**.

### `GET /auth/me` (auth required)

**200** `{ "user": { "id", "name", "email", "createdAt" } }`

---

## Projects (auth required)

A project object:

```json
{
  "id": "uuid",
  "name": "Organoid Imaging Pipeline",
  "description": "Automate capture and analysis of live-cell imaging runs.",
  "status": "IN_PROGRESS",
  "startDate": "2026-09-06T00:00:00.000Z",
  "endDate": "2026-11-20T00:00:00.000Z",
  "createdAt": "2026-10-06T14:54:10.958Z",
  "updatedAt": "2026-10-06T14:54:10.958Z",
  "taskCount": 5,
  "completedTaskCount": 2,
  "progress": 40
}
```

`progress` is the percentage of the project's tasks that are completed.

### `GET /projects`

Lists only the caller's projects.

| Query param | Values                                                        | Default     |
| ----------- | ------------------------------------------------------------- | ----------- |
| `page`      | ≥ 1                                                           | `1`         |
| `limit`     | 1–100                                                         | `10`        |
| `search`    | case-insensitive match on name                                | —           |
| `status`    | `NOT_STARTED` \| `IN_PROGRESS` \| `COMPLETED`                 | —           |
| `sortBy`    | `createdAt` \| `name` \| `startDate` \| `endDate` \| `status` | `createdAt` |
| `sortOrder` | `asc` \| `desc`                                               | `desc`      |

**200**:

```json
{
  "data": [/* projects */],
  "pagination": { "page": 1, "limit": 10, "total": 4, "totalPages": 1 }
}
```

### `POST /projects`

```json
{
  "name": "Bioreactor Firmware v2",
  "description": "Optional, up to 2000 chars",
  "status": "NOT_STARTED",
  "startDate": "2026-10-13",
  "endDate": "2027-01-04"
}
```

`name` and `startDate` are required; `status` defaults to `NOT_STARTED`; `endDate` is optional and must not
be before `startDate`. Unknown fields such as `userId` are ignored; the owner always comes from the token.
**201** `{ "data": project }`.

### `GET /projects/:id`

**200** `{ "data": project }`, or **404** if the project doesn't exist or isn't yours.

### `PUT /projects/:id`

Partial update: send any subset of the create fields (at least one). The date range is re-checked
against the stored values. **200** `{ "data": project }`; **400**; **404**.

### `DELETE /projects/:id`

Deletes the project **and its tasks**. **204**; **404**.

---

## Tasks (auth required)

A task object:

```json
{
  "id": "uuid",
  "projectId": "uuid",
  "name": "Build upload service",
  "description": null,
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "dueDate": "2026-10-09T00:00:00.000Z",
  "createdAt": "...",
  "updatedAt": "...",
  "project": { "id": "uuid", "name": "Organoid Imaging Pipeline" }
}
```

### `GET /tasks`

Lists the caller's tasks across all projects, or within one project.

| Query param     | Values                                                       | Default     |
| --------------- | ------------------------------------------------------------ | ----------- |
| `page`, `limit` | as for projects                                              | `1`, `10`   |
| `projectId`     | UUID of one of your projects                                 | —           |
| `search`        | case-insensitive match on name                               | —           |
| `status`        | `PENDING` \| `IN_PROGRESS` \| `COMPLETED`                    | —           |
| `priority`      | `LOW` \| `MEDIUM` \| `HIGH`                                  | —           |
| `overdue`       | `true` → unfinished tasks past their due date                | —           |
| `sortBy`        | `createdAt` \| `name` \| `dueDate` \| `priority` \| `status` | `createdAt` |
| `sortOrder`     | `asc` \| `desc`                                              | `desc`      |

**200** `{ "data": [tasks], "pagination": {...} }`.

### `POST /tasks`

```json
{
  "projectId": "uuid",
  "name": "Calibrate the imaging stage",
  "description": "Optional",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-10-25"
}
```

`projectId` and `name` are required; `priority` defaults to `MEDIUM`, `status` to `PENDING`. The project must
be yours, otherwise **404**. **201** `{ "data": task }`.

### `GET /tasks/:id`

**200** `{ "data": task }`, or **404**.

### `PUT /tasks/:id`

Partial update. Mark a task complete with:

```json
{ "status": "COMPLETED" }
```

Moving a task (`projectId`) requires owning the destination project too. **200** `{ "data": task }`; **400**; **404**.

### `DELETE /tasks/:id`

**204**; **404**.

---

## Dashboard (auth required)

### `GET /dashboard`

All numbers are scoped to the authenticated user.

```json
{
  "data": {
    "totalProjects": 4,
    "projectsInProgress": 2,
    "totalTasks": 12,
    "completedTasks": 5,
    "pendingTasks": 5,
    "inProgressTasks": 2,
    "overdueTasks": 0,
    "recentProjects": [/* up to 5 projects, most recently updated first */]
  }
}
```

---

## Health

### `GET /health`

Checks the database connection. Not rate-limited, not logged. **200** `{ "status": "ok", "time": "..." }`.

---

## Try it with curl

```bash
API=http://localhost:4000/api

# Log in as a mobile client (refresh token in the body)
curl -s -X POST $API/auth/login -H 'Content-Type: application/json' -H 'X-Client: mobile' \
  -d '{"email":"demo@ismo.test","password":"Demo@1234"}'

TOKEN=<accessToken from the response>

curl -s "$API/projects?search=bio&sortBy=name&sortOrder=asc" -H "Authorization: Bearer $TOKEN"
curl -s "$API/tasks?status=PENDING&priority=HIGH" -H "Authorization: Bearer $TOKEN"
curl -s $API/dashboard -H "Authorization: Bearer $TOKEN"

# Validation in action → 400 with field details
curl -s -X POST $API/projects -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"  ","status":"HACKED","startDate":"not-a-date"}'
```
