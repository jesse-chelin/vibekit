---
name: deploy-vercel
description: Deploys app to Vercel with project configuration, database migration, environment setup, and optimized build settings. Use when the user wants managed hosting, mentions Vercel, needs auto-deploy from git, or wants a scalable serverless deployment.
---

# Deploy: Vercel

Deploy to Vercel for managed serverless hosting with automatic git deploys, preview environments, and edge network distribution.

## When NOT to Use

- User wants to self-host and control the server (use deploy-docker + deploy-vps or deploy-coolify)
- User needs persistent background workers (Vercel serverless functions have a max execution time — use deploy-docker for long-running processes)
- User needs WebSocket support (Vercel doesn't support persistent WebSocket connections)
- User wants to avoid vendor lock-in

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. User's code is in a Git repository (GitHub, GitLab, or Bitbucket)
2. User has a Vercel account
3. User has or will set up a PostgreSQL database (Vercel doesn't support SQLite)
4. User understands Vercel has usage limits on the free tier (100GB bandwidth, 10s function timeout)

## What It Adds

| File | Purpose |
|------|---------|
| `vercel.json` | Project configuration with build settings, headers, and function config |
| `.vercelignore` | Files to exclude from deployment |
| `scripts/setup-vercel.sh` | Automated project linking, env setup, and first deploy |
| `scripts/vercel-db-migrate.sh` | Database migration helper for switching from SQLite to Postgres |

## Prerequisites

- GitHub repository with your code pushed
- Vercel account (free tier available): https://vercel.com
- A PostgreSQL database (Vercel Postgres, Neon, Supabase, or any provider)

## Setup

### Option A: Automated (Recommended)

```bash
chmod +x scripts/setup-vercel.sh
./scripts/setup-vercel.sh
```

The script will:
1. Install Vercel CLI if needed
2. Link your project to Vercel
3. Guide you through environment variable setup
4. Handle the SQLite → PostgreSQL migration
5. Run your first deployment
6. Display your deployment URL

### Option B: Manual

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Configure environment variables in the Vercel Dashboard:
   - `DATABASE_URL` — PostgreSQL connection string
   - `AUTH_SECRET` — Random secret for Auth.js
   - `AUTH_URL` — Your Vercel deployment URL
   - Any other env vars your skills require
4. Deploy

### Database Migration

The app uses SQLite in development. For Vercel, you need PostgreSQL.

```bash
chmod +x scripts/vercel-db-migrate.sh
./scripts/vercel-db-migrate.sh
```

This script:
1. Updates `prisma/schema.prisma` to use PostgreSQL provider
2. Generates the Prisma client
3. Pushes the schema to your production database
4. Optionally seeds the database

Recommended PostgreSQL providers:
- **Neon** (free tier, serverless) — https://neon.tech
- **Supabase** (free tier) — https://supabase.com
- **Vercel Postgres** (integrated) — available in Vercel Dashboard

## Architecture

```
Git Push → Vercel Build → Serverless Functions + Static Assets → Edge Network → Users
```

- Each `git push` triggers an automatic deployment
- Pull requests get preview deployments with unique URLs
- Serverless functions handle API routes and server components
- Static pages are served from Vercel's edge CDN
- The `standalone` output in next.config.ts is NOT used — Vercel has its own optimized build

## Configuration Details

### vercel.json

- Region: `iad1` (US East) — change to your preferred region
- Function timeout: 30 seconds (free tier max is 10s, Pro is 60s)
- Security headers matching next.config.ts

### .vercelignore

Excludes development files from the deploy bundle:
- `skills/`, `skills-engine/` — only needed at dev time
- `prisma/dev.db` — SQLite database
- `.claude/`, `docs/` — documentation
- Test files and scripts

## Environment Variables

Required for all deployments:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | Auth.js secret (32+ chars) | `openssl rand -base64 32` |
| `AUTH_URL` | Your deployment URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Same as AUTH_URL | `https://your-app.vercel.app` |

## Custom Domain

```bash
# Via CLI
vercel domains add your-domain.com

# Or in the Vercel Dashboard → Settings → Domains
```

## Troubleshooting

**Build fails with Prisma error**: Make sure `DATABASE_URL` is set in Vercel environment variables. Prisma generates the client during build and needs the URL.

**Auth redirects to localhost**: Set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL.

**Function timeout**: Free tier has a 10-second limit. Optimize slow queries or upgrade to Pro for 60 seconds.

**Preview deploys use production DB**: Set different `DATABASE_URL` for Preview environment in Vercel Dashboard to avoid polluting production data.
