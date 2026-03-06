# Vibekit Strategic Roadmap

**Date:** 2026-03-07
**Purpose:** Transform vibekit from a UI template into a product-building platform that helps makers go from idea to validated, production-ready app.

---

## The Problem

After building HomeBase and analyzing competitors (Lovable at $6.6B, v0, Bolt, Replit), three fundamental issues emerged:

**1. Pages are 30% complete.** The template pages look production-ready but are disconnected from the API layer. Projects page shows hardcoded data. Forms don't submit. Dashboard stats are fake numbers. The tRPC routers work, the Prisma schema works, but zero pages actually call them. The gap between "template" and "working product" is 4+ hours of manual wiring per page.

**2. No idea validation.** The interview asks "what do you want to build?" and immediately starts building. No questions about who the user is, what alternatives exist, whether demand is proven, or what the MVP should be. Two people building competing apps would get identical foundations.

**3. No challenge or pushback.** Claude accepts whatever the user says and builds it. A real product advisor would ask: "Do you really need 7 features in v1?" "Have you talked to users?" "Your competitor already does X — what's different?" "Skip the landing page — build the core experience first."

---

## Competitive Context

| Tool | Strength | Weakness | Vibekit's Angle |
|------|----------|----------|-----------------|
| Lovable ($6.6B) | Fast MVP, enterprise | Debug loops burn credits, slop quality | Quality > speed. No slop. |
| v0 (Vercel) | UI component excellence | UI-only, not full-stack | Full-stack, production-ready |
| Bolt (StackBlitz) | Fastest iteration (diffs) | Browser-only, no local dev | You own the code, local-first |
| Replit Agent | Multi-agent verification | Platform lock-in | Eject anytime, standard Next.js |
| Base44 (Wix, $80M acq) | Zero-setup full-stack, fastest to deploy | Proprietary SDK lock-in, AI breaks on complex apps, credits burn on failures (Trustpilot 2.2/5) | Full ownership, local-first, quality doesn't degrade at feature #11 |

**Universal problem none solve well:** The build-to-production gap. AI generates 80% of an app, then users spend 3x longer debugging the last 20%. Vibekit's structural quality constraints (mandatory states, spacing rules, page completeness) are already the answer — they just need to go deeper.

**Key insight from Base44's trajectory:** Zero-setup full-stack (built-in DB + auth + hosting) is the feature users want most — Base44 hit $100M ARR on this alone. But their 2.2/5 Trustpilot rating proves speed without quality is a trap: users love the first 10 minutes and hate the next 10 hours debugging. Vibekit already has the full stack (Prisma + tRPC + Auth.js) with zero external setup. The moat is that the 11th feature works as well as the 1st.

---

## Phase 1: Fix the Foundation (Critical)

*Make what exists actually work. Close the "template → product" gap.*

### 1.1 Wire Template Pages to the API

**The biggest single improvement.** Every template page should be a working example of the vibekit data pattern, not hardcoded demos.

- **Dashboard:** Fetch real stats from Prisma via tRPC server caller (project count, task count, completion rate). Show actual seeded data.
- **Projects list:** Replace hardcoded array with `useSuspenseQuery(trpc.project.list.queryOptions())`. Add EmptyState when 0 projects. Add error handling.
- **Create/Edit forms:** Wire `react-hook-form` + Zod client validation + tRPC mutations + toast on success/error + query invalidation.
- **Project detail:** Fetch via `trpc.project.byId`. Show loading skeleton. Handle 404.
- **Settings:** Wire preference toggles to the database.

**Why:** Right now, the user runs `/setup`, Claude generates pages, and those pages look identical to the template — hardcoded. The generated app should be wired from day one, using the template as the pattern to copy.

### 1.2 Generate Wired Pages During Build

Update the `/setup` build step (guided-setup.md Step 7d) so every generated page includes:

```tsx
// This pattern should be in EVERY generated list page
"use client";
export function EntityList() {
  const [data] = trpc.entity.list.useSuspenseQuery();
  // query options handled by Suspense boundary (loading.tsx)

  if (!data.length) return (
    <EmptyState icon={Icon} title="No items yet"
      description="Create your first one."
      action={{ label: "Create", onClick: ... }} />
  );

  return <DataTable columns={columns} data={data} />;
}
```

Add this as a **concrete code pattern** in the guided-setup.md and CLAUDE.md, not just prose instructions.

### 1.3 Form Integration Pattern

Create a reusable form pattern that Claude copies for every create/edit page:

- `react-hook-form` with `zodResolver` and the same Zod schema used on the server
- `useMutation` with loading state, error handling, toast notifications
- Query invalidation after success
- Navigation after save

Document this as a concrete template in `.claude/docs/adding-a-page.md`.

---

## Phase 2: Smarter Interview — Challenge the Idea

*Transform the interview from "what do you want?" to "let's figure out what you should build."*

**Lesson from Base44:** Their "Discuss" mode (ask the AI questions without triggering code changes) is their most-loved feature. The key insight: **separate the thinking conversation from the building conversation**. The interview phase should feel like a strategic discussion, not a code generation session. Keep it token-efficient — plan cheap, generate once, generate right.

### 2.1 Idea Validation Phase (New)

Before building anything, ask questions that a good product advisor would:

**Who is this for?**
- "Describe your ideal user. Who are they, what's their day like, what frustrates them?"
- "Have you talked to any of these people? What did they say?"
- "How many people have this problem?"

**What exists already?**
- "What do people currently use to solve this?" (Research: web search for competing products)
- "Why would someone switch from [existing tool] to yours?"
- "What's your unique angle that competitors don't have?"

**What's the MVP?**
- "Of everything you described, what's the ONE thing that must work for a user to get value?"
- "If you could only build 3 features, which 3?"
- Challenge bloat: "You mentioned 8 features — for v1, I'd suggest starting with [these 3]. The others can come in v2 once you have users. Here's why..."

**Challenge assumptions:**
- "You said you need a landing page — do you? If this is for internal use or a small group, skip it and build the core experience. You can add marketing later."
- "You said you need payments — but do you need them in v1? Most successful apps launch free, add payments after validating demand."
- "Charts/analytics is a nice-to-have. Unless your app IS analytics, delay this until v2."

### 2.2 Structured Intent File + Build Plan Approval

Expand `.vibekit/intent.json` to capture validation context:

```json
{
  "appName": "HomeBase",
  "category": "saas-productivity",
  "description": "Shared household management — chores, bills, budgets",
  "targetUser": "Households with 2+ adults sharing responsibilities",
  "problem": "No single app for chores, bills, and budgets together",
  "competitors": ["Splitwise (bills only)", "Tody (chores only)", "YNAB (budgets only)"],
  "uniqueAngle": "All-in-one for households, not just one category",
  "mvpFeatures": ["chores", "bills", "household-members"],
  "v2Features": ["budgets", "expenses", "notifications", "charts"],
  "needsLandingPage": false,
  "needsPayments": false,
  "skills": ["email"],
  "interviewComplete": true
}
```

**Build Plan Approval** — After the interview, before any code generation, present the full build plan to the user for approval:

> "Here's what I'm going to build:
> - **3 models**: Household, Chore, Bill (+ User from auth)
> - **3 routers**: household, chore, bill (5 procedures each)
> - **6 pages**: Dashboard, Chores list, Chore detail, Bills list, Bill detail, Settings
> - **1 skill**: email
> - **No landing page** (internal tool — `/` redirects to `/sign-in`)
> - **Estimated: ~25 min build time**
>
> Approve this plan, or tell me what to change."

This prevents the Base44 anti-pattern where users burn credits/tokens on generation they didn't want. Plan cheap, generate once.

### 2.3 Market Research During Interview

When the user describes their app, Claude should:

1. **Search for competitors**: "Let me see what's out there..." → web search for "household management app", "shared chores app", etc.
2. **Present findings**: "I found 3 apps in this space: Splitwise (bill splitting, 50M users), Tody (chore scheduling), OurHome (family tasks). Here's what they do well and where they fall short..."
3. **Identify gaps**: "None of these combine chores, bills, AND budgets. That's your angle."
4. **Inform feature selection**: "Splitwise already nails bill splitting. For your app to stand out, the chore management needs to be excellent — that's where competitors are weakest."

### 2.4 Scope Gating

Introduce hard limits based on complexity:

- **V1 builds max 5-7 pages.** More than that means scope creep. Challenge: "You listed 12 pages. Let's cut to the 6 that matter most for launch."
- **Max 3 skills in v1.** Each skill adds configuration overhead. "You selected 5 skills. Let's start with the 3 essential ones and add the others after launch."
- **Features require justification.** Instead of "Do you want charts?", ask "What decision would charts help your users make? If you can't answer that, skip charts for now."

---

## Phase 3: Dynamic Generation

*Make the generated output specific to the app, not generic template text.*

### 3.1 Dynamic Landing Page

Instead of a generic template with `{/* Replace: */}` comments, generate landing page content from the interview:

- **Hero headline**: Derived from the app description and unique angle
- **Features section**: Pulled from the actual selected features/skills
- **How it works**: Generated from the user's actual onboarding flow (sign up → [first key action] → [value delivered])
- **Not generated if not needed**: If `needsLandingPage: false` in intent.json, skip the marketing page entirely and redirect `/` to `/sign-in`

### 3.2 Dynamic Onboarding

Generate onboarding steps specific to the app type:

- **E-commerce**: "Add your first product" → "Set your prices" → "You're ready to sell"
- **Household app**: "Name your household" → "Invite members" → "Create your first chore"
- **SaaS tool**: "Create your workspace" → "Invite your team" → "Start your first [entity]"

The wizard steps should come from the data models and user flows established during the interview.

### 3.3 Dynamic Seed Data

Generate seed data that matches the actual app, not generic "Demo User" + "Website Redesign":

- A recipe app should seed with 5 real-sounding recipes
- A household app should seed with chores, bills, and members
- A project tracker should seed with projects and tasks

This makes the first `pnpm dev` experience feel like a real app, not a template.

---

## Phase 4: Ongoing Development Experience

*After the initial build, help makers keep building efficiently.*

### 4.1 `/add-feature` That Actually Researches

When the user says `/add-feature user profiles`, Claude should:

1. **Check the roadmap**: Is this already planned? What priority?
2. **Research patterns**: How do Notion/Linear/Slack handle user profiles? What fields matter?
3. **Present options**: "User profiles can be simple (name + avatar) or rich (bio, social links, activity history). For your app type, I recommend [option] because..."
4. **Estimate scope**: "This will add 1 model, 2 pages (view + edit), and 1 API router. Should take about [X] to build."
5. **Build with quality gates**: Wire everything up, not just create UI shells.

### 4.2 `/iterate` Command (New)

For users coming back after launching:

- "What feedback are you getting from users?"
- "What's your most-used feature? Least-used?"
- "What are users asking for that you don't have?"
- Help prioritize the next sprint based on user feedback, not guesses.

### 4.3 `/test-setup` Command (New)

Scaffold testing after the initial build:

- Vitest + React Testing Library for component tests
- Example tests for the data-fetching pattern (mock tRPC, test loading/empty/error states)
- Playwright for critical path e2e (sign up → first action → value)
- `pnpm test` and `pnpm test:e2e` scripts

### 4.4 User Flow Mapping

During the interview, map the critical user journey:

```
Sign up → Onboarding → [First key action] → [Value delivered] → [Retention loop]
```

For HomeBase: `Sign up → Create household → Add first chore → See chore assigned → Get reminder notification`

This flow should drive:
- Which pages are built first (critical path pages before nice-to-haves)
- What the onboarding wizard contains
- What the landing page "how it works" section says
- What gets tested in e2e tests

---

## Phase 5: Production Readiness

*Close the gap between "working app" and "app I'd trust with real users."*

### 5.1 Error Tracking Skill

New skill: `error-tracking` — integrates Sentry or similar:
- Auto-wraps error boundaries
- Reports server-side errors from tRPC
- Dashboard link in settings

### 5.2 Analytics Skill Enhancement

The `analytics` skill exists but should be wired during build:
- Auto-instrument: page views, sign-ups, key actions (create/update/delete)
- Suggest events based on the data models: "Track when a chore is completed, when a bill is paid"
- Simple dashboard showing MAU, feature adoption

### 5.3 Database Migrations

Move from `db:push` (dev-only) to `db:migrate` for production:
- Generate migration files during feature builds
- Include rollback strategy
- Document in the deployment skill guides

### 5.4 Performance Baseline

After initial build, run:
- Lighthouse audit (performance, accessibility, SEO scores)
- Bundle size check
- Server component vs client component audit
- Store baseline metrics for comparison after changes

---

## Phase 6: Intelligence Layer

*Make vibekit smarter over time.*

### 6.1 Build Patterns Database

Track what works across builds:
- Which app categories use which skills most effectively
- Common model patterns (User → Team → [Entity] is universal)
- Which features get built in v1 vs deferred to v2
- Common interview paths and their outcomes

This improves the interview defaults and auto-suggestions over time.

### 6.2 Quality Regression Prevention

Before any code change (via `/add-feature` or manual edits):
- Snapshot current state (what pages exist, what states they handle)
- After change, verify nothing regressed (loading.tsx still exists, EmptyState still used)
- This prevents the #1 complaint about AI builders: "it fixed one thing and broke two others"

### 6.3 Cost-Aware Building

Track token/time usage during builds:
- "This build used X tokens across Y agent calls"
- Identify inefficiencies: "Pages built sequentially that could have been parallel"
- Benchmark each build against previous ones

---

## Implementation Priority

| Priority | Item | Impact | Effort |
|----------|------|--------|--------|
| **P0** | ~~1.1 Wire template pages to API~~ | ~~Fixes the core credibility gap~~ | ✅ Done (2026-03-06) |
| **P0** | ~~1.2 Generate wired pages during build~~ | ~~Every `/setup` produces working apps~~ | ✅ Done (2026-03-06) |
| **P0** | ~~1.3 Form integration pattern~~ | ~~Forms actually work~~ | ✅ Done (2026-03-06) |
| **P1** | 2.1 Idea validation phase | Product quality, not just code quality | Medium |
| **P1** | 2.2 Structured intent + build plan approval | Captures validation context, presents plan before generating | Small |
| **P1** | 2.4 Scope gating | Prevents v1 bloat | Small |
| **P1** | 3.1 Dynamic landing page | No more copy-paste templates | Medium |
| **P1** | 3.3 Dynamic seed data | First experience feels real | Small |
| **P2** | 2.3 Market research during interview | Informed decisions | Medium |
| **P2** | 3.2 Dynamic onboarding | App-specific first run | Medium |
| **P2** | 4.1 Smarter /add-feature | Ongoing build quality | Medium |
| **P2** | 4.4 User flow mapping | Design-driven development | Medium |
| **P3** | 4.2 /iterate command | Post-launch guidance | Small |
| **P3** | 4.3 /test-setup command | Testing framework | Medium |
| **P3** | 5.1-5.4 Production readiness | Scale preparation | Large |
| **P4** | 6.1-6.3 Intelligence layer | Platform improvement | Large |

---

## Success Metrics

After implementing P0-P1:

| Metric | Current | Target |
|--------|---------|--------|
| Time from `/setup` to working app | ~41 min (with broken pages) | ~30 min (everything wired) |
| Pages that fetch real data after build | 0% | 100% |
| Forms that submit after build | 0% | 100% |
| Ideas challenged/refined during interview | 0 | Every build |
| Features deferred to v2 | 0 (build everything) | 30-50% (focused MVP) |
| Quality gate pass rate | ~75% (HomeBase) | 95%+ |
| Unused skills after build | 1+ (HomeBase had charts) | 0 |

---

## The Core Thesis

Every AI app builder races to generate code faster. Lovable, Bolt, v0, Base44 — they compete on speed. But speed to a broken app is worthless. Base44 proved this definitively: $100M ARR from zero-setup full-stack speed, but a 2.2/5 Trustpilot rating because the apps break when they get complex. Users love the first 10 minutes and hate the next 10 hours.

Vibekit's thesis: **The fastest path from idea to product isn't generating more code — it's generating the RIGHT code, for the RIGHT problem, with zero slop.**

That means:
1. **Challenge the idea** before building (validation > velocity)
2. **Build less, but better** (focused MVP > feature sprawl)
3. **Everything works** out of the box (wired data, not hardcoded demos)
4. **Quality is structural**, not aspirational (mandatory states, spacing rules, verification)
5. **You own the code** and can keep building forever (no platform lock-in, no credit burn)
6. **Plan cheap, generate once** — present the full build plan before writing code (no wasted tokens on unwanted generation)

The competition is building faster hammers. Vibekit should be the advisor that makes sure you're hitting the right nail.

---

## Completed

### 2026-03-06 — Phase 1: Wire Template Pages to API

**1.1 Wire template pages to API** — All template pages now fetch real data from tRPC:
- Dashboard: `user.stats` for stat cards, `project.list` for recent projects, with EmptyState
- Projects list: server prefetch + client hydration, DataTable with real data, delete with confirmation
- Project detail: `project.byId` with real tasks, status indicators, 404 handling
- Project create: react-hook-form + zodResolver + `project.create` mutation + toast + redirect
- Project edit: fetches project, pre-populates form, `project.update` mutation
- Settings/general: `user.me` query, `user.update` mutation for name changes
- All pages have loading.tsx skeletons matching actual layout

**1.3 Form integration pattern** — Documented in `.claude/docs/adding-a-page.md`:
- react-hook-form + zodResolver (without `.default()` to avoid type conflicts)
- tRPC mutation with `onSuccess`/`onError` handlers
- `void utils.entity.list.invalidate()` for data propagation
- Loading state on submit buttons with Loader2 spinner
- Select components use `watch()` + `setValue()` instead of `register()`

**1.2 Generate wired pages during build** — Build instructions now produce wired pages for any app:
- `adding-an-api-route.md`: Complete rewrite with 5-procedure router template (list/byId/create/update/delete), paginated return shape `{ items, total, page, pageSize, totalPages }`, router registration, user.stats update, Recipe worked example
- `guided-setup.md` Step 7c: Standard procedures table, router registration instruction, dashboard stats requirement
- `guided-setup.md` Step 7d: Page Type Wiring Guide table (dashboard/list/detail/create/edit), schema sync rule, invalidation rule, list data contract, `_components/` convention
- `CLAUDE.md`: Fixed `useTRPC` → `trpc`, added `user.stats` invalidation to mutation template, 3 new Hard Constraints (no hardcoded data, no raw arrays, force-dynamic required)
- `performance-guide.md`: Fixed stale `useTRPC` references

### 2026-03-06 — Design System Overhaul

- Rich dark mode with blue-tinted surfaces (layered depth model)
- Colored per-category icon containers on stat cards
- Solid-border EmptyState with primary-tinted icon
- Active sidebar with left border indicator + badge counts
- Landing page redesign: gradient hero, animated features, how-it-works, CTA
- Motion wrappers on dashboard sections
- Error boundary for (app) route group
- CSS hover-lift and press-down utilities
- Build process: mid-build git commits, parallel agents, post-build verification
