# Architecture

## Stack
- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (curated set of 30)
- **Database**: Prisma (SQLite dev, PostgreSQL prod)
- **API**: tRPC v11 with superjson
- **Auth**: Auth.js (NextAuth v5)
- **State**: TanStack React Query

## Directory Structure

```
src/
  app/              # Next.js App Router pages
    (marketing)/    # Public pages
    (auth)/         # Auth pages
    (app)/          # Authenticated app
    api/            # API routes
  components/
    ui/             # shadcn/ui primitives
    layout/         # Structural components
    patterns/       # Business components
    shared/         # Cross-cutting utilities
  lib/              # Core utilities
  trpc/             # tRPC setup and routers
  hooks/            # Custom React hooks
  types/            # TypeScript types
```

## Skills System

Skills are installable feature packages in `skills/`. Each skill is self-contained with:
- `manifest.json` — declares files, dependencies, conflicts
- `SKILL.md` — instructions for Claude
- `add/` — new files to copy into the project
- `modify/` — modified versions of existing files (for 3-way merge)

The skills engine (`skills-engine/`) handles installation, merging, and rollback.
