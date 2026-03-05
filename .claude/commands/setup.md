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

### Step 1: Prerequisites

Run these checks:

1. **Node.js**: Run `node -v` — need v18 or newer.
   If missing or too old: "You need Node.js 18 or newer. Install it from https://nodejs.org (grab the LTS version), then come back and run `/setup` again."

2. **pnpm**: Run `pnpm -v`
   If missing: "You need pnpm. Run this in your terminal: `npm install -g pnpm` — then run `/setup` again."

3. **git**: Run `git --version`
   If missing: "You need git. Install it from https://git-scm.com, then run `/setup` again."

If ANY prerequisite is missing, list everything that's needed in one message and **stop**. Don't proceed with partial prerequisites.

If everything's good, confirm briefly: "Prerequisites look good — Node [version], pnpm [version], git [version]."

### Step 2: Install Dependencies

Run: `pnpm install`

This takes about 30 seconds. Tell the user: "Installing dependencies — this takes about 30 seconds."

If it fails, show the error and suggest: "Try deleting `node_modules` and running `/setup` again."

### Step 3: Environment Setup

If `.env` does NOT exist:

1. Generate a secret: run `openssl rand -base64 32`
2. Create `.env` with the generated secret:
   ```
   DATABASE_URL="file:./dev.db"
   AUTH_SECRET="[generated value]"
   AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
3. Copy `.env` to `.env.local` — Prisma reads `.env`, Next.js reads `.env.local`, both need to exist.

Confirm: "Environment configured."

If `.env` already exists, skip and confirm: "Environment already configured."

### Step 4: Database Setup

Run: `pnpm db:generate && pnpm db:push && pnpm db:seed`

If it fails, show the error. Common fix: "Try `rm prisma/dev.db` and run `/setup` again."

Confirm: "Database ready with demo data."

### Step 5: Guided Interview

Tell the user:

"Everything is installed and ready. Now let's figure out what to build.

Tell me about the app you want to build — what does it do, and who is it for? You can be as brief or detailed as you like."

Now read `.claude/docs/guided-setup.md` and follow the interview flow starting from **Step 0b** (Quick Start vs Custom Build). Key points:

- **You determine the category** based on what the user describes. Don't show them a menu of categories — listen to what they want and map it to the right foundation.
- If they give a short description ("a recipe sharing app"), take the Quick Start path — infer everything and present a plan for approval.
- If they give detailed requirements or ask questions, take the Custom Build path — go step by step with checkpoints.
- At every checkpoint, present a summary and wait for approval before continuing.

### Step 6: Save Intent

After the interview is complete and the user has approved the build plan, save the results:

Write `.vibekit/intent.json`:
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

### Step 7: Build

Follow `guided-setup.md` Step 7 exactly:
1. Install skills
2. Generate database models + push
3. Generate tRPC API routes
4. Generate pages (one at a time, with loading/empty/error/mobile states)
5. Wire navigation and data flow
6. Apply branding
7. Seed + `pnpm build` to verify

### Step 8: Documentation

Generate APP.md, ROADMAP.md, CHANGELOG.md as described in `guided-setup.md` Steps 7i-7k.

### Step 9: Git + Summary

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
