# Vibekit

Describe the app you want. Get a real, production-quality web app — not a demo, not a toy.

Vibekit is a starter kit for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). You clone it, open Claude Code, and describe what you want to build in plain English. Claude handles everything — dependencies, database, the interview about your app, building it, and documentation. You get proper design, error handling, loading states, mobile layouts, and real infrastructure (database, auth, API) — all baked in from the start.

---

## 🎬 See It In Action

<!-- TODO: Add GIFs/screenshots showing:
  1. Opening Claude Code and running /setup
  2. The guided interview ("What are you building?")
  3. The generated app running (dashboard, list view, detail page)
  4. Adding a feature with /add-feature
  5. Mobile view of a generated app
-->

*Coming soon — GIFs of the full flow from clone to running app.*

---

## 🏗️ Built With Vibekit

<!-- TODO: Add example apps with screenshots and descriptions. Format:

### FitTracker
> Workout logging app with progress charts and AI coaching

![FitTracker screenshot](docs/examples/fittracker.png)

**Skills used:** `charts`, `ollama`
**Built in:** ~20 minutes

---

### TeamBoard
> Project management tool with kanban boards and real-time updates

![TeamBoard screenshot](docs/examples/teamboard.png)

**Skills used:** `realtime-chat`, `file-uploads`
**Built in:** ~30 minutes

-->

*Example apps coming soon. If you build something with Vibekit, we'd love to feature it here.*

---

## 📋 Before You Start

You need three things installed on your computer. If you don't have them, follow the links below. (Claude will also check these when you run `/setup` and tell you what's missing.)

### 1. Node.js (version 18 or newer)

Check if you have it:
```bash
node -v
```
If you see `v18.x.x` or higher, you're good. If not, install it from **[nodejs.org](https://nodejs.org)** — download the LTS version.

### 2. pnpm (package manager)

After installing Node.js, install pnpm:
```bash
npm install -g pnpm
```

### 3. Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

You'll need a [Claude Pro, Max, or API subscription](https://claude.ai/). Claude Code is what actually builds your app — Vibekit gives it the guardrails to do it well.

---

## 🚀 Getting Started

### Step 1: Clone the project

Open your terminal and run:

```bash
git clone https://github.com/jesse-chelin/vibekit.git my-app
cd my-app
```

Replace `my-app` with whatever you want your project folder to be called.

### Step 2: Open Claude Code

```bash
claude
```

### Step 3: Run setup

```
/setup
```

That's it. Claude will:
- Check your prerequisites (Node.js, pnpm, git)
- Install dependencies and set up the database
- Ask you what you want to build — just describe it in plain English
- Validate your idea, challenge assumptions, and scope the MVP
- Present a build plan for approval before writing any code
- Compile a build spec and run code generators to produce all standard scaffolding in seconds
- Customize with business logic, skill integration, and branding
- Set up documentation so future sessions always know the current state

When it's done, run `pnpm dev` to see your app at **http://localhost:3000**.

### Step 4: Keep building

Your app isn't a one-shot thing. Come back any time and open Claude Code to add more features:

```bash
claude
```

Claude reads your project docs at the start of every session, so it always knows what your app is and what's been built. You can say things like:

- *"Add a notifications page"*
- *"Let users upload profile photos"*
- *"Add Stripe payments"*
- *"What's next on the roadmap?"*

---

## 📦 What's Included

| What | Why It Matters |
|------|---------------|
| **30 curated UI components** | Consistent, professional design — every time |
| **Database + ORM** | Real data storage, not just a pretty frontend |
| **Authentication** | Sign-up, sign-in, sessions — already wired up |
| **Type-safe API** | Your frontend and backend speak the same language |
| **Security** | CSRF protection, rate limiting, input validation — built in |
| **21 installable skills** | Payments, AI, charts, email, maps, chat, and more |
| **6 deployment options** | Docker, Vercel, Cloudflare, Tailscale, VPS, Coolify |

## 🧩 Skills

Need a specific feature? Skills are pre-built packages Claude can install in seconds:

| Skill | What It Adds |
|-------|-------------|
| `stripe` | Payments, subscriptions, billing portal |
| `ollama` | Local AI (free, private, runs on your hardware) |
| `cloud-llm` | Cloud AI (OpenAI, Claude, OpenRouter) |
| `charts` | Dashboard charts (line, bar, area, pie) |
| `file-uploads` | File storage with drag-drop uploader |
| `email` | Transactional email via Resend |
| `realtime-chat` | Live chat with typing indicators |
| `maps` | Interactive maps with markers |
| `pdf` | PDF generation and preview |
| `admin-panel` | Auto-generated admin pages |
| `rbac` | Role-based access control |
| `analytics` | Usage tracking with PostHog |
| `i18n` | Multiple languages |
| `background-jobs` | Scheduled tasks |
| `notifications-push` | Browser push notifications |

**Deployment:** `deploy-docker` · `deploy-vercel` · `deploy-cloudflare` · `deploy-tailscale` · `deploy-vps` · `deploy-coolify`

---

## ⚙️ Code Generators

The `generators/` directory contains TypeScript scripts that produce app scaffolding from a JSON build spec. During `/setup`, Claude compiles a `build-spec.json` describing your models, fields, and relations, then the generators produce everything:

```bash
npx tsx generators/compose.ts .vibekit/build-spec.json
```

| Generator | Output |
|-----------|--------|
| `prisma-model.ts` | Prisma models with relations, indexes, User relations |
| `trpc-router.ts` | 5-procedure routers (list, byId, create, update, delete) + registration |
| `list-page.ts` | Server page + client DataTable component + loading skeleton |
| `detail-page.ts` | Detail page with sidebar + content + delete button |
| `form-page.ts` | Create + edit pages with Zod validation + loading skeletons |
| `dashboard.ts` | Stat cards + recent activity card |
| `sidebar.ts` | Navigation with correct icons and routes |
| `seed.ts` | Realistic seed data |

The build spec schema is defined in `generators/types.ts`. Generators are idempotent — safe to re-run.

---

## 🛠️ Troubleshooting

**`node: command not found`**
Install Node.js from [nodejs.org](https://nodejs.org) (LTS version), then restart your terminal.

**`pnpm: command not found`**
```bash
npm install -g pnpm
```

**`claude: command not found`**
```bash
npm install -g @anthropic-ai/claude-code
```

**The app won't start / build errors**
```bash
pnpm install
pnpm build
```
If you see errors, copy the error message and paste it into Claude Code — it'll fix it.

**I want to start over**
```bash
rm -rf node_modules .next prisma/dev.db .env .env.local .vibekit APP.md ROADMAP.md CHANGELOG.md
```
Then open Claude Code and run `/setup` again.

---

## 🤔 How It Works

Vibekit isn't an AI wrapper or a no-code platform. It's a carefully constrained starter kit that makes Claude Code produce consistently high-quality output by:

1. **Validating before building** — Challenges your idea, identifies competitors, scopes your MVP. The interview prevents you from building the wrong thing.
2. **Generating, not writing** — TypeScript code generators produce 80% of the app (models, routers, pages, dashboard, sidebar, seed data) from a JSON build spec. The LLM handles the 20% that's unique.
3. **Constraining the design space** — ~37 curated components, a fixed spacing scale, 4 animation presets. There's literally no way to produce inconsistent UI.
4. **Mandating completeness** — Every page must have loading states, empty states, error states, and mobile layouts before it's considered done.
5. **Testing against reality** — Pages must handle 0 items, 100+ items, long text, missing fields, rapid clicks, and API failures.
6. **Giving you the code** — It's standard Next.js + TypeScript. You own every line and can deploy anywhere.

### Tech Stack

Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma · tRPC · Auth.js · TanStack Query · Geist fonts

## License

MIT
