# Vibekit

Build production-quality web apps by describing what you want. Clone the repo, open Claude Code, tell it what to build — get a real, deployable app with consistent design, proper error handling, and real infrastructure. Not a demo. Not a toy.

## What You Get

- A real **Next.js 15** app with TypeScript, Tailwind CSS, and 30 curated UI components
- A real **database** (SQLite for dev, PostgreSQL for production) with Prisma ORM
- Real **authentication** (Auth.js) with sign-in, sign-up, and session management
- Real **APIs** (tRPC) with end-to-end type safety and input validation
- Real **security** — CSRF protection, rate limiting, environment validation, security headers
- **21 installable skills** — payments (Stripe), AI (Ollama/OpenAI/Claude), file uploads, charts, email, maps, real-time chat, PDF generation, and more
- **6 deployment options** — Docker, Cloudflare Tunnel, Tailscale, Vercel, Coolify, or bare VPS

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [pnpm](https://pnpm.io/) installed (`npm install -g pnpm`)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed (`npm install -g @anthropic-ai/claude-code`)

### 1. Clone and set up

```bash
git clone https://github.com/jesse-chelin/vibekit.git my-app
cd my-app
chmod +x setup.sh
./setup.sh
```

This installs dependencies, creates your database, seeds it with demo data, and generates a secret key. Takes about 30 seconds.

### 2. Verify it works

```bash
pnpm dev
```

Open http://localhost:3000 — you should see the app running with a landing page, auth pages, dashboard, and example project pages.

### 3. Build your app

Open the project in Claude Code:

```bash
claude
```

Claude will read the project instructions and ask you what you want to build. Just describe your app in plain English — who it's for, what it does, what features you need. Claude handles the rest:

- Sets up your data models
- Creates your pages (with loading skeletons, empty states, error handling, and mobile layouts — automatically)
- Installs any skills you need (payments, AI, charts, etc.)
- Generates documentation so Claude always knows the current state of your app
- Creates a feature roadmap so you can keep building over time

### 4. Keep building

After the initial build, you can keep adding features:

```
/add-feature user notifications
/roadmap
/quality-gate
```

Claude tracks everything in `APP.md` (what the app is), `ROADMAP.md` (what's planned), and `CHANGELOG.md` (what changed) — so every session picks up exactly where you left off.

## How It Works

Vibekit is **not** an AI wrapper or a no-code platform. It's a carefully constrained starter kit that makes Claude Code produce consistently high-quality output by:

1. **Constraining the design space** — 30 curated components, a fixed spacing scale, 4 animation presets. There's no way to produce inconsistent UI because the system only allows consistent choices.

2. **Mandating completeness** — Every page must have a loading skeleton, empty state, error state, and mobile layout before it's considered done. No "happy path only" demos.

3. **Testing against reality** — Pages must handle 0 items, 1 item, 100+ items, very long text, missing fields, rapid clicks, and API failures. Not just the golden path.

4. **Giving you the code** — It's standard Next.js + TypeScript. You can read every line, modify anything, deploy anywhere. No vendor lock-in.

## Available Skills

Install any skill with: `npx tsx skills-engine/index.ts apply <skill-name>`

### Feature Skills

| Skill | What It Adds |
|-------|-------------|
| `ollama` | Local AI via Ollama (free, private, runs on your hardware) |
| `cloud-llm` | Cloud AI via OpenAI, Claude, or OpenRouter |
| `stripe` | Payments, subscriptions, billing portal |
| `file-uploads` | S3-compatible file storage with drag-drop uploader |
| `email` | Transactional email via Resend |
| `realtime-chat` | WebSocket chat with typing indicators |
| `maps` | Leaflet maps with markers and location picker |
| `charts` | Recharts dashboard components (line, bar, area, pie) |
| `pdf` | PDF generation and preview |
| `background-jobs` | Scheduled tasks via BullMQ + Redis |
| `admin-panel` | Auto-generated admin CRUD for all models |
| `notifications-push` | Web push notifications |
| `analytics` | PostHog integration with feature flags |
| `rbac` | Role-based access control |
| `i18n` | Internationalization and locale switching |

### Deployment Skills

| Skill | Best For |
|-------|----------|
| `deploy-docker` | Self-hosted with Docker Compose + PostgreSQL |
| `deploy-cloudflare` | Free public URL via Cloudflare Tunnel |
| `deploy-tailscale` | Private sharing via Tailscale Funnel |
| `deploy-vercel` | Managed hosting with auto-deploy |
| `deploy-coolify` | Self-hosted PaaS via Coolify |
| `deploy-vps` | Bare VPS with Caddy + systemd + auto SSL |

## Slash Commands

Once you're in Claude Code, these commands are available:

| Command | What It Does |
|---------|-------------|
| `/add-feature [description]` | Plan and build a new feature step by step |
| `/add-page [name]` | Create a new page with all required files |
| `/roadmap` | View, plan, and manage your feature backlog |
| `/review-page [path]` | Audit a page for completeness, spacing, and edge cases |
| `/quality-gate` | Full pre-ship audit (build, states, security, docs) |
| `/native-feel [path]` | Audit for Linear/Vercel-quality polish |
| `/brand-check [path]` | Design system compliance check |
| `/perf-check [path]` | Performance audit |
| `/update-docs` | Update APP.md, ROADMAP.md, and CHANGELOG.md |

## Project Structure

```
vibekit/
├── CLAUDE.md                    # AI instructions (Claude reads this first)
├── APP.md                       # Generated: what your app is (models, routes, API)
├── ROADMAP.md                   # Generated: planned and completed features
├── CHANGELOG.md                 # Generated: what changed and when
├── prisma/schema/               # Database models
├── src/
│   ├── app/                     # Pages (marketing, auth, app)
│   ├── components/
│   │   ├── ui/                  # 30 curated shadcn/ui components
│   │   ├── layout/              # App shell (sidebar, topbar, nav)
│   │   ├── patterns/            # Business components (data-table, empty-state, etc.)
│   │   └── shared/              # Icons, logo, theme, animations
│   ├── trpc/routers/            # Type-safe API procedures
│   ├── lib/                     # Auth, database, utilities
│   └── hooks/                   # React hooks
├── skills/                      # 21 installable skill packages
├── skills-engine/               # Skill installer/remover
└── .claude/
    ├── commands/                # Slash commands
    └── docs/                    # Detailed guides for Claude
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 with OKLCH design tokens |
| Components | shadcn/ui (30 curated primitives) |
| Database | Prisma with SQLite (dev) / PostgreSQL (prod) |
| API | tRPC with Zod validation |
| Auth | Auth.js (NextAuth v5) |
| State | TanStack Query (server state) |
| Fonts | Geist Sans + Geist Mono |

## License

MIT
