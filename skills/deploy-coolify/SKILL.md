---
name: deploy-coolify
description: Deploys app to Coolify self-hosted PaaS with Docker, Traefik routing, health checks, and resource management. Use when the user mentions Coolify, wants self-hosted PaaS, needs one-click deploys on their own server, or wants an alternative to Vercel they control.
---

# Deploy: Coolify

Deploy to Coolify — an open-source, self-hosted PaaS (like Vercel/Heroku but on your own server). One-click deploys from git with automatic SSL, health checks, and resource management.

## When NOT to Use

- User doesn't have a server with Coolify installed (suggest deploy-vercel for managed hosting)
- User doesn't want to manage their own server/infrastructure
- User wants the simplest possible deployment (suggest deploy-vercel)
- User only needs local development (no deploy skill needed)

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. `deploy-docker` skill is installed (provides the Dockerfile)
2. User has Coolify running on a server they control
3. User can access the Coolify dashboard (typically at port 8000)
4. The code is in a Git repository that Coolify can access

## What It Adds

| File | Purpose |
|------|---------|
| `docker-compose.coolify.yml` | Coolify-optimized compose with Traefik labels, health checks, and resource limits |
| `scripts/setup-coolify.sh` | Guided setup: validates Coolify access, creates application, configures environment |
| `coolify/README.md` | Quick reference for Coolify management commands |

## Prerequisites

- `deploy-docker` skill installed (provides the Dockerfile)
- A server with Coolify installed: https://coolify.io
- Your code in a Git repository (GitHub, GitLab, or Bitbucket)

## Setup

### Option A: Via Coolify Dashboard (Recommended for First Time)

1. Open your Coolify dashboard (e.g. `https://coolify.your-server.com`)
2. Click **New Resource** → **Application**
3. Select your Git provider and repository
4. Build Pack: **Docker Compose**
5. Docker Compose file: `docker-compose.coolify.yml`
6. Set environment variables (see below)
7. Click **Deploy**

### Option B: Guided Script

```bash
chmod +x scripts/setup-coolify.sh
./scripts/setup-coolify.sh
```

## Environment Variables

Set these in the Coolify Dashboard → Application → Environment:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string (use Coolify's managed DB) | Yes |
| `AUTH_SECRET` | Random secret: `openssl rand -base64 32` | Yes |
| `AUTH_URL` | Your app's public URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Same as AUTH_URL | Yes |
| `POSTGRES_USER` | Database username | Yes (default: vibekit) |
| `POSTGRES_PASSWORD` | Database password | Yes |
| `POSTGRES_DB` | Database name | Yes (default: vibekit) |

## Architecture

```
Git Push → Coolify Webhook → Docker Build → Traefik Proxy (SSL) → Users
```

- Coolify pulls your code on push and builds the Docker image
- Traefik handles SSL termination and routing
- Health checks ensure zero-downtime deployments
- Coolify manages container lifecycle, logs, and rollbacks

## Docker Compose Configuration

The `docker-compose.coolify.yml` includes:

- **App service**: Built from Dockerfile with health checks, resource limits (512MB RAM, 0.5 CPU), and Traefik labels for routing
- **Database service**: PostgreSQL 16 with persistent volume, health checks, and configurable credentials
- **Networking**: Internal network for app↔db communication

### Customizing Resources

Edit `docker-compose.coolify.yml` to adjust limits:
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'      # Increase CPU
      memory: 1024M     # Increase RAM
```

## Domain Setup

### Via Coolify Dashboard
1. Application → Settings → Domains
2. Add your domain
3. Coolify auto-provisions SSL via Let's Encrypt

### Via docker-compose labels
Edit the Traefik labels in `docker-compose.coolify.yml`:
```yaml
labels:
  - "traefik.http.routers.vibekit.rule=Host(`your-domain.com`)"
```

## Troubleshooting

**Build fails**: Check build logs in Coolify Dashboard. Common issue: missing environment variables during build (Prisma needs `DATABASE_URL`).

**Health check failing**: The app needs to respond at `/api/health`. Ensure the container has started and the database is accessible.

**Database connection refused**: Verify the `DATABASE_URL` matches the Postgres service config. The hostname should be `db` (the Docker service name).

**Rollback**: Coolify keeps previous deployments. Go to Deployments → click on a previous successful deploy → Rollback.
