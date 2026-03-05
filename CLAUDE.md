# Vibekit — AI Instructions

## Quality Philosophy

Vibekit exists to produce **production-quality apps, not demos**. The #1 criticism of AI-generated apps is that they're "slop" — they work on the happy path but break everywhere else. Vibekit prevents this structurally:

1. **Constrained output** — 30 curated components, fixed spacing scale, 4 animation presets. You can't produce inconsistent UI because the design system won't allow it.
2. **Beyond the happy path** — Empty states, error states, loading states are mandatory from day one. A page missing these is considered incomplete, not "almost done."
3. **Real-world stress testing** — Every page must handle: 0 items, 1 item, 100+ items, very long text, missing optional fields, slow networks, API failures. Not just the golden demo.
4. **You own the code** — Every line is readable, modifiable, deployable standard Next.js/TypeScript. No black box, no vendor lock-in, no sandbox.
5. **Security by default** — Auth, CSRF, rate limiting, input validation, env validation are baked in, not bolted on.
6. **Grows over time** — Living documentation, feature branches, roadmaps, PR workflow. Not a one-shot toy that rots.

The measure of quality is not "does the demo look good?" — it's "would you trust this app with real data, real users, and real money?"

## Session Start

Every time you open this project, do this first:

1. **Read `APP.md`** in the project root — it describes what this app is, its models, routes, pages, and current state. If `APP.md` doesn't exist, this is a fresh vibekit project — follow the First Run flow below.
2. **Read `ROADMAP.md`** if it exists — it shows planned features and what's in progress.
3. **Read `CHANGELOG.md`** if it exists — it shows what was recently built.
4. Now you have full context. Help the user with whatever they need.

## First Run

If this is a fresh clone with no `APP.md`:
1. Read `.claude/docs/guided-setup.md`
2. Follow the interview flow to understand what they want to build
3. Install required skills via the skills engine
4. Generate the app following all conventions in this file
5. **Verify every generated page** against the Page Completeness Checklist below
6. **Generate `APP.md`** — see "Living Documentation" section
7. **Generate `ROADMAP.md`** — see "Roadmap" section
8. **Initialize git** and make the first commit

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm db:push      # Push Prisma schema to database
pnpm db:seed      # Seed database with demo data
pnpm db:studio    # Open Prisma Studio
```

Install a skill: `npx tsx skills-engine/index.ts apply <skill-name>`
Remove a skill: `npx tsx skills-engine/index.ts remove <skill-name>`
List skills: `npx tsx skills-engine/index.ts list`

## Git & GitHub Workflow

### Branching
- `main` — production-ready code. Never commit broken builds here.
- Feature branches: `feat/feature-name` — one branch per feature/roadmap item.
- Bug fixes: `fix/description` — one branch per bug fix.

### Commit Convention
Use conventional commits:
```
feat: add project archiving
fix: dashboard stat count not updating after delete
refactor: extract shared filter logic into useFilters hook
docs: update APP.md with new billing models
chore: upgrade dependencies
```

### Development Flow
1. Create a feature branch: `git checkout -b feat/feature-name`
2. Build the feature following all vibekit conventions
3. Run `pnpm build` to verify
4. Commit with a conventional commit message
5. Push and create a PR: `gh pr create`
6. After merge, update `APP.md`, `ROADMAP.md`, and `CHANGELOG.md`

### PR Descriptions
Always include:
- What was added/changed
- Which pages/routes are affected
- Whether the database schema changed (requires migration)
- Screenshot or description of the UI change

## Living Documentation

### APP.md (MANDATORY — generate after first build, update after every feature)

`APP.md` is the single source of truth about what this app IS. Claude reads it at the start of every session. Keep it accurate.

Structure:
```markdown
# [App Name]

[One paragraph: what this app does, who it's for]

## Tech Stack
[What's installed: Next.js, skills, deployment]

## Data Models
[Every Prisma model with key fields — keep in sync with schema.prisma]

## Routes & Pages
[Every route, what it shows, key components it uses]

## API (tRPC Routers)
[Every router and its procedures — inputs, outputs, what they do]

## Installed Skills
[Which skills are installed and how they're configured]

## Environment Variables
[All required env vars with descriptions — never include values]

## Key Decisions
[Architectural choices and why they were made]
```

### ROADMAP.md (generate after first build, maintain ongoing)

The roadmap tracks what's planned, what's in progress, and what's done.

Structure:
```markdown
# Roadmap

## Current Sprint
- [ ] Feature name — brief description
- [x] Completed feature — brief description

## Up Next
- [ ] Feature name — brief description
- [ ] Feature name — brief description

## Future Ideas
- Feature name — brief description

## Completed
- [x] Feature — when completed, brief summary
```

When working on a roadmap item:
1. Move it to "Current Sprint" and check the box when done
2. Create a feature branch for it
3. After completing, update APP.md and CHANGELOG.md
4. Move to "Completed" with date

### CHANGELOG.md (append after every feature)

```markdown
# Changelog

## [Unreleased]

### Added
- New feature description

### Changed
- What was modified

### Fixed
- Bug that was fixed

## [YYYY-MM-DD] - Brief release name

### Added
- ...
```

### When to Update Docs

| Event | Update |
|-------|--------|
| Feature added | APP.md (routes, models, API) + CHANGELOG.md + ROADMAP.md |
| Model changed | APP.md (Data Models section) |
| Route added/removed | APP.md (Routes & Pages section) |
| Skill installed | APP.md (Installed Skills, Env Vars) |
| Bug fixed | CHANGELOG.md |
| Roadmap item completed | ROADMAP.md + CHANGELOG.md |
| Env var added | APP.md (Environment Variables) |
| Architectural decision | APP.md (Key Decisions) |

## Architecture

### Route Groups
- `(marketing)` — Public pages with nav + footer, no sidebar
- `(auth)` — Centered card layout for sign-in/sign-up
- `(app)` — Authenticated pages with sidebar + topbar

### Component Hierarchy
- `src/components/ui/` — shadcn/ui primitives (DO NOT modify)
- `src/components/layout/` — Structural shells (sidebar, topbar, nav)
- `src/components/patterns/` — Composed business components (EmptyState, data-table, stat-card, etc.)
- `src/components/shared/` — Cross-cutting (icons, logo, providers)

### Data Flow
1. Prisma models in `prisma/schema.prisma`
2. tRPC routers in `src/trpc/routers/`
3. Server components call `caller` from `src/trpc/server.tsx`
4. Client components use `useTRPC` from `src/trpc/client.tsx`

### Data Propagation (CRITICAL)
When a mutation changes server state, ALL affected views must be refreshed. Never assume only the current page uses the data. Pattern:
```typescript
// After a mutation, invalidate all queries that could show stale data
await utils.project.list.invalidate();
await utils.project.get.invalidate({ id });
await utils.task.list.invalidate();  // if tasks are affected too
```
If the mutation affects counts or stats shown elsewhere (dashboard, sidebar badges), invalidate those too. Think about what data appears on OTHER pages, not just the current one.

## File Conventions

- Pages: `src/app/(group)/route/page.tsx`
- Loading: `src/app/(group)/route/loading.tsx` (MANDATORY for every page)
- API routes: `src/app/api/route-name/route.ts`
- Components: PascalCase files, named exports
- Hooks: `src/hooks/use-*.ts`
- Utilities: `src/lib/*.ts`

## Page Completeness Checklist (MANDATORY)

Every page MUST have ALL of these before it's considered done. Never ship a page without them — retrofitting is 3x harder than building them in.

1. **`loading.tsx`** — Skeleton that matches the page layout exactly (same grid, same card sizes, same spacing)
2. **Empty state** — When there's no data. Use `EmptyState` component with: icon, title, description, and action button
3. **Error state** — When data loading fails. Retry button + helpful message
4. **Consistent padding** — `p-4 md:p-6` for page content. No exceptions.
5. **Mobile layout** — Verify at 375px width. No horizontal overflow. Touch targets ≥ 44px
6. **Page header** — Use `PageHeader` component with title + optional description + action buttons
7. **Real-world data resilience** — The page must handle ALL of these gracefully:
   - 0 items (empty state)
   - 1 item (no layout weirdness with single-item grids/lists)
   - 100+ items (pagination or virtualization, no performance collapse)
   - Very long text in names/descriptions (truncation with `truncate` or `line-clamp-N`, no layout breaking)
   - Missing optional fields (no "undefined" or blank gaps in the UI)
   - Rapid repeated actions (debounced mutations, disabled buttons during async ops)

### Page Content Template (Use This Structure)

```tsx
// Server component page
export default async function MyPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <PageHeader
        title="Page Title"
        description="What this page shows."
        actions={<Button>Primary Action</Button>}
      />
      {/* Content with consistent spacing */}
      <div className="space-y-6">
        {/* Sections here */}
      </div>
    </div>
  );
}
```

```tsx
// Client component with data fetching
"use client";
export function DataList() {
  const { data, isLoading, error } = useQuery(trpc.entity.list.queryOptions());

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (isLoading) return <ListSkeleton />;
  if (!data?.length) return (
    <EmptyState
      icon={Package}
      title="No items yet"
      description="Create your first item to get started."
      action={{ label: "Create Item", onClick: handleCreate }}
    />
  );

  return <div className="space-y-4">{/* render data */}</div>;
}
```

## Spacing Scale (MANDATORY — No Ad-Hoc Values)

Use these spacing values. Do NOT invent new ones.

| Context | Value | Class |
|---------|-------|-------|
| Page content padding | 16px / 24px | `p-4 md:p-6` |
| Between page sections | 24px | `space-y-6` |
| Card internal padding | shadcn default | `CardContent` |
| Form field gaps | 16px | `space-y-4` |
| Grid gaps | 16px or 24px | `gap-4` or `gap-6` |
| Inline element gaps | 8px | `gap-2` |
| Tight element gaps | 4px | `gap-1` |
| Between label and input | 8px | `space-y-2` |

Page padding is ALWAYS `p-4 md:p-6`. Every page. No exceptions. This single rule prevents the most common layout inconsistency.

## Design Rules (MANDATORY)

1. **Dark-first**: Always design for dark mode first. Use semantic color tokens (`bg-card`, `text-muted-foreground`), never raw colors.
2. **Mobile-first**: Start with mobile layout, add responsive breakpoints (`sm`, `md`, `lg`). Touch targets ≥ 44px.
3. **Information-dense**: Default body text is `text-sm` (14px). Page titles: `text-2xl font-semibold tracking-tight`. Section titles: `text-lg font-medium`.
4. **Constrained animations**: Only use presets from `@/components/shared/motion.tsx` — fadeIn, slideUp, scaleIn, staggerChildren. No custom animations.
5. **Curated components only**: Only use the ~30 installed shadcn/ui components. Do not add new ones without explicit user request.
6. **Skeleton loading**: Every page MUST have a `loading.tsx` with layout-matching skeletons.
7. **Empty states**: Every list/table MUST have an `EmptyState` with icon, helpful message, and action button.
8. **Error states**: Every data-fetching component MUST handle errors gracefully with a retry option.
9. **No content shift**: Use fixed-height containers for dynamic content. Set aspect ratios for images. Truncate text with `truncate` (single line) or `line-clamp-N` (multi-line).
10. **Consistent density**: Don't mix spacious hero sections with cramped data tables on the same page. Match density throughout.

## Hard Constraints (DO NOT)

- DO NOT expose secrets to the client (no `NEXT_PUBLIC_` for API keys)
- DO NOT use raw SQL — always use Prisma
- DO NOT create client components unless they need interactivity
- DO NOT use `any` type — use proper TypeScript types
- DO NOT add shadcn/ui components not in the curated set
- DO NOT create custom animations beyond the 4 presets
- DO NOT skip Zod validation on tRPC inputs
- DO NOT use ad-hoc padding values — use `p-4 md:p-6` for page content, always
- DO NOT leave pages without loading, empty, and error states
- DO NOT ship a page without testing at 375px viewport width
- DO NOT assume mutations only affect the current page — invalidate all stale queries
- DO NOT let APP.md get out of date — update it with every feature change

## Interactive State Guidelines

Every interactive element MUST have:
- **Hover**: visible color change (`hover:bg-accent`, `hover:text-foreground`)
- **Focus**: visible ring for keyboard navigation (`focus-visible:ring-2 ring-ring`)
- **Disabled**: reduced opacity (`disabled:opacity-50 disabled:cursor-not-allowed`)
- **Loading**: Spinner icon + disabled state during async operations
- **Active/selected**: distinct visual state (different background, ring, or check icon)

## Writing Style

Write all user-facing text as if explaining to a friend. No jargon. No technical terms. Be warm, clear, and helpful.

- Error messages: "Something went wrong. Try again?" not "500 Internal Server Error"
- Loading states: "Getting your projects..." not "Loading..."
- Empty states: "No projects yet. Create your first one!" with a clear action button
- Confirmations: "Are you sure? This can't be undone." not "Confirm deletion?"
- Success feedback: Toast notification confirming the action ("Project created!")

## Docs

See `.claude/docs/` for detailed guides:
- `guided-setup.md` — The interview flow for building a new app
- `adding-a-page.md` — How to add pages (with mandatory checklist)
- `adding-a-model.md` — How to add Prisma models and tRPC routers
- `adding-an-api-route.md` — How to create tRPC procedures
- `adding-a-skill.md` — How to create custom skills
- `design-system.md` — Full design token reference and spacing scale
- `component-catalog.md` — Every component with usage examples
- `realtime-patterns.md` — SSE subscriptions, optimistic updates
- `security-checklist.md` — Security rules to follow
- `performance-guide.md` — Server vs client components, optimization

## Slash Commands

Available via `/command-name`:
- `/review-page [path]` — Comprehensive page review (spacing, states, responsiveness, data flow)
- `/quality-gate` — Pre-ship audit: build, states, data flow, security, docs (run before deploying)
- `/native-feel [path]` — Audit for Linear/Vercel-quality polish
- `/brand-check [path]` — Design system compliance audit
- `/perf-check [path]` — Performance audit
- `/add-page [name]` — Create a new page with all required files
- `/add-feature [description]` — Plan and build a new feature from the roadmap
- `/update-docs` — Update APP.md, ROADMAP.md, and CHANGELOG.md after changes
- `/roadmap` — View, plan, and manage the feature roadmap
