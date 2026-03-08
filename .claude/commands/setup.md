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
   If yes, skip to Step 5 (Build) using the saved intent data.

3. For Steps 1-4, check and skip what's already done:
   - `node_modules/` exists → skip dependency install
   - `.env` exists → skip environment setup
   - `prisma/dev.db` exists → skip database setup

### Steps 1–4: Project Setup (do all of this before talking to the user)

Run these silently and efficiently. Only talk to the user if something fails.

1. **Prerequisites** — Run `node -v`, `pnpm -v`, `git --version` in a single bash command.
   - If ANY are missing, list everything needed in one message and **stop**.
   - If Node.js is below v18, tell them to upgrade and stop.

2. **Dependencies** — If `node_modules/` doesn't exist, run `pnpm install`.

3. **Environment** — If `.env` doesn't exist:
   - Run `openssl rand -base64 32` to generate AUTH_SECRET
   - Write `.env` with DATABASE_URL, AUTH_SECRET, AUTH_URL, NEXT_PUBLIC_APP_URL
   - Copy `.env` to `.env.local` (Prisma reads `.env`, Next.js reads `.env.local`)

4. **Database** — If `prisma/dev.db` doesn't exist, run `pnpm db:generate && pnpm db:push && pnpm db:seed`.

Once all 4 steps complete successfully, give the user a single brief status update:

"All set up — Node [version], dependencies installed, database ready.

Now let's figure out what to build. Tell me about the app you want — what does it do, and who is it for? You can be as brief or detailed as you like."

If any step was already done (e.g. node_modules exists), skip it silently.
If any step fails, stop immediately, show the error clearly, and suggest a fix.

Now read `.claude/docs/guided-setup.md` and follow the interview flow starting from **Step 0b** (Quick Start vs Custom Build). Key points:

- **You determine the category** based on what the user describes. Don't show them a menu of categories — listen to what they want and map it to the right foundation.
- If they give a short description ("a recipe sharing app"), take the Quick Start path — infer everything and present a plan for approval.
- If they give detailed requirements or ask questions, take the Custom Build path — go step by step with checkpoints.
- At every checkpoint, present a summary and wait for approval before continuing.

### After the Interview: Save Intent

After the interview is complete and the user has approved the build plan, save the results to `.vibekit/intent.json`:
```json
{
  "appName": "[name from interview]",
  "category": "[category you determined]",
  "categoryLabel": "[human-readable category]",
  "description": "[one-sentence app description]",
  "skills": ["list", "of", "selected", "skills"],
  "setupDate": "[ISO timestamp]",
  "interviewComplete": true
}
```

### Build

Follow `guided-setup.md` Step 7 exactly:
1. Install skills
2. Generate database models + push
3. Generate tRPC API routes
4. Generate pages (one at a time, with loading/empty/error/mobile states)
5. Wire navigation and data flow
6. Apply branding
7. Seed + `pnpm build` to verify

### Documentation

Generate the documentation vault (`docs/`) and APP.md as described in `guided-setup.md` Step 7h.

### Git + Summary

Initialize git and commit:
```bash
git add -A
git commit -m "feat: initial vibekit build — [app name]"
```

If the user wants to push to GitHub, offer to help with `gh repo create`.

Then present the post-build summary from `guided-setup.md`.

## Important

- Speak in plain English. No jargon.
- Present plans before writing code. Don't surprise the user.
- Every page must have loading, empty, error, and mobile states. No exceptions.
- Run `pnpm build` to verify before finishing.
- If something fails at any step, stop, explain clearly, and suggest a fix. Don't silently skip steps.

$ARGUMENTS
