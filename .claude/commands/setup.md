---
description: Set up your project and build your app — the complete first-run experience
---

Welcome to Vibekit! This command takes you from a fresh clone to a running, custom app.

## Instructions

### Step 0: Detect State

Check what's already been done so `/setup` is safe to re-run:

1. **Does `APP.md` exist?** → App is already built. Tell the user:
   "Your app is already set up! Run `pnpm dev` to start it, or use `/add-feature` to build something new."
   Stop here unless they explicitly want to start over.

2. **Does `.vibekit/intent.json` exist with `"interviewComplete": true`, but no `APP.md`?** →
   Interview completed but build was interrupted. Read intent.json for context and ask:
   "Looks like we started setting up before but didn't finish. Want to pick up where we left off?"
   If yes and `buildApproved` is true, skip to Step 10 (Build) using the saved intent data.
   If `buildApproved` is missing/false, present the build plan (Step 9) for approval first.

3. For Steps 1-4, check and skip what's already done:
   - `node_modules/` exists → skip dependency install
   - `.env` exists → skip environment setup
   - `prisma/dev.db` exists → skip database setup

### Steps 1–4: Project Setup (ONE bash command — minimize approvals)

Run ALL infrastructure setup in a SINGLE bash command. The user should only need to approve ONE tool call for the entire setup phase. Do NOT split these into separate commands.

```bash
# Single command that checks prereqs, pre-approves native builds, installs deps, sets up env, and initializes DB
node -v && pnpm -v && git --version && \
([ -d node_modules ] || (node -e "const p=require('./package.json'); p.pnpm=p.pnpm||{}; p.pnpm.onlyBuiltDependencies=p.pnpm.onlyBuiltDependencies||[]; if(!p.pnpm.onlyBuiltDependencies.includes('better-sqlite3')){p.pnpm.onlyBuiltDependencies.push('better-sqlite3')} require('fs').writeFileSync('package.json',JSON.stringify(p,null,2)+'\n')" && pnpm install)) && \
([ -f .env ] || (AUTH_SECRET=$(openssl rand -base64 32) && printf 'DATABASE_URL="file:./dev.db"\nAUTH_SECRET="%s"\nAUTH_URL="http://localhost:3000"\nNEXT_PUBLIC_APP_URL="http://localhost:3000"\n' "$AUTH_SECRET" > .env && cp .env .env.local)) && \
([ -f prisma/dev.db ] || (pnpm db:generate && pnpm db:push && pnpm db:seed))
```

If ANY prerequisite is missing, the command fails fast and shows what's needed. If any step was already done, it skips silently.

Once complete, give the user a single brief status update:

"All set up — Node [version], dependencies installed, database ready.

Now let's figure out what to build. Tell me about the app you want — what does it do, and who is it for? You can be as brief or detailed as you like."

If any step fails, stop immediately, show the error clearly, and suggest a fix.

Now read `.claude/docs/guided-setup.md` and follow the interview flow starting from **Step 0b** (Quick Start vs Custom Build). Key points:

- **You determine the category** based on what the user describes. Don't show them a menu of categories — listen to what they want and map it to the right foundation.
- If they give a short description ("a recipe sharing app"), take the Quick Start path — infer everything, apply scope gating, and present an abbreviated build plan for approval.
- If they give detailed requirements or ask questions, take the Custom Build path — validate the idea (Step 2), define MVP scope (Step 3), then go step by step with checkpoints through Steps 4-8.
- At every checkpoint, present a summary and wait for approval before continuing.
- **Build Plan Approval (Step 9) is mandatory.** Present the full build manifest and get explicit user approval before generating any code.

### CRITICAL: Minimize Tool Calls (Approval Fatigue)

Every tool call may require user approval. Excessive tool calls ruin the experience. Follow these rules:

1. **Batch shell commands aggressively.** Never run 3 commands that could be 1. Use `&&` to chain. Steps 1-4 must be ONE command.
2. **Use Task agents for multi-step research.** Domain discovery (exploring an external system) should be a SINGLE Task agent call, not a preliminary `ls` followed by a separate Explore agent. The agent runs autonomously — one approval instead of dozens.
3. **Write files in parallel.** When creating multiple files (build spec, intent.json, documentation), use parallel tool calls in a single message.
4. **Combine build steps.** `npx tsx generators/compose.ts && pnpm db:push && pnpm build` is ONE approval, not three.
5. **During the customization pass** (Step 10e), write/edit all files for a single page in one message with parallel tool calls, then move to the next page. Don't interleave reads and writes across pages.

**Target: The entire `/setup` flow — from fresh clone to running app — should require fewer than 25 tool approvals.** Count every Bash, Read, Write, Edit, Task, and Fetch call. If you're approaching 25 and haven't started the customization pass, you're doing too many individual calls.

### After the Interview: Save Intent

After the interview is complete and the user has approved the build plan (Step 9), save the results to `.vibekit/intent.json`:
```json
{
  "appName": "[name from interview]",
  "category": "[category you determined]",
  "categoryLabel": "[human-readable category]",
  "description": "[one-sentence app description]",
  "targetUser": "[who the app is for — from Step 2]",
  "problem": "[what problem it solves — from Step 2]",
  "competitors": ["[competitor 1]", "[competitor 2]"],
  "uniqueAngle": "[what makes this version different — from Step 2]",
  "mvpFeatures": ["[feature 1]", "[feature 2]", "[feature 3]"],
  "v2Features": ["[deferred feature 1]", "[deferred feature 2]"],
  "needsLandingPage": false,
  "needsPayments": false,
  "skills": ["list", "of", "selected", "skills"],
  "models": ["[Model1]", "[Model2]", "[Model3]"],
  "pages": ["Dashboard", "[Entity] List", "[Entity] Detail", "Settings"],
  "vibe": "[friendly|professional|creative|bold|minimal|custom]",
  "primaryColor": "[hex color]",
  "setupDate": "[ISO timestamp]",
  "interviewComplete": true,
  "buildApproved": true
}
```

### Build (minimize tool calls — batch everything)

Follow `guided-setup.md` Step 10. Batch aggressively:

1. **Write build spec + intent.json** — Write both `.vibekit/build-spec.json` and `.vibekit/intent.json` as parallel Write calls in a single message.
2. **Run generators + skills + push + verify** — Chain into as few bash commands as possible:
   ```bash
   npx tsx generators/compose.ts && \
   npx tsx skills-engine/index.ts apply skill1 && \
   npx tsx skills-engine/index.ts apply skill2 && \
   pnpm db:push && pnpm build
   ```
   That's ONE tool approval for the entire generation + verification pipeline.
3. **Customization pass** — Business logic, skill integration, branding, non-standard pages. Write/edit files for each page in parallel tool calls per message.
4. **Pre-delivery checklist** — Run the checklist from `guided-setup.md` Step 10f to verify template cleanup, branding, and stub implementation.
5. **Seed + build verify** — `pnpm db:seed && pnpm build` (ONE command)
6. **Smoke test** — Start dev server, curl key pages, verify no 500s. See `guided-setup.md` Step 10g-smoke.
7. **Commit working app** — `git add -A && git commit -m "feat: initial build — [app name]"` (BEFORE docs)

### Documentation

Generate the documentation vault (`docs/`) and APP.md as described in `guided-setup.md` Step 10h. Then commit docs separately.

### Git + Summary

Commit documentation:
```bash
git add -A && git commit -m "docs: add project documentation — [app name]"
```

If the user wants to push to GitHub, offer to help with `gh repo create`.

Then present the post-build summary from `guided-setup.md`.

## Important

- Speak in plain English. No jargon.
- Present plans before writing code. Don't surprise the user.
- Every page must have loading, empty, error, and mobile states. No exceptions.
- Run `pnpm build` to verify before finishing.
- If something fails at any step, stop, explain clearly, and suggest a fix. Don't silently skip steps.
- **DO NOT explore the vibekit template source code** before or during the build. Do not launch explore agents to read `src/components/`, `src/trpc/`, `generators/`, or template page files. CLAUDE.md and `.claude/docs/` contain all the patterns, conventions, and code templates you need. Only read specific source files when you need to modify or debug them. Excessive exploration wastes tokens and makes the setup take much longer than it should.

$ARGUMENTS
