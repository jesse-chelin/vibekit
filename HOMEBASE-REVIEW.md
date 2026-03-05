# Vibekit Performance Review — HomeBase Build

**Date:** 2026-03-05
**App:** HomeBase (household management — chores, bills, budgets, expenses)
**Built by:** Claude Code via Vibekit `/setup` command
**Reviewed by:** Claude Opus 4.6

---

## Executive Summary

HomeBase is a solid first smoke test of Vibekit. A complete household management app with 7 feature domains, 13 data models, 7 tRPC routers, 15 pages, and full CRUD was built in **~41 minutes**. The app follows most Vibekit conventions but has notable gaps that reveal where the guardrails need tightening.

**Overall score: 75/100** — Good foundation, but wouldn't pass `/quality-gate` in its current state.

---

## 1. Build Speed & Efficiency

| Metric | Value |
|--------|-------|
| **Total build time** | ~41 minutes (16:06 → 16:47) |
| **Files created/modified** | 112 (29 new, 75 modified, 3 untracked, 9 deleted) |
| **Lines of code** | 9,453 across 121 .ts/.tsx files |
| **Prisma schema** | 256 lines, 13 models |
| **tRPC routers** | 7 routers with ~35 procedures |
| **Pages** | 15 routes (7 main app + 4 auth + 2 settings + onboarding + landing) |
| **Loading skeletons** | 8 (all main pages — missing settings subpages) |
| **Git commits** | 0 (all changes uncommitted — **missed Step 9 of /setup**) |

### Build Timeline

| Phase | Time | Files | What Happened |
|-------|------|-------|---------------|
| Setup (deps, env, DB) | 16:06–16:10 | 3 | pnpm install, .env, db:push |
| Core build | 16:10–16:20 | 34 | Schema, routers, pages, sidebar |
| Features & polish | 16:20–16:47 | 75 | Client components, filters, empty states, mobile nav |

### Speed Verdict

**41 minutes for a 7-domain app is fast.** But it could be faster:
- The build was sequential — one page at a time. No evidence of parallel agent usage.
- Time was spent modifying vibekit boilerplate pages (dashboard, settings) that could have been generated from scratch more efficiently.

### Efficiency Concerns

- **No parallel agents used.** The `/setup` command doesn't instruct Claude to spin up subagents for independent work (e.g., schema + seed data could be parallel with page generation).
- **No git commit was made.** The `/setup` Step 9 says to `git add -A && git commit` but this was skipped. This means if the session crashed, ALL work would be lost.
- **The `charts` skill was listed in intent.json but no charts appear in the app.** The skill was selected but never actually used — wasted install time.

---

## 2. App Quality Audit

### What's Good

| Area | Rating | Notes |
|------|--------|-------|
| **Data model design** | A | 13 well-structured models with proper relationships, unique constraints, cascading deletes |
| **API layer** | A | All 7 routers use Zod validation, protectedProcedure, household-scoped queries |
| **Empty states** | A | Every list page has EmptyState with icon, message, and action button |
| **Loading skeletons** | B+ | All main pages have loading.tsx — but settings subpages are missing |
| **Query invalidation** | A | Mutations properly invalidate related queries (bills → expenses → budget → dashboard) |
| **Mobile layout** | B+ | Responsive grids, mobile nav component, but not verified at 375px |
| **Authentication flow** | A- | Sign-up → onboarding → dashboard flow is clean. Invite code system works well |
| **Documentation** | A | APP.md is thorough and accurate. ROADMAP.md and CHANGELOG.md exist |

### What's Missing or Broken

| Issue | Severity | Vibekit Rule Violated |
|-------|----------|----------------------|
| **Settings pages missing `loading.tsx`** | Critical | "Every page MUST have loading.tsx" — Page Completeness Checklist #1 |
| **No error boundaries on settings pages** | Critical | "Error state — When data loading fails" — Page Completeness Checklist #3 |
| **Forgot-password is a stub** | Major | Contains "Password reset logic goes here" TODO comment |
| **Padding inconsistency** | Major | Several client components use `space-y-6` without `p-4 md:p-6` wrapper (page layout provides it, but pattern is inconsistent) |
| **Preference switches are non-functional** | Major | Settings/general has "Chore Reminders" and "Bill Reminders" toggles that don't persist |
| **No git commit** | Major | Build completed but Step 9 of /setup was skipped |
| **Charts skill installed but unused** | Minor | intent.json lists "charts" but no chart components in the app |
| **Build fails on Node 25** | Minor | MODULE_NOT_FOUND error — Next.js 16 + Node 25.7 compatibility issue |

### Page-by-Page Summary

| Page | loading.tsx | Empty State | Error Handling | Padding | Mobile |
|------|:-----------:|:-----------:|:--------------:|:-------:|:------:|
| Dashboard | ✅ | ✅ | ❌ (server component, no error.tsx) | ⚠️ | ✅ |
| Chores | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bills | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Budget | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Expenses | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Members | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Settings/General | ❌ | N/A | ❌ | ⚠️ | ✅ |
| Settings/Household | ❌ | N/A | ❌ | ⚠️ | ✅ |
| Landing | N/A | N/A | N/A | ✅ | ✅ |
| Sign-in | N/A | N/A | ✅ | ✅ | ✅ |
| Sign-up | N/A | N/A | ✅ | ✅ | ✅ |
| Onboarding | N/A | N/A | ✅ | ✅ | ✅ |

---

## 3. Vibekit Guardrail Analysis

### What Worked (Guardrails That Held)

1. **EmptyState enforcement** — Every list page has one. The CLAUDE.md mandate was followed.
2. **Loading skeletons** — Created for all main pages (7/7 app pages). The mandate works.
3. **Zod validation** — Every tRPC input is validated. No raw inputs reaching the server.
4. **protectedProcedure** — All authenticated endpoints use it consistently.
5. **Household scoping** — All queries filter by householdId. Data isolation is structural.
6. **PageHeader usage** — Used on every app page consistently.
7. **shadcn/ui components only** — No unauthorized component additions.
8. **Dark-first design** — Uses semantic color tokens throughout.
9. **Living documentation** — APP.md, ROADMAP.md, CHANGELOG.md all generated and accurate.
10. **Toast notifications** — All mutations show success/error feedback.

### What Failed (Guardrails That Didn't Hold)

1. **Settings pages escaped the loading.tsx mandate.** The rule says "MANDATORY for every page" but settings subpages were created as client components with `useSuspenseQuery` instead of having separate loading.tsx files.

2. **No git commit was made.** Step 9 of `/setup` is clear about this, but it was skipped. This is dangerous — 41 minutes of work with no save point.

3. **Forgot-password is incomplete.** The rule says "Never ship a page without them — retrofitting is 3x harder" but a stub was shipped.

4. **Charts skill was installed but never used.** The skills system doesn't verify that installed skills are actually integrated into the app.

5. **Padding inheritance vs explicit.** The `(app)/layout.tsx` provides `p-4 md:p-6` on the main content area, so individual pages technically inherit it. But client components within pages don't always have their own padding wrapper, creating an inconsistent pattern. The guardrail says "No exceptions" but doesn't clarify whether layout-level padding counts.

### Guardrails That Need Tightening

| Guardrail | Current State | Recommended Change |
|-----------|---------------|-------------------|
| **loading.tsx enforcement** | "MANDATORY for every page" | Add: "Including settings subpages, onboarding pages, and any route that renders a page.tsx" |
| **Git commit** | Last step of /setup, easily skipped | Move to a mid-build checkpoint: commit after schema + routers, commit again after pages, final commit after docs |
| **Skill verification** | Skills are installed but usage isn't verified | Add post-build check: "For each installed skill, verify at least one component/route uses it" |
| **Padding rule** | "p-4 md:p-6 for page content. No exceptions." | Clarify: "Applied at the page.tsx level, not inherited from layout. Each page.tsx wrapper div must have p-4 md:p-6." |
| **Error boundaries** | "Error state — when data loading fails" | Add: "Every route group must have an error.tsx. Client components using useSuspenseQuery must be wrapped in an ErrorBoundary." |
| **Stub detection** | No rule against TODO/FIXME in shipped code | Add: "No TODO or FIXME comments in shipped pages. Either implement the feature or remove the page." |
| **Build verification** | "Run pnpm build to verify" | Add: "Test with the Node.js version specified in package.json. Document supported Node versions." |

### Guardrails That Need Loosening

| Guardrail | Issue | Recommended Change |
|-----------|-------|-------------------|
| **Padding at page level** | Layout already provides padding; requiring it on every page.tsx creates redundant wrappers | Accept layout-level padding as valid. Only require explicit padding when content overflows the layout wrapper. |

---

## 4. Feature Completeness

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (sign-up, sign-in) | ✅ Complete | Email-based credentials auth |
| Household (create, join, invite) | ✅ Complete | Invite codes, admin roles |
| Chores (CRUD, assign, complete) | ✅ Complete | Frequency options, completion history |
| Bills (CRUD, split, pay) | ✅ Complete | Auto-split, payment tracking, status updates |
| Budget (create, track) | ✅ Complete | Monthly budgets with category breakdown |
| Expenses (log, filter) | ✅ Complete | Category-based with date filters |
| Members (list, remove, roles) | ✅ Complete | Admin/member distinction |
| Notifications | ✅ Complete | Activity feed with read/unread |
| Settings | ⚠️ Partial | Profile works, preferences are non-functional stubs |
| Password reset | ❌ Stub | "Password reset logic goes here" |
| Charts/analytics | ❌ Missing | Skill installed but no charts in the app |
| Chore rotation | ❌ Not built | Listed in ROADMAP.md as "Up Next" |
| Recurring bill auto-creation | ❌ Not built | Listed in ROADMAP.md |

**Feature completeness: 8/11 features fully working (73%)**

---

## 5. Recommendations for Vibekit

### Critical (Fix Before Next Build)

1. **Add parallel agent instructions to `/setup`.** The build step should tell Claude: "For independent work (e.g., creating page A and page B that don't depend on each other), use the Task tool to launch parallel agents. This significantly reduces build time."

2. **Add mid-build git commits.** Change Step 7 to include: "After completing the schema + routers (7b-7c), commit: `git commit -m 'feat: add data models and API'`. After completing all pages (7d), commit: `git commit -m 'feat: add all pages'`. This creates save points."

3. **Add a post-build verification step to `/setup`.** After Step 7, Claude should run through the Page Completeness Checklist programmatically — glob for every page.tsx, check if loading.tsx exists alongside it, grep for EmptyState usage, etc.

4. **Clarify padding rule.** Either: (a) accept layout-level padding and remove the "every page" requirement, or (b) require page-level padding AND update the page template to show how it works with layout padding.

5. **Add stub detection rule.** "Grep for TODO, FIXME, 'goes here', and similar incomplete markers before the final build. Any page with these is not done."

### Important (Improve Quality)

6. **Add error.tsx to route groups.** The `(app)` route group should have an error.tsx that catches any unhandled errors. This is a one-file safety net that's currently missing from Vibekit's template.

7. **Skill usage verification.** After build, check: "For each skill in intent.json.skills, verify it's actually used. If not, either integrate it or remove it."

8. **Settings pages need the same rigor as main pages.** The current guardrails don't distinguish between "main" pages and "settings" pages, but in practice, settings pages got less attention. Add explicit: "Settings pages are pages too. They need loading.tsx."

9. **Document Node.js version compatibility.** Add `engines` field to package.json specifying supported Node versions. Current build fails on Node 25.

### Nice to Have (Optimize)

10. **Category-to-feature mapping could be smarter.** The "saas-productivity" category auto-suggested "charts" but the household management app didn't need charts. The Quick Start path should ask a follow-up: "Does your app need charts or data visualization?" before auto-installing.

11. **Build time benchmarking.** Add timestamps to the build process so we can track: time to schema, time to first page, time to all pages, time to build pass. This lets us measure optimization efforts.

12. **Template pages vs. generated pages.** The vibekit boilerplate already has dashboard, settings, etc. Claude spent time modifying these rather than generating fresh. Consider whether the boilerplate pages should be more generic (easier to modify) or more specific (less modification needed).

---

## 6. Benchmark Metrics (For Future Comparison)

| Metric | HomeBase (Build #1) | Target |
|--------|-------------------|--------|
| Build time | ~41 min | <30 min |
| Pages built | 15 | — |
| Models created | 13 | — |
| API procedures | ~35 | — |
| Lines of code | 9,453 | — |
| loading.tsx coverage | 8/10 (80%) | 100% |
| Empty state coverage | 7/7 list pages (100%) | 100% |
| Error handling coverage | 5/7 main pages (71%) | 100% |
| Padding consistency | ~60% | 100% |
| Git commits during build | 0 | ≥3 |
| Build passes (pnpm build) | ❌ (Node compat) | ✅ |
| Unused skills installed | 1 (charts) | 0 |
| TODO/stub pages | 1 (forgot-password) | 0 |
| Quality gate pass | ❌ | ✅ |
| Documentation complete | ✅ | ✅ |

---

## 7. Action Items for Vibekit

Priority order:

1. [ ] **Update `/setup` Step 7** — add mid-build git commits at 3 checkpoints
2. [ ] **Update `/setup`** — add parallel agent instructions for page generation
3. [ ] **Add post-build verification** — programmatic check for loading.tsx, EmptyState, error handling
4. [ ] **Clarify padding rule** in CLAUDE.md — layout-level vs page-level
5. [ ] **Add stub detection** to quality-gate and post-build checks
6. [ ] **Add error.tsx** to `(app)` route group in vibekit template
7. [ ] **Add `engines` field** to package.json for Node version compatibility
8. [ ] **Tighten skill verification** — check installed skills are actually used
9. [ ] **Improve category-to-skill mapping** — ask before auto-installing optional skills
10. [ ] **Add build timing** — log timestamps at each phase for benchmarking
