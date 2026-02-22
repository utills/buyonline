# BuyOnline - Health Insurance Purchase Platform

A full-stack health insurance purchase journey (Prudential/PRUHealth-style) built with Next.js, NestJS, and PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Zustand, React Hook Form, Zod |
| Backend | NestJS 11, TypeScript, Prisma ORM 7 |
| Database | PostgreSQL 16, Redis 7 |
| Monorepo | Turborepo + pnpm workspaces |

## Project Structure

```
buyonline/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── api/          # NestJS backend (port 3001)
├── packages/
│   ├── ui/           # Shared UI components
│   ├── shared-types/ # Shared TypeScript types & enums
│   └── ts-config/    # Shared TypeScript configs
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10
- **Docker** & Docker Compose

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start database (PostgreSQL + Redis)

```bash
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:5433`
- Redis on `localhost:6379`

### 3. Build shared packages

```bash
cd packages/shared-types && pnpm build
```

### 4. Setup database

```bash
cd apps/api

# Push schema to database
pnpm db:push

# Seed with sample data (plans, diseases, hospitals, etc.)
pnpm db:seed
```

### 5. Start development servers

**Option A** - Using Turborepo (both apps):

```bash
# From project root
pnpm dev
```

**Option B** - Start individually:

```bash
# Terminal 1 - API (requires build first)
cd apps/api
npx nest build && npx nest start

# Terminal 2 - Frontend
cd apps/web
pnpm dev
```

### 6. Verify

- Frontend: http://localhost:3000
- API: http://localhost:3001

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `docker compose up -d` | Start PostgreSQL + Redis |
| `docker compose down` | Stop PostgreSQL + Redis |

### API (`apps/api`)

| Command | Description |
|---------|-------------|
| `pnpm db:push` | Push Prisma schema to DB (no migration) |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm db:generate` | Regenerate Prisma client |
| `npx nest build` | Build the API |
| `npx nest start` | Start the API |
| `npx nest start --watch` | Start the API in watch mode |

### Frontend (`apps/web`)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |

## Environment Variables

The API expects a `.env` file in `apps/api/`:

```env
DATABASE_URL=postgresql://buyonline:buyonline@localhost:5433/buyonline
JWT_SECRET=buyonline-dev-secret-key-change-in-production
OTP_EXPIRY_SECONDS=180
PORT=3001
```

The frontend uses:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## License

Private - All rights reserved.
