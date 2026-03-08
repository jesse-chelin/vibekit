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

For each Prisma model, create a tRPC router with these **5 standard procedures**:

| Procedure | Type | Returns | Purpose |
|-----------|------|---------|---------|
| `list` | query | `{ items, total, page, pageSize, totalPages }` | Paginated list with optional search/filters |
| `byId` | query | Single record | Detail view, throws error if not found |
| `create` | mutation | Created record | Zod-validated input, scoped to userId |
| `update` | mutation | Updated record | `{ id, ...optionalFields }` pattern |
| `delete` | mutation | Deleted record | Scoped to userId (prevents cross-user deletion) |

**Requirements:**
- All procedures use `protectedProcedure` (not `publicProcedure`)
- All scope queries to `ctx.session.user.id`
- `list` MUST return `{ items, total, page, pageSize, totalPages }` — never a raw array. Page templates access `data.items`, and a raw array will crash every list page.
- Import Zod from `"zod/v4"` (not `"zod"`)
- See `.claude/docs/adding-an-api-route.md` for the complete router template with worked example

**Register each router** in `src/trpc/router.ts`:
```typescript
import { entityRouter } from "@/trpc/routers/entity";
// Add to appRouter: entity: entityRouter,
```

**Update dashboard stats** in `src/trpc/routers/user.ts`:
Add a count for each new entity type to the `stats` procedure. Every dashboard stat card needs a count source from this procedure.

**Verify**: No TypeScript errors in the router files. Run `npx tsc --noEmit` on the router directory if unsure.

#### 7c-checkpoint. Commit: data models and API
```bash
git add -A && git commit -m "feat: add data models and API"
```
This creates a save point. If the page generation step fails, you won't lose the schema and router work.

#### 7d. Generate Pages

**Parallel page generation**: Identify pages that don't depend on each other (e.g., a Chores page and a Bills page are independent — they have separate routers and models). Use the Task tool to launch parallel agents for independent pages. Each agent should create `page.tsx` + `loading.tsx` + client component for one page. Pages that share data or components should be built sequentially. This can cut build time by 40-60%.

FOR EACH PAGE, create ALL of these before moving to the next page:

1. `page.tsx` — Using PageHeader + `space-y-6` sections (layout provides `p-4 md:p-6` padding)
2. `loading.tsx` — Skeleton matching the exact layout (same grid, same card sizes)
3. **Empty state** — EmptyState component with icon, title, description, and action button
4. **Error handling** — Every data-fetching component handles errors with retry
5. **Mobile layout** — Verified at 375px width, no overflow
6. **Real data** — Pages MUST fetch from tRPC, not hardcode demo data. Use the **Page Type Wiring Guide** below:

   | Page Type | Server `page.tsx` | Client `_components/` | Data Access |
   |-----------|-------------------|----------------------|-------------|
   | Dashboard | `caller.user.stats()` + `caller.entity.list({ pageSize: 5 })` | N/A (server component) | Stats object + `recentItems.items` |
   | List | `void trpc.entity.list.prefetch({})` → `<HydrateClient>` | `entity-list.tsx`: `trpc.entity.list.useQuery({})` | `data?.items.length`, `data.items` |
   | Detail | `caller.entity.byId({ id })` + try/catch → `notFound()` | Optional: `delete-entity-button.tsx` | Single record directly |
   | Create | N/A (client `"use client"` page) | `useForm({ resolver: zodResolver(schema), defaultValues })` + `trpc.entity.create.useMutation()` | Form state |
   | Edit | N/A (client `"use client"` page) | `trpc.entity.byId.useQuery({ id })` + `useForm({ values })` + `trpc.entity.update.useMutation()` | Query → form values |

   **Wiring rules (apply to every page):**
   - **Schema Sync:** Form Zod schema mirrors the tRPC input schema but WITHOUT `.default()`. Use `defaultValues` on `useForm()` instead.
   - **Invalidation:** Every create/update/delete mutation must invalidate `entity.list` AND `user.stats` (dashboard counts).
   - **List Data Contract:** Client components access `data?.items.length` and `data.items` — never `data?.length` or `data` directly. The list procedure returns `{ items, total, page, pageSize, totalPages }`.
   - **Client Components:** Interactive list components go in `_components/entity-list.tsx` adjacent to `page.tsx`.
   - **Dynamic Export:** All pages using `caller` or `trpc.prefetch()` require `export const dynamic = "force-dynamic"`.
   - **Select Fields:** shadcn Select doesn't work with `form.register()` — use `form.watch("field")` + `form.setValue("field", value)`.

   See `.claude/docs/adding-a-page.md` for complete code patterns per page type.

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

#### 7h. Generate Documentation Vault

Create the `docs/` Obsidian vault with real content from the interview and build. This is the project's structured knowledge base — PRDs, decision records, engineering docs, and feature specs.

##### 7h-1. Create `.obsidian/` config

Create these files for a ready-to-open Obsidian vault:

**`docs/.obsidian/app.json`:**
```json
{
  "showLineCount": true,
  "strictLineBreaks": true,
  "showFrontmatter": false,
  "livePreview": true,
  "defaultViewMode": "preview",
  "readableLineLength": true,
  "showInlineTitle": true,
  "tabSize": 2,
  "attachmentFolderPath": "assets",
  "newFileLocation": "folder",
  "newFileFolderPath": "features"
}
```

**`docs/.obsidian/appearance.json`:**
```json
{
  "baseFontSize": 16,
  "interfaceFontSize": 14,
  "cssTheme": "",
  "theme": "obsidian"
}
```

**`docs/.obsidian/core-plugins.json`:**
```json
{
  "file-explorer": true,
  "global-search": true,
  "graph-view": true,
  "backlink": true,
  "outgoing-link": true,
  "tag-pane": true,
  "page-preview": true,
  "command-palette": true,
  "editor-status": true,
  "starred": true,
  "outline": true,
  "templates": false,
  "daily-notes": false,
  "word-count": true,
  "file-recovery": true,
  "workspaces": false,
  "note-composer": false,
  "audio-recorder": false,
  "canvas": false,
  "publish": false,
  "sync": false,
  "slides": false,
  "switcher": true,
  "properties": true
}
```

**`docs/.obsidian/graph.json`:**
```json
{
  "collapse-filter": false,
  "search": "",
  "showTags": true,
  "showAttachments": false,
  "hideUnresolved": false,
  "showOrphans": true,
  "collapse-color-groups": false,
  "colorGroups": [
    { "query": "path:product", "color": { "a": 1, "rgb": 5765887 } },
    { "query": "path:decisions", "color": { "a": 1, "rgb": 16744448 } },
    { "query": "path:engineering", "color": { "a": 1, "rgb": 65408 } },
    { "query": "path:features", "color": { "a": 1, "rgb": 16711935 } }
  ],
  "collapse-display": false,
  "lineSizeMultiplier": 1,
  "nodeSizeMultiplier": 1
}
```

Do NOT create `workspace.json` — Obsidian generates it on first open.

##### 7h-2. Copy template files

Copy the two templates that ship with vibekit:
- `docs/decisions/_template.md` — already exists
- `docs/features/_template.md` — already exists

##### 7h-3. Generate vault documents

Read `.vibekit/intent.json` for interview data. Read `prisma/schema.prisma` for the data model. Read `src/trpc/routers/*.ts` for the API surface. Generate these documents with REAL content — not templates, not placeholders.

Every document must have YAML frontmatter with `type`, `status`, and `created` fields.
Use `[[wiki-links]]` for cross-references between docs (shortest unambiguous name).

**`docs/_index.md`** — Vault home and navigation map:
- App name and one-line description (from `intent.json.description`)
- Quick Links organized by category (wiki-links to every doc)
- "For AI Agents" section: "Start here. Read `[[prd]]` for product context. Read `[[data-model]]` and `[[api-reference]]` for technical context. Check `[[roadmap]]` for what's planned."
- Vault conventions: frontmatter schema, how to add new docs

**`docs/product/prd.md`** — Product Requirements Document:
- Overview (expand `intent.json.description` into a paragraph)
- Problem Statement (`intent.json.problem`)
- Target User (`intent.json.targetUser`, link to `[[target-user]]`)
- Unique Value Proposition (`intent.json.uniqueAngle`)
- MVP Features (`intent.json.mvpFeatures`) — for each: name, one-paragraph description, acceptance criteria. Link to `[[feature-name]]` docs
- Deferred Features (`intent.json.v2Features`) — name, brief description, why deferred
- Non-Goals — what this app explicitly does NOT do
- Constraints — tech constraints (SQLite dev, skills limitations)

**`docs/product/target-user.md`** — User Persona:
- Who they are (expand `intent.json.targetUser`)
- What frustrates them (from `intent.json.problem`)
- What they currently use (`intent.json.competitors`)
- What success looks like
- 2-3 day-in-the-life scenarios

**`docs/product/competitive-landscape.md`** — Competitor Analysis:
- Market overview
- Competitors table (`intent.json.competitors`): name, strengths, weaknesses, pricing
- Differentiation (`intent.json.uniqueAngle`)
- Opportunities — gaps competitors don't fill

**`docs/product/user-flows.md`** — Critical User Journeys:
- Critical Path: `Sign up → Onboarding → [First key action] → [Value delivered]`
- Per-feature flows: trigger, steps, outcome (link to `[[feature-name]]`)

**`docs/decisions/001-tech-stack.md`** — Tech Stack Decision (ADR):
- Context: building a `category` app called `appName`
- Decision: vibekit stack (Next.js, Prisma, tRPC, Auth.js, Tailwind, shadcn/ui)
- Skills installed from `intent.json.skills` with rationale
- Consequences: positives and trade-offs

**`docs/decisions/002-data-model.md`** — Data Model Decision (ADR):
- Context: what entities the app needs (from interview)
- Decision: the chosen schema with models and relationships (read `prisma/schema.prisma`)
- Alternatives considered (if discussed during interview)
- Consequences: trade-offs of the schema design

**`docs/decisions/003-mvp-scope.md`** — MVP Scope Decision (ADR):
- Context: user described N features, scoped to MVP
- Decision: what's in v1 (`mvpFeatures`) vs deferred (`v2Features`)
- For each deferred feature, why it was deferred
- Criteria for promotion: when should a v2 feature get built?

**`docs/engineering/architecture.md`** — Architecture Reference:
- Stack overview with links to `[[001-tech-stack]]`
- Directory structure
- Data flow: browser → Next.js → tRPC → Prisma → SQLite
- Authentication flow
- Route groups: `(marketing)`, `(auth)`, `(app)` with what each contains for THIS app
- Skills system overview

**`docs/engineering/data-model.md`** — Data Model Reference:
- Entity relationship summary (ASCII or mermaid diagram)
- For each Prisma model (read `prisma/schema.prisma`):
  - Name, purpose
  - Fields table: name, type, constraints, description
  - Relationships
- Data scoping strategy (userId, etc.)

**`docs/engineering/api-reference.md`** — API Reference:
- Overview: tRPC-based, all `protectedProcedure`
- For each router (read `src/trpc/routers/*.ts`):
  - Router name
  - Procedures table: name, type (query/mutation), input schema, return type, description
- Common patterns: pagination shape, error handling, auth context

**`docs/engineering/deployment.md`** — Deployment Reference:
- Prerequisites
- Environment variables (from `.env.example`, never include values)
- Deployment steps (if a deploy skill is installed, include its instructions)
- Database migration strategy

**`docs/features/{feature-name}.md`** — One per MVP feature:
- Frontmatter: `type: feature`, `status: shipped`, `feature`, `version: v1`, `related-models`, `related-routes`
- Overview
- User Story: "As a [targetUser], I want to [action] so that [benefit]"
- Data Model: which models, link to `[[data-model]]`
- Pages: routes and descriptions
- API: which tRPC procedures
- States: empty, loading, error descriptions
- Acceptance Criteria checklist
- Future Enhancements from `v2Features` if related

**`docs/roadmap.md`** — Feature Roadmap:
- Current Sprint (empty — app just launched)
- Up Next (3-5 features from `intent.json.v2Features`)
- Future Ideas (3-5 longer-term ideas based on app type)
- Completed: "Initial build — [today's date]" with summary

**`docs/changelog.md`** — Change History:
```markdown
# Changelog

## [Unreleased]

## [YYYY-MM-DD] - Initial Release

### Added
- [List every feature built in the initial setup]
```

##### 7h-4. Generate `APP.md`

Generate `APP.md` in the project root as a concise quick-reference. Follow the structure in CLAUDE.md's "Living Documentation" section:
- App name and one-paragraph description
- Tech Stack
- Data Models (every Prisma model with key fields — summary, not full detail)
- Routes & Pages
- API / tRPC Routers (every procedure)
- Installed Skills
- Environment Variables (from .env.example, never include values)
- Key Decisions

Add a **Documentation** section at the end:
```markdown
## Documentation

Full project documentation is in the `docs/` Obsidian vault. Open it in Obsidian or browse the markdown files directly.

- [Product Requirements](docs/product/prd.md)
- [Architecture](docs/engineering/architecture.md)
- [Data Model](docs/engineering/data-model.md)
- [API Reference](docs/engineering/api-reference.md)
- [Roadmap](docs/roadmap.md)
- [Changelog](docs/changelog.md)
```

##### 7h-5. Verify vault

- Every `.md` file in `docs/` has valid YAML frontmatter with `type`, `status`, `created`
- All `[[wiki-links]]` resolve to existing files in the vault
- `_index.md` links to every other document
- No TODO, FIXME, or placeholder text — every section has real content
- Feature docs reference correct models and routes from the actual build

#### 7i. Deployment (if applicable)
If a deploy skill was installed, walk through setup step by step. Each deployment skill's SKILL.md has its own guided setup.

#### 7j. Initialize git and make the first commit
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
- Check `docs/roadmap.md` for planned features
- Use `/add-feature` to build the next feature
- Use `/roadmap` to manage your feature backlog
- Open `docs/` in Obsidian for full project documentation

Everything is documented in APP.md (quick reference) and the docs/ vault (deep reference). I'll keep both updated as we build.
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
