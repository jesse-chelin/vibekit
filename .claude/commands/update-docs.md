---
description: Update APP.md, ROADMAP.md, and CHANGELOG.md after changes
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

### 3. Update ROADMAP.md

- Move completed items to the "Completed" section with today's date
- Update "Current Sprint" status
- Add any new ideas that came up during development to "Future Ideas"

### 4. Update CHANGELOG.md

Add entries under `[Unreleased]`:
- **Added** — New features
- **Changed** — Modifications to existing features
- **Fixed** — Bug fixes
- **Removed** — Removed features

### 5. Commit Documentation

```bash
git add APP.md ROADMAP.md CHANGELOG.md
git commit -m "docs: update project documentation"
```

## Rules

- Keep APP.md concise — it's a reference, not a tutorial
- Keep ROADMAP.md actionable — items should be specific enough to build
- Keep CHANGELOG.md factual — what changed, not why (use PR descriptions for why)
- Never include secrets, passwords, or API keys in any documentation
- Date format: YYYY-MM-DD

$ARGUMENTS
