---
description: Plan and build a new feature from the roadmap
---

Build a new feature following vibekit's stepped development workflow. Each phase has a verification checkpoint — never skip ahead without confirming the current step is solid.

## Phase 1: Context (read before you think)

Read these files to understand the current state of the app:

1. **Read `APP.md`** — models, routes, pages, API, installed skills
2. **Read `docs/roadmap.md`** — find the feature, understand priority and context
3. **Read `docs/changelog.md`** — recent changes that might affect this feature
4. **Check `prisma/schema.prisma`** — existing data models
5. **Check `src/trpc/routers/`** — existing API surface

Do NOT start planning until you've read all five. Skipping context leads to duplicate models, conflicting routes, and missed dependencies.

## Phase 2: Plan (confirm before you build)

### Quick or Detailed?

**If the feature is simple** (add a field, tweak a page, wire up an existing pattern):
- State what you'll change in 2-3 bullet points
- Confirm with the user
- Skip to Phase 3

**If the feature is substantial** (new model, new pages, new skill):
- Answer all five planning questions below
- Present the full plan
- Get explicit approval before writing code

### Planning Questions

1. **What data does this feature need?**
   - New Prisma models? New fields on existing models?
   - New tRPC procedures? Which routers?
   - What Zod input schemas?

2. **What pages/components does this feature need?**
   - New pages? Modifications to existing pages?
   - New pattern components?
   - Where does it fit in the navigation?

3. **What does the user see in every state?**
   - First load → loading skeleton
   - No data → empty state with action
   - Data loaded → normal view
   - Error → error state with retry
   - After action → toast confirmation

4. **What existing features does this affect?**
   - Which queries need to be invalidated after mutations?
   - Does the dashboard need updating? (stats, activity feed, counts)
   - Do sidebar counts or badges change?
   - Do any existing pages show related data?

5. **Does this need a skill?**
   - Check the available skills before building from scratch
   - If a skill covers this, install it instead of hand-coding

### Checkpoint: Present the Plan

```
Here's what I'll build for [feature name]:

Data:
- [New/modified models and fields]

API:
- [New/modified tRPC procedures]

Pages:
- [New/modified pages, each with loading + empty + error states]

Affects:
- [Existing pages/queries that need updating]

Skills:
- [Any skills to install, or "none"]

Ready to build?
```

Wait for approval. If the user wants changes, adjust and re-present. Do not start coding until they say go.

## Phase 3: Build (one layer at a time, verify each)

### 3a. Create feature branch
```bash
git checkout -b feat/feature-name
```

### 3b. Database

Add/modify Prisma models, then push:
```bash
pnpm db:push
```

**Verify**: Schema push succeeds. If it fails, fix the schema and re-push. Common issues:
- Missing `@default` on required fields
- Invalid relation references
- SQLite limitations (no enums — use String with validation)

Do NOT proceed to API until the schema is clean.

### 3c. API

Add tRPC router procedures with Zod input validation. Wire into root router if it's a new router.

**Verify**: Run `pnpm build` (or at minimum `npx tsc --noEmit`) to confirm no TypeScript errors. Fix any type errors before proceeding.

If the build fails here, it's usually:
- Missing import in root router
- Zod schema doesn't match Prisma types
- Wrong return type from a procedure

Fix the root cause. Do not work around it.

### 3d. Pages (one at a time)

For EACH new page, create ALL of these before moving to the next:

1. `page.tsx` — with `p-4 md:p-6` padding, PageHeader, `space-y-6` sections
2. `loading.tsx` — skeleton matching the exact page layout
3. **Empty state** — EmptyState component with icon, title, description, action
4. **Error handling** — error state with retry in every data-fetching component
5. **Mobile layout** — works at 375px, touch targets ≥ 44px

**Verify each page** before starting the next:
- Empty state: What does a user with no data see? Is it helpful?
- Loading: Does the skeleton match the real layout? Same grid, same sizes?
- Error: What if the API fails? Is there a retry button?
- Mobile: Any overflow at 375px? Can you tap everything?

For modified pages, verify the changes don't break existing states.

### 3e. Navigation and Data Propagation

- Add to sidebar if it's a main page
- Invalidate ALL affected queries after mutations:

```typescript
// Think about every page that shows this data
await utils.entity.list.invalidate();
await utils.entity.get.invalidate({ id });
await utils.dashboard.stats.invalidate();  // if counts changed
```

**Verify**: Mentally trace every mutation. What data changes? Where else is that data displayed? Are those views invalidated?

### 3f. Full Build Check

```bash
pnpm build
```

**Verify**: Zero errors, zero warnings that indicate real issues. If the build fails:
1. Read the error message carefully
2. Fix the root cause (not a workaround)
3. Re-run `pnpm build`
4. Repeat until clean

## Phase 4: Verify (the feature works end-to-end)

Before documenting, walk through the feature as a user would:

| Scenario | What to Check |
|----------|---------------|
| First-time user | Empty states are helpful, not blank |
| Create something | Form works, toast confirms, list updates, dashboard reflects change |
| View the thing | Detail page loads with skeleton first, then data |
| Edit the thing | Pre-populated form, save works, changes reflected everywhere |
| Delete the thing | Confirmation dialog, removed from all views, counts update |
| Error scenario | What if the network drops? Retry button works? |
| Mobile | Every page works at 375px width |
| Long text | 200-character name/description — truncates, doesn't break layout |
| Missing fields | Optional fields left empty — no "undefined" or blank gaps |
| Many items | 100+ items — pagination or virtualization, not infinite render |
| Rapid clicks | Clicking submit 5 times fast — button disabled during async, no duplicates |

If any scenario fails, go back to Phase 3 and fix it. Do not document a broken feature.

## Phase 5: Document (update everything)

### 5a. Update APP.md
Add new models, routes, API procedures to the quick-reference.

### 5b. Create Feature Doc
Create `docs/features/{feature-name}.md` using the template in `docs/features/_template.md`:
- Set frontmatter: `type: feature`, `status: shipped`, `feature: "{name}"`, `version`, `related-models`, `related-routes`, `created`, `last-updated`
- Fill in: Overview, User Story, Data Model (link to `[[data-model]]`), Pages, API procedures, States (empty/loading/error), Acceptance Criteria

### 5c. Update Vault Engineering Docs
- **If new models added:** Re-read `prisma/schema.prisma` and update `docs/engineering/data-model.md`
- **If new routers/procedures added:** Re-read `src/trpc/routers/` and update `docs/engineering/api-reference.md`

### 5d. Update Vault Navigation and History
- Update `docs/_index.md` — add new feature doc to Quick Links → Features
- Update `docs/roadmap.md` — mark feature as completed with today's date
- Update `docs/changelog.md` — add to "Unreleased" under "Added"/"Changed"/"Fixed"

### 5e. Decision Record (if applicable)
Create a new `docs/decisions/NNN-{name}.md` using the template if ANY of these are true:
- A new skill was installed
- The data model was significantly restructured
- A new pattern was introduced that future features should follow
- An alternative approach was explicitly considered and rejected

Otherwise, skip the decision record.

## Phase 6: Ship

1. **Commit**:
   ```bash
   git add .
   git commit -m "feat: [description]"
   ```
2. **Push**:
   ```bash
   git push -u origin feat/feature-name
   ```
3. If the user wants a PR:
   ```bash
   gh pr create --title "feat: [description]" --body "..."
   ```

### Post-Ship Summary

```
[Feature name] is done!

What I built:
- [Data changes]
- [API changes]
- [Page changes]

What I updated:
- APP.md — [what sections changed]
- docs/features/[name].md — new feature spec
- docs/roadmap.md — marked as completed
- docs/changelog.md — added under "Added"
- docs/engineering/ — [data-model and/or api-reference if changed]

Branch: feat/feature-name
[PR link if created]

What's next? Run `/roadmap` to see the next item, or tell me what to build.
```

$ARGUMENTS
