---
description: Update APP.md and docs/ vault after changes
---

Review recent changes and update all project documentation to reflect the current state.

## Steps

### 1. Detect What Changed

Check the current state:
```bash
git diff --name-only HEAD~5  # Recent changes
git log --oneline -10         # Recent commits
```

Read the affected files to understand what was added/changed.

### 2. Update APP.md

Read the current `APP.md` and update these sections:

- **Data Models** — Sync with `prisma/schema.prisma`. List every model with key fields.
- **Routes & Pages** — Sync with `src/app/`. List every route and what it shows.
- **API (tRPC Routers)** — Sync with `src/trpc/routers/`. List every procedure.
- **Installed Skills** — Sync with `.vibekit/state.json` if it exists.
- **Environment Variables** — Sync with `.env.example`. List all required vars.
- **Key Decisions** — Add any new architectural decisions.

Do NOT include implementation details or code snippets. APP.md is a high-level reference.

### 3. Update `docs/roadmap.md`

- Move completed items to the "Completed" section with today's date
- Update "Current Sprint" status
- Add any new ideas that came up during development to "Future Ideas"

### 4. Update `docs/changelog.md`

Add entries under `[Unreleased]`:
- **Added** — New features
- **Changed** — Modifications to existing features
- **Fixed** — Bug fixes
- **Removed** — Removed features

### 5. Update Vault Engineering Docs (if affected)

Check which areas changed and update the corresponding vault docs:

**If `prisma/schema.prisma` changed:**
- Re-read the schema and update `docs/engineering/data-model.md` — models, fields, relationships

**If files in `src/trpc/routers/` changed:**
- Re-read the routers and update `docs/engineering/api-reference.md` — procedures table

**If new skills installed or infrastructure changed:**
- Update `docs/engineering/architecture.md`
- Update `docs/engineering/deployment.md` if env vars changed

### 6. Update Vault Index (if new docs added)

If new feature docs were created in `docs/features/`, update `docs/_index.md` Quick Links section to include them.

### 7. Commit Documentation

```bash
git add APP.md docs/
git commit -m "docs: update project documentation"
```

## Rules

- Keep APP.md concise — it's a quick reference, not a deep dive
- Keep `docs/roadmap.md` actionable — items should be specific enough to build
- Keep `docs/changelog.md` factual — what changed, not why
- Never include secrets, passwords, or API keys in any documentation
- Date format: YYYY-MM-DD
- Use `[[wiki-links]]` for cross-references within the vault
- Update frontmatter `last-updated` field on modified vault docs

$ARGUMENTS
