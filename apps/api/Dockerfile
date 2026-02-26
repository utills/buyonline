# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
# BuyOnline API — Multi-stage Dockerfile
# Build context: monorepo root  (docker build -f apps/api/Dockerfile .)
# ─────────────────────────────────────────────────────────────

# ── Stage 1: base ─────────────────────────────────────────────
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

# ── Stage 2: builder — install + compile ─────────────────────
FROM base AS builder
WORKDIR /app

# Copy manifests first so install layer is cached unless deps change
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json                    ./apps/api/
COPY packages/shared-types/package.json       ./packages/shared-types/
COPY packages/ts-config/package.json          ./packages/ts-config/

# Install with BuildKit pnpm store cache — fast on repeated builds
RUN --mount=type=cache,id=pnpm-api,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source after install for better layer caching
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/api                                 ./apps/api
COPY packages/shared-types                    ./packages/shared-types
COPY packages/ts-config                       ./packages/ts-config

# Generate Prisma client for linux-musl (alpine target)
RUN cd apps/api && pnpm exec prisma generate

# Compile NestJS
RUN cd apps/api && pnpm run build

# ── Stage 3: runner — lean production image ────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# dumb-init: proper signal forwarding for node processes
RUN apk add --no-cache dumb-init

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs

# Built output
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist            ./dist

# Runtime node_modules (full tree needed for Prisma binaries)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules             ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules    ./apps/api/node_modules

# Workspace packages referenced at runtime
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared-types    ./packages/shared-types

# Prisma schema + migrations (needed for prisma migrate deploy)
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma          ./prisma

# package.json files required for module resolution in pnpm workspace
COPY --from=builder --chown=nestjs:nodejs /app/package.json             ./
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json    ./apps/api/
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-workspace.yaml      ./

USER nestjs

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
