# ISMO Workspace: Project Management System (Web + Android)

A project and task manager with a **React web app** and an **Android app (Expo / React Native)** that share
**one Express API and one PostgreSQL database**. Register on either app and log in on the other. A task
created on your phone shows up on the web after a refresh, and the other way round.

|                  |                                                                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Web app**      | https://ismo-project-manager.vercel.app                                                                                                                                                                                                    |
| **API**          | https://ismo-api-j4b7.onrender.com/api/health                                                                                                                                                                                              |
| **Android APK**  | [Download the APK](https://expo.dev/artifacts/eas/9DBgyktQg4BN2_74ImOvuXTimA1-tmnPexSBH36YpRM.apk) · [EAS build page (QR install)](https://expo.dev/accounts/blazehue/projects/ismo-workspace/builds/e9572902-14f0-4dc7-a05d-cd50e75457f6) |
| **Demo video**   | https://youtu.be/N-6jSb6B58w                                                                                                                                                                                                                 |
| **Demo account** | `demo@ismo.test` / `Demo@1234` (test data only)                                                                                                                                                                                            |

> The API runs on Render's free tier, which sleeps when idle. The first request after a pause can take
> ~30–50 s; both apps show a loading state and allow 30 s before timing out.

<p align="center">
  <img src="docs/screenshots/web-dashboard-light.png" alt="Web dashboard, light theme" width="70%" />
  &nbsp;
  <img src="docs/screenshots/mobile-project.png" alt="Android app, project tasks" width="22%" />
</p>

---

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Run it locally](#run-it-locally)
- [Environment variables](#environment-variables)
- [Run the mobile app against the deployed backend](#run-the-mobile-app-against-the-deployed-backend)
- [Tests and checks](#tests-and-checks)
- [Deployment](#deployment)
- [Security](#security)
- [Documentation](#documentation)

---

## Features

**Both apps**

- Register, log in and log out with one shared account. Emails are unique and passwords are hashed with bcrypt.
- Sessions survive restarts (refresh tokens) and end cleanly when they expire.

**Web app (React + Vite)**

- **Dashboard:** total projects, projects in progress, total, completed, pending and overdue tasks; recent
  projects with progress; task breakdown.
- **Projects:** create, view, edit, delete. Name, description, status, start/end date and created date.
- **Tasks:** create, edit, delete, mark complete. Name, description, priority, status, due date and created
  date. Status and priority can be changed in place from the list.
- **Search and filters:** search projects and tasks by name, filter projects by status and tasks by status,
  priority or overdue. Sorting and pagination everywhere. A cross-project Tasks page.
- **Command palette** (Cmd/Ctrl+K or `/`): search projects and tasks, jump anywhere, run actions.
- **Kanban board** per project: drag a task between Pending / In Progress / Completed to change its status.
- **New task from anywhere** (`T`) with a project picker; dashboard **Upcoming deadlines** and a **7-day workload** chart.
- Landing page (stacking feature cards, interactive widgets, an Android section with the real app screens), account page, light/dark/system theme, responsive layout, loading skeletons, inline form
  validation, toasts, keyboard shortcuts (`Cmd/Ctrl+K` or `/` palette, `N` new project, `T` new task).

**Android app (Expo)**

- A welcome screen, then login, register and logout with the same account.
- Dashboard, all projects (search and status filter) and the tasks under each project.
- Create, edit and delete tasks; mark complete; change status and priority.
- Create, edit and delete projects too, so both apps use every API endpoint.
- Search tasks and filter them by status and priority.
- **Pull-to-refresh** on every list.
- Refresh token kept in **secure device storage** (`expo-secure-store` → Android Keystore).
- **Expired login** → back to the login screen with "Your session has expired".
- **No network** → offline banner and clear "You're offline" states instead of a crash or blank screen.

**Bonus features implemented:**

- Docker support
- Unit tests (shared validation, tokens, pagination)
- Integration tests
- CI pipeline
- Pagination
- Sorting
- Refresh tokens (rotation + reuse detection)
- Offline viewing of tasks on mobile (persisted query cache)
- Validation and types shared between web, mobile and backend

<details>
<summary>More screenshots</summary>

| Web (dark)                                                      | Landing page                                               | Android                                                                                                                         |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| <img src="docs/screenshots/web-project-dark.png" width="360" /> | <img src="docs/screenshots/web-landing.png" width="360" /> | <img src="docs/screenshots/mobile-dashboard.png" width="180" /> <img src="docs/screenshots/mobile-task-form.png" width="180" /> |

</details>

---

## Architecture

```
┌────────────────────┐        ┌───────────────────────────┐        ┌──────────────┐
│ Web app            │  /api  │ Express API (TypeScript)  │ Prisma │ PostgreSQL   │
│ React + Vite       ├───────►│ auth · projects · tasks   ├───────►│ (Neon)       │
│ (Vercel)           │        │ dashboard · validation    │        └──────────────┘
└────────────────────┘        │ rate limits · logging     │
┌────────────────────┐ HTTPS  │ (Render, Docker)          │
│ Android app        ├───────►│                           │
│ Expo / RN          │        └───────────────────────────┘
└────────────────────┘
        ▲                ┌──────────────────────────────────────┐
        └────────────────┤ packages/shared: Zod schemas, enums, │
                         │ API types, design tokens             │
                         └──────────────────────────────────────┘
```

| Layer    | Stack                                                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| API      | Node 20+, Express 5, TypeScript, Prisma 7 (`@prisma/adapter-pg`), Zod 4, JWT, bcrypt, helmet, cors, express-rate-limit, pino                          |
| Database | PostgreSQL                                                                                                                                            |
| Web      | React 19, Vite, React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS 4, shadcn/ui (Radix), Motion                                        |
| Mobile   | Expo SDK 57, Expo Router, React Native 0.86, TanStack Query (+ AsyncStorage persister), React Hook Form + Zod, expo-secure-store, NetInfo, Reanimated |
| Shared   | `@ismo/shared`: Zod schemas, enums, API types, design tokens                                                                                          |
| Tooling  | pnpm workspaces, Vitest + Supertest, Prettier, Docker, GitHub Actions                                                                                 |

Why these choices: [docs/DECISIONS.md](docs/DECISIONS.md).

---

## Repository layout

```
.
├── apps/
│   ├── api/       Express API: src/{config,routes,controllers,services,middleware,lib,utils},
│   │              prisma/ (schema, migrations, seed), tests/, Dockerfile
│   ├── web/       React app: src/{pages,components,hooks,lib,routes}, vercel.json
│   └── mobile/    Expo app: app/ (screens, Expo Router), components/, hooks/, lib/, eas.json
├── packages/
│   └── shared/    Zod schemas, enums, API types, design tokens
├── docs/          API.md, ERD.md + ERD.png, DECISIONS.md, screenshots/
├── .github/workflows/ci.yml
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## Run it locally

### Prerequisites

- **Node.js 20+** (developed on Node 24)
- **pnpm** through Corepack: `corepack enable`
- A PostgreSQL database. Pick one of the three options in step 2; none needs a manual install.
- For the Android app: the **Expo Go** app on an Android phone, or an Android emulator.

### 1. Install

```bash
corepack enable
pnpm install
```

### 2. Start a database (pick one)

```bash
# A) Zero-install local PostgreSQL on port 5433 (also creates the `ismo_test` database for tests)
pnpm db:local                # keep this terminal open

# B) Docker
docker compose up -d db      # PostgreSQL on port 5432

# C) A hosted database, e.g. a free Neon project; use its connection string below
```

### 3. API (http://localhost:4000)

```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env:
#   DATABASE_URL       (option A: postgresql://postgres:postgres@localhost:5433/ismo,
#                       option B: postgresql://postgres:postgres@localhost:5432/ismo)
#   JWT_ACCESS_SECRET  (any 32+ char random string:
#                       node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")

pnpm --filter @ismo/api db:deploy     # apply migrations
pnpm --filter @ismo/api db:seed       # demo account + sample data (demo@ismo.test / Demo@1234)
pnpm dev:api
```

### 4. Web app (http://localhost:5173)

```bash
pnpm dev:web
```

The Vite dev server proxies `/api` to `http://localhost:4000`, so no web configuration is needed.

### 5. Android app

```bash
cp apps/mobile/.env.example apps/mobile/.env
# Set EXPO_PUBLIC_API_URL to an address your phone/emulator can reach:
#   Android emulator:  http://10.0.2.2:4000/api
#   Physical phone:    http://<your computer's LAN IP>:4000/api   (same Wi-Fi)
pnpm dev:mobile
```

Then scan the QR code with **Expo Go** (Android), or press `a` to open the emulator.

### Docker (API + database)

```bash
docker compose up --build        # API on http://localhost:4000, migrations run on start
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ismo pnpm --filter @ismo/api db:seed
```

---

## Environment variables

### API (`apps/api/.env`)

| Variable                   | Required   | Example / default                     | Purpose                                                                                          |
| -------------------------- | ---------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`             | Yes        | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string. On Neon, use the **direct** (non-pooled) string so migrations work |
| `JWT_ACCESS_SECRET`        | Yes        | 32+ random characters                 | Signs access tokens                                                                              |
| `CORS_ORIGINS`             | Yes (prod) | `https://<app>.vercel.app`            | Comma-separated browser origins allowed to call the API                                          |
| `NODE_ENV`                 |            | `development`                         | `production` enables `Secure` cookies and hides error details                                    |
| `PORT`                     |            | `4000`                                | HTTP port (Render sets this automatically)                                                       |
| `ACCESS_TOKEN_TTL_MINUTES` |            | `15`                                  | Access-token lifetime                                                                            |
| `REFRESH_TOKEN_TTL_DAYS`   |            | `30`                                  | Refresh-token lifetime                                                                           |
| `TRUST_PROXY`              |            | `1`                                   | Number of proxies in front of the API (Render = 1), so rate limits see the real client IP        |
| `LOG_LEVEL`                |            | `info`                                | pino log level                                                                                   |

### Web (`apps/web/.env`, optional)

| Variable             | Default                 | Purpose                                                                                                                    |
| -------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`       | `/api`                  | API base URL. Keep `/api`: Vite (dev) and `vercel.json` (prod) forward it to the API, so the refresh cookie is first-party |
| `VITE_DEV_API_PROXY` | `http://localhost:4000` | Dev only: where Vite proxies `/api`                                                                                        |
| `VITE_APK_URL`       | —                       | Optional: link to the Android APK. Adds a "Download for Android" button to the landing page's Android section              |

### Mobile (`apps/mobile/.env`, or `eas.json` for builds)

| Variable              | Example                               | Purpose                                        |
| --------------------- | ------------------------------------- | ---------------------------------------------- |
| `EXPO_PUBLIC_API_URL` | `https://<your-api>.onrender.com/api` | API base URL, baked into the app at build time |

---

## Run the mobile app against the deployed backend

**Option 1: install the APK.** Download it from the link at the top and open it on an Android phone. Allow
installing from your browser if Android asks. It already points to the deployed API.

**Option 2: run from source with Expo Go.**

```bash
echo "EXPO_PUBLIC_API_URL=https://<your-api>.onrender.com/api" > apps/mobile/.env
pnpm dev:mobile        # scan the QR code with Expo Go
```

**Option 3: build your own APK** (needs a free Expo account):

```bash
npm install -g eas-cli
cd apps/mobile
eas login
eas init                         # links the project to your Expo account (adds the projectId)
# set EXPO_PUBLIC_API_URL for the "preview" profile in eas.json
eas build --platform android --profile preview   # outputs a downloadable .apk
```

Log in with the same account as on the web (or the demo account). Create a task on the phone, refresh the
web app, and it's there.

---

## Tests and checks

```bash
pnpm db:local        # in another terminal: provides the ismo_test database on port 5433
pnpm test            # 23 unit tests + 20 API integration tests (Vitest + Supertest) against a real PostgreSQL
pnpm typecheck       # shared, API, web and mobile
pnpm format:check    # Prettier
```

The tests use `TEST_DATABASE_URL` (default `postgresql://postgres:postgres@localhost:5433/ismo_test`). They cover:

- authentication: hashing, no secrets in responses, token rotation and reuse detection, logout
- **authorization:** another user's projects and tasks return 404 for read, update, delete, create-in and
  move-into
- validation, the login rate limit, dashboard counts, search, filters, sorting, pagination and cascade
  deletes

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs the format check, typechecks, tests and
the web build on every push.

---

## Deployment

| Part     | Host                      | Notes                                                                                                                                                                                                                                                                                                                                                              |
| -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Database | **Neon** (free)           | Create a project, copy the **direct** connection string                                                                                                                                                                                                                                                                                                            |
| API      | **Render** (free, Docker) | New Web Service from this repo → Runtime **Docker**, Dockerfile path `apps/api/Dockerfile`, Docker context `.` (repo root). Health check path `/api/health`. Env vars: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `NODE_ENV=production`, `CORS_ORIGINS=https://<app>.vercel.app`, `TRUST_PROXY=1`. Migrations run automatically on start                                 |
| Web      | **Vercel**                | Import the repo → Root Directory `apps/web` (framework Vite). Add the env var `ENABLE_EXPERIMENTAL_COREPACK=1` so Vercel uses the pinned pnpm. Optionally set `VITE_APK_URL` to your EAS build link for the landing page's download button. In `apps/web/vercel.json`, replace `REPLACE_WITH_RENDER_URL` with your Render host so `/api/*` is forwarded to the API |
| Android  | **EAS Build**             | Set `EXPO_PUBLIC_API_URL` in `apps/mobile/eas.json` (preview profile; Corepack is already enabled there), then `eas build -p android --profile preview`                                                                                                                                                                                                            |

Seed the demo data into the hosted database once:

```bash
DATABASE_URL="<neon connection string>" pnpm --filter @ismo/api db:seed
```

---

## Security

- **Authorization on every query.** Projects are always fetched by `{ id, userId }` and tasks by
  `{ id, project.userId }`. Another user's data returns `404`, and the owner always comes from the token,
  never from the request.
- **Passwords** are hashed with bcrypt (cost 12) and never returned. Login uses timing-safe comparison
  and a generic error message.
- **JWT access tokens** last 15 minutes. **Refresh tokens** rotate on every use, are stored hashed, can be
  revoked, and reuse is detected. They live in an `httpOnly` `SameSite=Strict` cookie on the web and in the
  Android Keystore on mobile.
- **Every request is validated** with Zod: body, query and params. Unknown fields such as `userId` are
  stripped.
- **No SQL injection surface:** queries go only through Prisma's query builder (parameterized).
- **Rate limiting** on login (failed attempts), register and refresh, plus a global limit.
- **CORS** is restricted to the web app's origin. `helmet` sets security headers, and the body size is
  limited.
- **Central error handling** gives a consistent `{ error }` shape with no stack traces. Structured logs
  have credentials redacted.

Details and trade-offs: [docs/DECISIONS.md](docs/DECISIONS.md).

---

## Documentation

- [API reference](docs/API.md): every endpoint, parameter, response and error code.
- [Database schema / ER diagram](docs/ERD.md) ([PNG](docs/ERD.png)).
- [Design decisions](docs/DECISIONS.md): architecture, security model and trade-offs.

All data in this repository and the demo account is test data.
