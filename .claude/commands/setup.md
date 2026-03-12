---
description: Set up your project and build your app — the complete first-run experience
---

Welcome to Vibekit! This command takes you from a fresh clone to a running, custom app.

## Step 0: Detect State

Check what's already been done so `/setup` is safe to re-run:

1. **Does `APP.md` exist?** → App is already built. Tell the user:
   "Your app is already set up! Run `pnpm dev` to start it, or use `/add-feature` to build something new."
   Stop here unless they explicitly want to start over.

2. **Does `.vibekit/intent.json` exist with `"interviewComplete": true`, but no `APP.md`?** →
   Interview completed but build was interrupted. Read intent.json for context and ask:
   "Looks like we started setting up before but didn't finish. Want to pick up where we left off?"
   If yes and `buildApproved` is true, skip to Step 10 (Build) using the saved intent data.
   If `buildApproved` is missing/false, present the build plan (Step 9) for approval first.

3. For infrastructure, check and skip what's already done:
   - `node_modules/` exists → skip dependency install
   - `.env` exists → skip environment setup
   - `prisma/dev.db` exists → skip database setup

## Steps 1–4: Project Setup (ONE bash command)

Run ALL infrastructure setup in a SINGLE bash command — one approval.

```bash
node -v && pnpm -v && git --version && \
([ -d node_modules ] || (node -e 'var p=require("./package.json"),a=["better-sqlite3","esbuild"];p.pnpm=p.pnpm||{};p.pnpm.onlyBuiltDependencies=p.pnpm.onlyBuiltDependencies||[];a.forEach(function(d){if(p.pnpm.onlyBuiltDependencies.indexOf(d)<0)p.pnpm.onlyBuiltDependencies.push(d)});require("fs").writeFileSync("package.json",JSON.stringify(p,null,2)+"\n")' && pnpm install)) && \
([ -f .env ] || (AUTH_SECRET=$(openssl rand -base64 32) && printf 'DATABASE_URL="file:./dev.db"\nAUTH_SECRET="%s"\nAUTH_URL="http://localhost:3000"\nNEXT_PUBLIC_APP_URL="http://localhost:3000"\n' "$AUTH_SECRET" > .env && cp .env .env.local)) && \
([ -f prisma/dev.db ] || (pnpm db:generate && pnpm db:push && pnpm db:seed))
```

**Note:** The `node -e` command uses single quotes and `.indexOf(d)<0` (not `!.includes()`) to avoid bash history expansion issues. Both `better-sqlite3` and `esbuild` are pre-approved to skip the interactive `pnpm approve-builds` TUI.

Once complete: "All set up — Node [version], dependencies installed, database ready. Now let's figure out what to build."

If any step fails, stop immediately, show the error, and suggest a fix.

## Hand Off to Guided Setup

Now read `.claude/docs/guided-setup.md` and follow the interview flow starting from **Step 0b** (Quick Start vs Custom Build).

- **You determine the category** based on what the user describes — don't show a category menu.
- Short description → Quick Start path. Detailed requirements → Custom Build path.
- **Build Plan Approval (Step 9) is mandatory.** No code generation without explicit user approval.
- **DO NOT explore the vibekit template source code.** CLAUDE.md and `.claude/docs/` have everything you need. Only read specific source files when you need to modify or debug them.

All tool call budgets, interview flow, build steps, intent.json schema, documentation generation, and post-build verification are defined in `guided-setup.md`. Follow it exactly.

$ARGUMENTS
