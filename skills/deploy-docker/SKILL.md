---
name: deploy-docker
description: Adds Docker containerization with multi-stage Dockerfile, docker-compose with PostgreSQL, and auto-migration entrypoint. Use when the user wants to deploy with Docker, containerize the app, run in production, or needs PostgreSQL instead of SQLite. Foundation for other deploy skills.
---

# Deploy: Docker

Multi-stage Dockerfile (~150MB final image, non-root user) with docker-compose for app + PostgreSQL. Foundation layer for deploy-cloudflare, deploy-coolify, and deploy-vps skills.

## When NOT to Use

- User is only developing locally and happy with SQLite + `pnpm dev`
- User is deploying to Vercel (use deploy-vercel instead — Vercel has its own build pipeline)
- User explicitly says they don't want Docker

## What It Adds

| File | Purpose |
|------|---------|
| `Dockerfile` | 3-stage build: deps → build → runtime. Non-root user, ~150MB |
| `docker-compose.yml` | App + PostgreSQL 16 Alpine with health checks |
| `docker-compose.prod.yml` | Production override with resource limits |
| `.dockerignore` | Excludes node_modules, .git, dev files |
| `scripts/docker-entrypoint.sh` | Runs Prisma migrations before starting the app |

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. Docker and Docker Compose are installed: `docker --version && docker compose version`
2. The user understands this will switch the database from SQLite to PostgreSQL
3. No other deploy skill conflicts exist (check `.vibekit/state.json`)

## Setup

### 1. Environment Variables

After installation, set these in `.env.local`:

```env
DATABASE_URL=postgresql://vibekit:vibekit@db:5432/vibekit
POSTGRES_USER=vibekit
POSTGRES_PASSWORD=vibekit
POSTGRES_DB=vibekit
```

CRITICAL: Change `POSTGRES_PASSWORD` to a strong random password for production. The default is for development only.

### 2. Update Prisma Provider

The Prisma schema provider must be changed from `sqlite` to `postgresql`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Build and Run

```bash
docker compose up --build
```

The entrypoint script automatically runs `prisma db push` on first boot. App available at http://localhost:3000.

### Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Architecture

```
docker-compose.yml
├── app (port 3000)
│   ├── 3-stage Dockerfile (deps → build → runtime)
│   ├── Non-root user (nextjs:nodejs)
│   ├── Standalone Next.js output
│   └── Entrypoint: migrate → start
└── db (PostgreSQL 16 Alpine)
    ├── Health check: pg_isready
    ├── Persistent volume: postgres_data
    └── Port 5432 (internal only)
```

## Post-Install Verification

After running `docker compose up --build`, verify:
1. `docker compose ps` shows both services as "healthy"
2. `curl http://localhost:3000/api/health` returns 200
3. `docker compose logs app` shows no Prisma errors

## Troubleshooting

**Build fails at Prisma generate**: Ensure `DATABASE_URL` is set in `.env.local`. Prisma needs it at build time for client generation.

**Database connection refused**: The `db` service may not be ready yet. The entrypoint script retries, but check `docker compose logs db` for startup errors.

**Permission denied errors**: The Dockerfile uses a non-root user. Don't mount volumes with root-only permissions.

**Image too large**: Verify `.dockerignore` exists. Without it, `node_modules` and `.git` get copied into the build context.
