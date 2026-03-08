---
description: Pre-ship quality gate — comprehensive audit before deploying or merging
---

Run a full quality gate audit on the app. This is the final check before shipping — it catches slop, missing states, broken edge cases, and production risks.

The question this answers: **"Would I trust this app with real data, real users, and real money?"**

## Phase 1: Build Verification

```bash
pnpm build
```

If the build fails, stop here. Fix it first.

## Phase 2: Page-by-Page Audit

For EVERY page in `src/app/`:

### 2a. File Completeness
- [ ] `page.tsx` exists
- [ ] `loading.tsx` exists with layout-matching skeleton
- [ ] Page uses `p-4 md:p-6` padding
- [ ] Page uses `PageHeader` component

### 2b. State Coverage (the anti-slop check)
For every data-displaying component on the page:
- [ ] **Empty state**: Shows EmptyState with icon, title, description, action button
- [ ] **Loading state**: Shows skeleton that matches the real layout
- [ ] **Error state**: Shows error message with retry button
- [ ] **Normal state**: Data renders correctly
- [ ] **Edge case data**: Handles long text (truncation), missing optional fields (no "undefined"), special characters (no XSS)

### 2c. Interaction Quality
- [ ] Every button has hover + focus-visible states
- [ ] Async buttons show spinner + disabled during operation
- [ ] Destructive actions show confirmation dialog
- [ ] Mutations show toast feedback
- [ ] Rapid clicks don't cause duplicate mutations

### 2d. Mobile
- [ ] No horizontal overflow at 375px
- [ ] Touch targets ≥ 44px
- [ ] Grids collapse appropriately
- [ ] Text truncates instead of breaking layout

## Phase 3: Data Flow Audit

For EVERY mutation (create, update, delete) in `src/trpc/routers/`:

- [ ] All affected queries are invalidated after the mutation
- [ ] Dashboard stats/counts are refreshed if they show related data
- [ ] Sidebar badges/counts are refreshed if applicable
- [ ] List views that show the entity are refreshed
- [ ] Detail views of the entity are refreshed

**Test mentally**: "If I create/delete this entity, where else in the app would the user see stale data?"

## Phase 4: Security Check

- [ ] No `NEXT_PUBLIC_` env vars containing secrets
- [ ] All tRPC procedures that need auth use `protectedProcedure`
- [ ] All tRPC inputs have Zod validation
- [ ] No raw SQL (Prisma only)
- [ ] File uploads (if any) validate type and size server-side
- [ ] Rate limiting is applied to auth and sensitive routes
- [ ] `.env.local` is in `.gitignore`

## Phase 5: Documentation Check

- [ ] `APP.md` exists and accurately reflects the current app
- [ ] `APP.md` data models match `prisma/schema.prisma`
- [ ] `APP.md` routes match `src/app/` directory structure
- [ ] `APP.md` API procedures match `src/trpc/routers/`
- [ ] `docs/roadmap.md` exists with current sprint status
- [ ] `docs/changelog.md` exists with recent changes
- [ ] `docs/_index.md` exists and links to all vault docs
- [ ] `docs/engineering/data-model.md` matches `prisma/schema.prisma`
- [ ] `docs/engineering/api-reference.md` matches `src/trpc/routers/`

## Phase 6: Performance Sanity

- [ ] Server Components used by default (no unnecessary `"use client"`)
- [ ] Images use `next/image` with `sizes` prop
- [ ] No client-side data fetching that could be server-side
- [ ] Lists with potential 50+ items have pagination

## Output Format

### Summary

```
Quality Gate: [PASS / FAIL]
Pages audited: N
Issues found: N (N critical, N major, N minor)
```

### Critical Issues (must fix before shipping)
- [issue]: [file:line] — [what's wrong and how to fix]

### Major Issues (should fix before shipping)
- [issue]: [file:line] — [what's wrong and how to fix]

### Minor Issues (fix when convenient)
- [issue]: [file:line] — [what's wrong and how to fix]

### Passing Checks
- [list of everything that's good]

$ARGUMENTS
