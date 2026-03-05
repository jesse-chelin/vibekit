# Guided Setup Flow

When a user opens this repo and wants to build an app, follow this interview flow.
Speak in plain language. No jargon. Translate human intent into technical decisions.

---

## Step 0: Context Check

Check if `.vibekit/intent.json` exists with `"interviewComplete": true`. If it does, a previous `/setup` run completed the interview but may not have finished the build. Read the file and use its contents (appName, category, skills, description) to skip the interview and jump directly to Step 7: Build.

If `intent.json` doesn't exist or `interviewComplete` is missing/false, proceed to Step 0b to start the interview.

---

## Step 0b: Choose Your Path

Ask the user how they'd like to build:

**Quick Start**: "Tell me what you're building in one sentence, and I'll set everything up with smart defaults. You can customize later."
- Infers category, auto-selects skills, uses default pages and models
- Best for: users who want to see a working app fast

**Custom Build**: "Let's go step by step. I'll ask about your app, features, data, screens, and deployment — you decide everything."
- Full interview, user approves each decision
- Best for: users who know what they want and want control

If the user just says something like "build me a recipe app" without choosing, treat it as Quick Start. If they ask questions or give detailed requirements, switch to Custom Build.

---

## Quick Start Path

### 1. Detect category and auto-configure

From the user's description, identify the category and auto-select:

| Category | Auto-Skills | Auto-Models | Auto-Pages |
|----------|-------------|-------------|------------|
| E-commerce / marketplace | stripe, file-uploads, charts | Product, Order, Category | Dashboard, Products (list/detail/create), Orders, Settings |
| Dashboard / analytics | charts | varies by domain | Dashboard, Data list/detail, Settings |
| Social / community | realtime-chat, file-uploads | Post, Comment, Message | Dashboard, Feed, Chat, Profile, Settings |
| SaaS / productivity | stripe, charts, email | varies by domain | Dashboard, Entity list/detail/create/edit, Settings |
| AI app | ollama or cloud-llm, charts | Conversation, Message | Dashboard, Chat, History, Settings |
| Media management | file-uploads, charts | Media, Collection, Tag | Dashboard, Library, Upload, Detail, Settings |
| Internal tool | admin-panel, rbac, charts | varies by domain | Dashboard, Admin, Entity list/detail, Settings |

### 2. Present the plan

Show the user a summary before building:

```
Here's what I'll build for you:

App: [Name]
Type: [Category]
Skills: [list]
Models: [list with key fields]
Pages: [list]
Deployment: Dev mode (localhost) — you can add deployment later

Sound good? I can adjust anything, or we can switch to the step-by-step flow if you want more control.
```

### 3. Build

If they approve, jump to **Step 7: Build** below.
If they want changes, address their feedback and re-present.
If they want full control, switch to the Custom Build path.

---

## Custom Build Path

### Step 1: "What are you building?"

Ask: "Tell me about the app you want to build. What does it do? Who is it for?"

Listen for category signals:
- "marketplace" / "store" → e-commerce (suggest: stripe, file-uploads)
- "dashboard" / "analytics" → data app (suggest: charts)
- "social" / "community" → social (suggest: realtime-chat, file-uploads)
- "SaaS" / "tool" → productivity (suggest: stripe, charts, email)
- "AI" / "chatbot" → AI app (suggest: ollama or cloud-llm)
- "media" / "music" / "photos" → media management (suggest: file-uploads, charts)
- "internal tool" / "admin" → admin tool (suggest: admin-panel, rbac, charts)

Respond: "So it sounds like you're building a [category]. Here's what I'm thinking..."

### Step 2: "What should it be able to do?"

Ask feature questions in plain language. Only ask questions relevant to their category — don't dump all 15 options:

- "Will people need accounts?" → Auth is already included
- "Will you charge money?" → stripe skill
- "Do you want AI features?" → "Should the AI run on your computer (free, private) or in the cloud (small cost per use)?" → ollama / cloud-llm
- "Will people upload files?" → file-uploads skill
- "Should things update in real-time?" → realtime-chat skill
- "Do you need charts or dashboards?" → charts skill
- "Does location matter?" → maps skill
- "Should the app send emails?" → email skill
- "Do you need an admin area?" → admin-panel skill
- "Multiple languages?" → i18n skill

#### Checkpoint 1: Confirm skills

Before moving on, present the selected skills:

```
Based on what you've told me, here's what I'll set up:

Included by default:
- Authentication (accounts, sign-in, sign-up)
- Dashboard with stats
- Settings page

Skills I'll install:
- [skill] — [one-line reason]
- [skill] — [one-line reason]

Anything to add or remove?
```

#### Skill Safety Constraints (enforce silently)

These combinations are auto-enforced — don't ask, just include:
- `stripe` → auto-include `email` (receipts and billing notifications need email)
- `realtime-chat` → auth is already included, but verify WebSocket config
- `deploy-cloudflare` → auto-require `deploy-docker`
- `deploy-coolify` → auto-require `deploy-docker`
- `deploy-vps` → auto-require `deploy-docker`
- `admin-panel` → auto-include `rbac` (admin needs role separation)
- `notifications-push` → auth required (already included)

If a user selects conflicting skills, resolve silently:
- `ollama` + `cloud-llm` → both is fine, offer unified interface
- `deploy-vercel` + `deploy-docker` → warn: "Vercel handles deployment for you, so you won't need Docker. Want Vercel (simpler) or Docker (more control)?"

### Step 3: "What things does your app track?"

Ask: "What are the main things in your app? For example, a recipe app tracks recipes and ingredients."

Translate their concepts into:
- Prisma models in `prisma/schema.prisma`
- tRPC routers in `src/trpc/routers/`
- Pages in `src/app/(app)/`

#### Checkpoint 2: Confirm data model

Present the models before generating code:

```
Here are the things your app will track:

[Model Name]
  - [field]: [type] — [what it's for]
  - [field]: [type] — [what it's for]
  - Connected to: [related model]

[Model Name]
  ...

Does this capture everything? Anything missing or wrong?
```

### Step 4: "What screens do you need?"

Suggest based on their entities:
- Dashboard with stats → dashboard page + stat-card components
- List/table view → data-table with sort/filter
- Create/edit forms → form pages with Zod validation
- Detail pages → detail-layout with sidebar
- Settings → settings-layout with tabs
- Landing page → marketing page template
- Onboarding → wizard component for first-run setup

**IMPORTANT**: For each screen, confirm:
- What does it show when empty? (first-time user experience)
- What data is displayed? (determines the loading skeleton shape)
- What actions can the user take? (determines buttons and forms)

#### Checkpoint 3: Confirm page list

```
Here are all the screens I'll build:

Pages:
- Dashboard — stats overview, recent activity, quick actions
- [Entity] List — searchable table with sort/filter
- [Entity] Detail — full view with [sidebar info]
- Create [Entity] — form with [fields]
- Settings — General, [other tabs]
- Landing — public page explaining what the app does

Each page will include:
- Loading skeleton (so it never flashes blank)
- Empty state (helpful message + action button when there's no data)
- Error handling (retry button if something goes wrong)
- Mobile layout (works on phones)

Total: [N] pages. Ready to move on?
```

### Step 5: "Who needs to access this?"

Ask deployment questions:
- "Just for you?" → No deploy skill, stay on dev mode
- "Share with friends/team, have a server?" → deploy-tailscale
- "Share with friends/team, no server?" → deploy-cloudflare or deploy-vercel
- "Public app, don't want to manage servers?" → deploy-vercel
- "Public app, have a VPS?" → deploy-vps
- "Use Docker?" → deploy-docker
- "Use Coolify?" → deploy-coolify

Always explain: "I'd recommend [X] because [reason]. It costs about [Y]/month."

### Step 6: "Let's pick a look"

Confirm the app name if not already established during the conversation, then ask:
- "Pick a main color" (offer: blue, green, purple, orange, red, teal)

Apply branding to constants and CSS variables.

#### Checkpoint 4: Final confirmation

Present the complete build plan before writing any code:

```
Here's everything I'm about to build:

App: [Name]
Color: [color]
Skills: [list]
Models: [N] models — [names]
Pages: [N] pages — [names]
Deployment: [choice or "dev mode for now"]

This will take a few minutes. Ready to go?
```

---

## Step 7: Build

### Build Phase (follow this order exactly, with verification after each step)

#### 7a. Install Skills
```bash
npx tsx skills-engine/index.ts apply <name>
```
**Verify**: Each skill installs without errors. If a skill fails, diagnose and fix before continuing — don't skip it and hope for the best.

#### 7b. Generate Database
- Create Prisma models for each entity
- Run `pnpm db:push`

**Verify**: `pnpm db:push` succeeds. If it fails (schema error, SQLite limitation), fix the schema and re-push. Do NOT proceed with a broken schema.

#### 7c. Generate API
- Create tRPC routers with Zod input validation for each model
- Wire routers into the root router

**Verify**: No TypeScript errors in the router files. Run `npx tsc --noEmit` on the router directory if unsure.

#### 7c-checkpoint. Commit: data models and API
```bash
git add -A && git commit -m "feat: add data models and API"
```
This creates a save point. If the page generation step fails, you won't lose the schema and router work.

#### 7d. Generate Pages

**Parallel page generation**: Identify pages that don't depend on each other (e.g., a Chores page and a Bills page are independent — they have separate routers and models). Use the Task tool to launch parallel agents for independent pages. Each agent should create `page.tsx` + `loading.tsx` + client component for one page. Pages that share data or components should be built sequentially. This can cut build time by 40-60%.

FOR EACH PAGE (whether built in parallel or sequentially), create ALL of these:

FOR EACH PAGE, create ALL of these before moving to the next page:

1. `page.tsx` — Using PageHeader + consistent `p-4 md:p-6` padding + `space-y-6` sections
2. `loading.tsx` — Skeleton matching the exact layout (same grid, same card sizes)
3. **Empty state** — EmptyState component with icon, title, description, and action button
4. **Error handling** — Every data-fetching component handles errors with retry
5. **Mobile layout** — Verified at 375px width, no overflow

**Verify each page**: Before starting the next page, mentally walk through:
- What does a first-time user see? (empty state)
- What does a returning user see? (data loaded)
- What if the network is slow? (loading skeleton)
- What if the API is down? (error state)
- What if they're on a phone? (mobile layout)

If any answer is "a blank screen" or "it breaks", fix it now.

CRITICAL: Do NOT skip any of these. The #1 mistake in AI-generated apps is
shipping pages without empty states, error handling, and loading skeletons.
These are NOT polish — they are core features. A page without an empty state
is like a function without error handling. It's incomplete.

#### 7d-checkpoint. Commit: all pages
```bash
git add -A && git commit -m "feat: add all pages"
```
Another save point before wiring up navigation and data flow.

#### 7e. Navigation and Data Flow
- Add pages to sidebar navigation
- Wire up all query invalidations (mutations must refresh all affected views)

#### 7f. Branding
- Apply the user's chosen name and color throughout

#### 7g. Seed and Verify
```bash
pnpm db:push && pnpm db:seed
pnpm build
```

**Verify**: Build passes with zero errors. If it fails, fix and re-run. Do NOT skip the build check.

#### 7h. Deployment (if applicable)
If a deploy skill was installed, walk through setup step by step. Each deployment skill's SKILL.md has its own guided setup.

### Post-Build Documentation (MANDATORY)

After the build passes, generate these files:

#### 7i. Generate `APP.md`
Follow the structure in CLAUDE.md's "Living Documentation" section. Include:
- App name and one-paragraph description
- Tech Stack (Next.js, installed skills, deployment)
- Data Models (every Prisma model with key fields)
- Routes & Pages (every route, what it shows)
- API / tRPC Routers (every procedure)
- Installed Skills
- Environment Variables (from .env.example, never include values)
- Key Decisions

#### 7j. Generate `ROADMAP.md`
Follow the structure in CLAUDE.md's "Roadmap" section:
- Current Sprint (empty — app just launched)
- Up Next (suggest 3-5 natural next features based on the app type)
- Future Ideas (suggest 3-5 longer-term ideas)
- Completed: "Initial build — [today's date]"

#### 7k. Generate `CHANGELOG.md`
```markdown
# Changelog

## [Unreleased]

## [YYYY-MM-DD] - Initial Release

### Added
- [List every feature built in the initial setup]
```

#### 7l. Initialize git and make the first commit
```bash
git init
git add .
git commit -m "feat: initial vibekit build — [app name]"
```

If the user wants to push to GitHub:
```bash
gh repo create [app-name] --private --source=. --push
```

### Programmatic Verification (run before the manual checklist)

After the build passes, run these automated checks:

```
For every page.tsx under src/app/(app)/:
  1. Check that a loading.tsx exists in the same directory
  2. Grep the page or its client components for "EmptyState" — every list page must use it
  3. Grep for error handling (onError, error boundary, or error state rendering)
  4. Grep for TODO, FIXME, "goes here", or similar stub markers — any found means the page is not done

For each skill listed in the build plan or .vibekit/intent.json:
  1. Verify at least one component, route, or page imports or uses the skill
  2. If a skill was installed but not integrated, either integrate it now or remove it:
     npx tsx skills-engine/index.ts remove <name>
```

If any check fails, fix it before continuing. Do not ship stubs or unused skills.

### Post-Build Verification (MANDATORY)

After building, verify EVERY generated page against this checklist:

| Check | How to Verify |
|-------|---------------|
| Loading state | Does `loading.tsx` exist? Does its skeleton match the page layout? |
| Empty state | What happens with zero data? Is there a helpful EmptyState with action button? |
| Error state | What happens when the API fails? Is there a retry button? |
| Mobile layout | Does it look right at 375px? No overflow? Touch targets ≥ 44px? |
| Consistent spacing | Is page padding `p-4 md:p-6`? Are sections `space-y-6`? |
| Data propagation | After mutations, do all affected pages update? |
| Navigation | Is the page in the sidebar? Can the user get there and back? |
| First-run experience | What does a brand new user see? Is it helpful, not empty? |
| Long text | What happens with a 200-character name? Does it truncate or break the layout? |
| Missing fields | If optional fields are empty, is there a blank gap or graceful fallback? |
| Many items | With 100+ items, is there pagination? Or does the page choke? |
| Single item | Does a 1-item list/grid still look right? No weird empty columns? |
| Rapid clicks | If you click "Create" 5 times fast, does it create 5 duplicates? Buttons should disable during async. |

If ANY check fails, fix it immediately. Do not move on to the next page.

### Post-Build Summary

After everything passes, present a summary to the user:

```
Your app is ready!

[App Name] is running at http://localhost:3000

What I built:
- [N] data models: [names]
- [N] pages: [names]
- [N] API endpoints across [N] routers
- Skills installed: [names]

What's next:
- Run `pnpm dev` to start the app
- Check ROADMAP.md for planned features
- Use `/add-feature` to build the next feature
- Use `/roadmap` to manage your feature backlog

Everything is documented in APP.md, and I'll keep it updated as we build.
```

---

## Feature-to-Skill Mapping

| Feature | Skill |
|---------|-------|
| AI (local) | ollama |
| AI (cloud) | cloud-llm |
| Payments | stripe |
| File storage | file-uploads |
| Email | email |
| Real-time chat | realtime-chat |
| Maps | maps |
| Charts | charts |
| PDF generation | pdf |
| Background jobs | background-jobs |
| Admin panel | admin-panel |
| Push notifications | notifications-push |
| Analytics | analytics |
| Role-based access | rbac |
| Multi-language | i18n |

## Common Pitfalls (from real projects)

These are the mistakes people actually make. Avoid them:

1. **Skipping empty states** — "I'll add those later." You won't. Every list/table needs one from day 1.
2. **Inconsistent padding** — One page uses `p-3`, another `p-6`, another `p-4`. Use `p-4 md:p-6` everywhere.
3. **Missing loading skeletons** — White flash or spinner instead of layout-matching skeleton. Create `loading.tsx` for every page.
4. **Forgetting data propagation** — User creates an item, navigates to dashboard, dashboard still shows old count. Invalidate ALL affected queries.
5. **Desktop-first layout** — Looks great on desktop, broken on mobile. Start with 375px, add breakpoints up.
6. **No error handling** — API fails → blank page. Every fetch needs an error state with retry.
7. **Onboarding as afterthought** — First-run experience should be designed first, not bolted on after launch.
8. **Hover-only interactions** — Tooltips, dropdowns, actions only visible on hover. Mobile users can't hover.
9. **Building without a plan** — Jumping straight to code without confirming models, pages, and skills leads to rework. Always present the plan first.
10. **Skipping verification checkpoints** — "It probably works" is not verification. Run the build, check the states, test the flow.
