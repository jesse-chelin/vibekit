---
name: background-jobs
description: Adds background job processing with BullMQ and Redis for scheduled tasks, email queues, and async work. Use when the user needs scheduled tasks, background processing, job queues, mentions cron jobs, or has long-running operations that shouldn't block the request. Requires Redis.
---

# Background Jobs — BullMQ + Redis

Reliable background job processing using BullMQ with Redis. Supports delayed jobs, scheduled/recurring tasks, retries with exponential backoff, and a job dashboard.

## When NOT to Use

- Tasks complete in under 1 second (just run them inline in the request)
- User doesn't have Redis and doesn't want to add it
- User is deploying to Vercel (serverless doesn't support long-running workers — use Vercel Cron instead)
- User only needs simple `setTimeout` functionality

## What It Adds

| File | Purpose |
|------|---------|
| `src/lib/queue.ts` | BullMQ queue setup, job registration, and worker initialization |
| `src/lib/jobs/example-job.ts` | Example job with typed data and processing logic |
| `src/trpc/routers/jobs.ts` | tRPC router: enqueue jobs, check status, list recent jobs |
| `src/app/(app)/admin/jobs/page.tsx` | Job dashboard: queue stats, recent jobs, retry failed |
| `scripts/worker.ts` | Standalone worker process (runs alongside the app) |

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. Redis is available: `redis-cli ping` should return `PONG`
2. If no local Redis, user is OK adding it via Docker: `docker run -d -p 6379:6379 redis:7-alpine`
3. If deploy-docker is installed, Redis will be added to docker-compose
4. User understands workers run as a separate process (not inside Next.js)

## Setup

### 1. Start Redis

**Option A: Docker (recommended)**
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

**Option B: System install**
```bash
# macOS
brew install redis && brew services start redis

# Ubuntu/Debian
sudo apt install redis-server && sudo systemctl start redis
```

### 2. Environment Variables

```env
REDIS_URL=redis://localhost:6379
```

### 3. Start the Worker

The worker runs as a separate process alongside your app:

```bash
# In a separate terminal
npx tsx scripts/worker.ts
```

CRITICAL: The worker must be running for jobs to be processed. In production, run it as a separate container or systemd service.

## Architecture

```
App (Next.js) → queue.ts enqueue() → Redis Queue → Worker Process → job handler
                                                        ↓
                                              Retry on failure
                                              (exponential backoff)
```

- **Producers**: Any server-side code (tRPC procedures, API routes) can enqueue jobs
- **Redis**: Stores job data, manages queue state, handles pub/sub for events
- **Workers**: Separate process that pulls jobs from Redis and executes them
- **Dashboard**: Admin page showing queue health, recent jobs, and retry controls

### Job Lifecycle

```
Added → Waiting → Active → Completed
                    ↓
                  Failed → (retry) → Waiting
                    ↓
                  Failed (max retries) → Dead
```

## Usage

### Defining a Job

```typescript
// src/lib/jobs/send-welcome-email.ts
import { Job } from "bullmq";

export const sendWelcomeEmailJob = {
  name: "send-welcome-email",
  handler: async (job: Job<{ userId: string; email: string }>) => {
    const { userId, email } = job.data;
    await sendWelcomeEmail({ to: email });
    await db.user.update({ where: { id: userId }, data: { welcomeEmailSent: true } });
  },
  options: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
};
```

### Enqueuing a Job

```typescript
import { enqueue } from "@/lib/queue";

// Immediate
await enqueue("send-welcome-email", { userId: "123", email: "user@example.com" });

// Delayed (send in 1 hour)
await enqueue("send-welcome-email", { userId: "123", email: "user@example.com" }, {
  delay: 60 * 60 * 1000,
});

// Recurring (every day at 9am)
await enqueue("daily-report", {}, {
  repeat: { pattern: "0 9 * * *" }, // cron syntax
});
```

## Post-Install Verification

1. Start Redis: `docker run -d -p 6379:6379 redis:7-alpine`
2. Set `REDIS_URL=redis://localhost:6379` in `.env.local`
3. Start the worker: `npx tsx scripts/worker.ts`
4. Start the app: `pnpm dev`
5. Enqueue a test job via the admin dashboard at `/admin/jobs`
6. Verify the worker processes it (check worker terminal output)

## Troubleshooting

**"ECONNREFUSED 127.0.0.1:6379"**: Redis isn't running. Start it with Docker or your system's service manager.

**Jobs stuck in "waiting"**: The worker process isn't running. Start it with `npx tsx scripts/worker.ts`.

**Jobs failing repeatedly**: Check the error in the job dashboard. Common issues: missing environment variables, database not accessible from worker, network errors.

**Memory growing**: Old completed/failed jobs accumulate in Redis. Configure `removeOnComplete` and `removeOnFail` in job options to auto-clean.
