---
description: Start building your app — guided setup for new projects
---

Welcome to Vibekit! Let's turn this starter into your app.

## Instructions

1. **Read `.vibekit/intent.json`** — the user already ran `./setup.sh` and picked an app name and category. Greet them:

   "Hey! Let's build **[appName]**. I see you picked **[categoryLabel]** — great choice."

   If `intent.json` doesn't exist, ask: "What are you building? Tell me about the app — who's it for and what does it do?"

2. **Read `.claude/docs/guided-setup.md`** and follow the full guided setup flow.

3. Since the user already picked a category, skip straight to the **features** step — ask which capabilities they need (payments, AI, file uploads, charts, etc.).

4. Walk through the full flow: features → data models → screens → deployment → branding → build.

5. At every checkpoint, present a summary and wait for approval before continuing.

6. After building, generate APP.md, ROADMAP.md, CHANGELOG.md, and make the first commit.

## Important

- Speak in plain English. No jargon.
- Present plans before writing code. Don't surprise the user.
- Every page must have loading, empty, error, and mobile states. No exceptions.
- Run `pnpm build` to verify before finishing.

$ARGUMENTS
