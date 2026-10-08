# Build from the repository root (the API depends on packages/shared):
#   docker build -f apps/api/Dockerfile -t ismo-api .

FROM node:24-slim AS base
# OpenSSL is required by the Prisma schema engine used for migrations.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/* && corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

# ---- build: all deps, generate Prisma client, bundle with tsup ----
FROM base AS build
RUN pnpm install --frozen-lockfile --filter @ismo/api...
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @ismo/api build

# ---- runtime: production deps + bundle + migrations ----
FROM base AS runtime
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod --filter @ismo/api...
COPY --from=build /app/apps/api/dist apps/api/dist
COPY apps/api/prisma apps/api/prisma
COPY apps/api/prisma.config.ts apps/api/
WORKDIR /app/apps/api
USER node
EXPOSE 4000
# Apply pending migrations, then start the API.
CMD ["sh", "-c", "npx --no-install prisma migrate deploy && node dist/server.js"]
