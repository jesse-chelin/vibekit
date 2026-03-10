# Guided Setup Flow

When a user opens this repo and wants to build an app, follow this interview flow.
Speak in plain language. No jargon. Translate human intent into technical decisions.

---

## Step 0: Context Check

Check if `.vibekit/intent.json` exists with `"interviewComplete": true`. If it does, a previous `/setup` run completed the interview but may not have finished the build. Read the file and use its contents (appName, category, skills, description) to skip the interview and jump directly to Step 10: Build.

If `intent.json` doesn't exist or `interviewComplete` is missing/false, proceed to Step 0b to start the interview.

---

## Step 0b: Choose Your Path

Ask the user how they'd like to build:

**Quick Start**: "Tell me what you're building in one sentence, and I'll set everything up with smart defaults. You can customize later."
- Infers category, auto-selects skills, uses default pages and models
- Best for: users who want to see a working app fast

**Custom Build**: "Let's go step by step. I'll ask about your app, features, data, screens, and deployment — you decide everything."
- Full interview, user approves each decision
- Best for: users who know what they want and want control

If the user just says something like "build me a recipe app" without choosing, treat it as Quick Start. If they ask questions or give detailed requirements, switch to Custom Build.

---

## Quick Start Path

### 1. Detect category and auto-configure

From the user's description, identify the category and auto-select:

| Category | Auto-Skills | Auto-Models | Auto-Pages |
|----------|-------------|-------------|------------|
| E-commerce / marketplace | stripe, file-uploads, charts | Product, Order, Category | Dashboard, Products (list/detail/create), Orders, Settings |
| Dashboard / analytics | charts | varies by domain | Dashboard, Data list/detail, Settings |
| Social / community | realtime-chat, file-uploads | Post, Comment, Message | Dashboard, Feed, Chat, Profile, Settings |
| SaaS / productivity | stripe, charts, email | varies by domain | Dashboard, Entity list/detail/create/edit, Settings |
| AI app | ollama or cloud-llm, charts | Conversation, Message | Dashboard, Chat, History, Settings |
| Media management | file-uploads, charts | Media, Collection, Tag | Dashboard, Library, Upload, Detail, Settings |
| Internal tool | admin-panel, rbac, charts | varies by domain | Dashboard, Admin, Entity list/detail, Settings |

### 1b. Domain Discovery (external systems)

**If the user mentions an external system, database, API, or local installation** — STOP and investigate BEFORE proposing features. See "Step 1b: Domain Discovery" in the Custom Build Path for full details. This applies to Quick Start too. You cannot propose good features for a system you haven't examined.

Read the external system's repo/README, database schema, and available data. Understand what entities exist, what data changes frequently, and what would make this dashboard indispensable. This takes 2-3 minutes and prevents building something technically correct but functionally useless.

### 2. Light validation + auto scope

Infer validation context from the one-sentence description. Don't interrogate — present your inferences for confirmation:

```
Sounds like you're building a [category] app for [inferred user].
The main problem you're solving: [inferred problem].

For v1, I'll focus on these [3] core features:
- [Feature A] — [why it's essential]
- [Feature B] — [why it's essential]
- [Feature C] — [why it's essential]

These can wait for v2:
- [Feature D] — [why it can wait]
- [Feature E] — [why it can wait]

Skills: [2-3 max]
Pages: [5-7 max]
Models: [3-4 max]
```

Apply scope gating silently:
- Cap skills at 3
- Cap pages at 7 (CRUD for one entity = 1 feature area)
- Cap MVP features at 5
- No landing page unless explicitly requested
- No payments unless explicitly requested

Fill inferred values for `targetUser`, `problem`, `competitors`, `uniqueAngle` with best guesses — less detailed than Custom Build but the vault still has data to work with.

### 3. Abbreviated build plan

Present the same build plan format as Step 9 (Build Plan Approval) but with inferred values:

```
Here's the complete build plan for [App Name]:

PROBLEM
[Inferred one sentence]

TARGET USER
[Inferred one sentence]

WHAT I'LL BUILD
  Models ([N]): [list]
  API Routers ([N] routers, [M] procedures): [list]
  Pages ([N]): [list]
  Skills ([N]): [list]
  Deployment: Dev mode (localhost)
  Design: Friendly (teal) — default

DEFERRED TO V2
- [features]

Approve this plan, or switch to Custom Build for more control.
```

### 4. Build

If they approve, jump to **Step 10: Build** below.
If they want changes, address their feedback and re-present.
If they want full control, switch to the Custom Build path at Step 1.

---

## Custom Build Path

### Step 1: "What are you building?"

Ask: "Tell me about the app you want to build. What does it do?"

Listen for category signals:
- "marketplace" / "store" → e-commerce (suggest: stripe, file-uploads)
- "dashboard" / "analytics" → data app (suggest: charts)
- "social" / "community" → social (suggest: realtime-chat, file-uploads)
- "SaaS" / "tool" → productivity (suggest: stripe, charts, email)
- "AI" / "chatbot" → AI app (suggest: ollama or cloud-llm)
- "media" / "music" / "photos" → media management (suggest: file-uploads, charts)
- "internal tool" / "admin" → admin tool (suggest: admin-panel, rbac, charts)

Respond: "So it sounds like you're building a [category]. Here's what I'm thinking..."

Do NOT ask "who is it for?" here — that's covered in depth in Step 2.

#### Step 1b: Domain Discovery (for external systems)

If the user mentions an external system, API, database, or existing tool they want to build on top of (e.g., "a dashboard for NanoClaw", "an interface for my home automation", "a viewer for my media server"), you MUST investigate it BEFORE proposing features.

**If the user provides a GitHub URL or repo path:**
- Read the README to understand what the system does
- Look at the database schema (look for `.sql` files, migration files, `schema.prisma`, SQLite databases, or ORM model definitions)
- Check what data is available — tables, columns, relationships
- Understand the system's core concepts (what entities exist, what actions are possible)

**If the user provides a local installation path:**
- Look for database files (`.db`, `.sqlite`, `.sqlite3`)
- If found, open with `sqlite3 <path> ".schema"` or `sqlite3 <path> ".tables"` to discover the full schema
- Look for config files that reveal the system's structure
- Check for log files that reveal what the system does at runtime

**If the user provides an API:**
- Check for API docs, OpenAPI/Swagger specs
- Understand available endpoints and data shapes

**WHY THIS MATTERS:** You cannot build a good dashboard for something you don't understand. A messaging system has BOTH inbound and outbound messages — if you only show one direction, the dashboard is useless. A task scheduler has inputs, outputs, run history, and failure states — showing just a list of task names misses the point. Invest 2-3 minutes understanding the domain BEFORE proposing what to build. This prevents building something technically correct but functionally useless.

**What to capture from domain discovery:**
- All available data entities and their relationships
- What data changes frequently (→ needs real-time or auto-refresh)
- What data the user would want to monitor at a glance (→ dashboard stats)
- What actions the user might want to take (→ interactive features, not just read-only)
- What would make this dashboard INDISPENSABLE — the thing that makes the user keep it open all day

### Step 2: Idea Validation

Conversational, not a checklist. Adapt based on what the user already said in Step 1. Weave these blocks naturally into the conversation — 2-3 questions per exchange, not all at once.

**TONE: Supportive product advisor, not interrogator.**
- "We" language: "Let's figure out..." not "Tell me..."
- Validate before challenging: "That's a solid idea. One thing I'd push on..."
- 2-3 questions per exchange, not 10
- Escape hatch: if user says "just build it" → wrap up gracefully, infer defaults for any unanswered questions

#### Block A — Target User → `targetUser`

- "Who specifically is this for? Describe your ideal user."
- Challenge vague answers: "The best apps serve one type of person really well. 'Everyone' means no one — can you narrow it down?"
- Good: "Households with 2+ adults sharing responsibilities"
- Too vague: "People who need to be organized"

#### Block B — Problem → `problem`

- "What frustrates these people right now? What do they currently do to solve this?"
- Challenge weak problems: "How bad is this — daily annoyance or occasional inconvenience? The best apps solve problems people think about every day."
- Good: "No single app handles chores, bills, and budgets together — they use 3 separate apps"
- Too weak: "It would be nice to have"

#### Block C — Competitors → `competitors`

- "What do people currently use for this?" (let the user answer first)
- Claude mentions 1-2 known alternatives from its own knowledge: "I know [X] and [Y] are in this space — have you looked at those?"
- Only web search if user opts in: "Want me to do a quick search for what else is out there?"
- Full market research (2.3) stays as a future enhancement
- Capture as array: `["Splitwise (bills only)", "Tody (chores only)", "YNAB (budgets only)"]`

#### Block D — Unique Angle → `uniqueAngle`

- "So [competitors] exist. What makes YOUR version worth switching to?"
- Challenge weak angles: "Being 'simpler' is hard to compete on alone — simplicity is table stakes. What's the thing they CAN'T get elsewhere?"
- Good: "All-in-one for households, not just one category"
- Too weak: "It'll be better designed"

#### Assumption Challenges (weave in naturally where relevant)

- Landing page for small/internal tool → "If this is for your household or a small group, skip the landing page — build the core experience first. You can add marketing later."
- Payments in v1 → "Many successful apps launch free to validate demand first. Do you need payments from day 1, or can that wait?"
- Too many features → "You've mentioned a lot of great ideas. Let's sort them in Step 3 — some are essential for launch, others can come after you have users."

### Step 3: MVP Scope Definition

Compile all features mentioned in Steps 1-2 and propose a v1/v2 split:

```
Based on what you've told me, here are all the features you've mentioned:

1. [Feature A] — [description]
2. [Feature B] — [description]
3. [Feature C] — [description]
...

For v1, I'd recommend starting with these [3]:
- [Feature A] — core to the value proposition
- [Feature B] — needed for Feature A to work
- [Feature C] — users expect this in a [category] app

These can wait for v2:
- [Feature D] — nice-to-have, not needed for first value
- [Feature E] — complex, better after validating demand

Does this split feel right? Move anything between v1 and v2?
```

#### Scope Gating Rules

| Dimension | Recommended | Hard Max | Challenge Script |
|-----------|------------|----------|------------------|
| MVP features | 3-4 | 5 | "The best v1s focus on 3 things done well. Which could wait?" |
| Pages (feature areas) | 5-6 | 7 | "Every extra page is more to build, test, and maintain." |
| Skills | 2 | 3 | "Each skill adds complexity. Which 3 are essential for launch?" |
| User-facing models | 3-4 | 5 | "Can any of these be fields on another model instead?" |

**Page bundling:** CRUD for one entity (list + detail + create + edit) counts as 1 feature area, not 4 pages. Dashboard and Settings don't count against the limit.

#### Skill Justification Required

Don't auto-include skills just because they sound useful. Require justification for these:

- **Charts** → "What decision would charts help users make?"
- **Payments** → "Will users pay from day 1?"
- **Admin panel** → "Who is the admin? Just you = database viewer is enough."
- **i18n** → "Do you have users who need another language right now?"
- **AI features** → "What specific task does the AI help with?"

Captures: `mvpFeatures[]`, `v2Features[]`, `needsLandingPage`, `needsPayments`

### Step 4: "What should it be able to do?"

Now select skills informed by the scope decisions from Step 3. Only ask questions relevant to their category and MVP features — don't dump all 15 options:

- "Will people need accounts?" → Auth is already included
- "Will you charge money?" → stripe skill (only if `needsPayments` is true from Step 3)
- "Do you want AI features?" → "Should the AI run on your computer (free, private) or in the cloud (small cost per use)?" → ollama / cloud-llm
- "Will people upload files?" → file-uploads skill
- "Should things update in real-time?" → realtime-chat skill
- "Do you need charts or dashboards?" → charts skill (require justification)
- "Does location matter?" → maps skill
- "Should the app send emails?" → email skill
- "Do you need an admin area?" → admin-panel skill (require justification)
- "Multiple languages?" → i18n skill (require justification)

#### Checkpoint 1: Confirm skills

Before moving on, present the selected skills. Enforce the 3-skill max from Step 3:

```
Based on what you've told me, here's what I'll set up:

Included by default:
- Authentication (accounts, sign-in, sign-up)
- Dashboard with stats
- Settings page

Skills I'll install ([N] of 3 max):
- [skill] — [one-line reason tied to an MVP feature]
- [skill] — [one-line reason tied to an MVP feature]

Anything to add or remove?
```

If the user wants more than 3 skills, challenge: "Each skill adds complexity. Which 3 are essential for launch? The others can be added in v2 — the skills system makes it easy to install them later."

#### Skill Safety Constraints (enforce silently)

These combinations are auto-enforced — don't ask, just include:
- `stripe` → auto-include `email` (receipts and billing notifications need email)
- `realtime-chat` → auth is already included, but verify WebSocket config
- `deploy-cloudflare` → auto-require `deploy-docker`
- `deploy-coolify` → auto-require `deploy-docker`
- `deploy-vps` → auto-require `deploy-docker`
- `admin-panel` → auto-include `rbac` (admin needs role separation)
- `notifications-push` → auth required (already included)

If a user selects conflicting skills, resolve silently:
- `ollama` + `cloud-llm` → both is fine, offer unified interface
- `deploy-vercel` + `deploy-docker` → warn: "Vercel handles deployment for you, so you won't need Docker. Want Vercel (simpler) or Docker (more control)?"

### Step 5: "What things does your app track?"

Scoped to MVP features only. Reference the v1 feature list from Step 3:

Ask: "Based on your v1 features ([list MVP features]), what are the main things your app needs to track? For example, a recipe app tracks recipes and ingredients."

Translate their concepts into:
- Prisma models in `prisma/schema.prisma`
- tRPC routers in `src/trpc/routers/`
- Pages in `src/app/(app)/`

Enforce the model limit from Step 3 (recommended 3-4, hard max 5 user-facing models). If the user describes more:
- "Can any of these be fields on another model instead of a separate model?"
- "Which of these are essential for your v1 features, and which support v2 features?"

#### Checkpoint 2: Confirm data model

Present the models before generating code:

```
Here are the things your app will track ([N] models, max 5):

[Model Name]
  - [field]: [type] — [what it's for]
  - [field]: [type] — [what it's for]
  - Connected to: [related model]

[Model Name]
  ...

+ User (built-in from auth)

Does this capture everything for v1? Anything missing or wrong?
```

### Step 6: "What screens do you need?"

Scoped to MVP features. Suggest based on their entities and enforce page limits:

- Dashboard with stats → dashboard page + stat-card components
- List/table view → data-table with sort/filter
- Create/edit forms → form pages with Zod validation
- Detail pages → detail-layout with sidebar
- Settings → settings-layout with tabs
- Landing page → only if `needsLandingPage` is true from Step 3
- Onboarding → wizard component for first-run setup

**Page bundling:** CRUD for one entity (list + detail + create + edit) counts as 1 feature area. Dashboard and Settings don't count against the 7-page limit.

**IMPORTANT**: For each screen, confirm:
- What does it show when empty? (first-time user experience)
- What data is displayed? (determines the loading skeleton shape)
- What actions can the user take? (determines buttons and forms)

#### Checkpoint 3: Confirm page list

```
Here are all the screens I'll build ([N] feature areas, max 7):

Pages:
- Dashboard — stats overview, recent activity, quick actions
- [Entity] List — searchable table with sort/filter
- [Entity] Detail — full view with [sidebar info]
- Create [Entity] — form with [fields]
- Settings — General, [other tabs]
[- Landing — public page (only if needed)]

Each page will include:
- Loading skeleton (so it never flashes blank)
- Empty state (helpful message + action button when there's no data)
- Error handling (retry button if something goes wrong)
- Mobile layout (works on phones)

Total: [N] pages across [N] feature areas. Ready to move on?
```

If total feature areas exceed 7: "Every extra page is more to build, test, and maintain. Which feature areas could wait for v2?"

### Step 7: "Who needs to access this?"

Ask deployment questions:
- "Just for you?" → No deploy skill, stay on dev mode
- "Share with friends/team, have a server?" → deploy-tailscale
- "Share with friends/team, no server?" → deploy-cloudflare or deploy-vercel
- "Public app, don't want to manage servers?" → deploy-vercel
- "Public app, have a VPS?" → deploy-vps
- "Use Docker?" → deploy-docker
- "Use Coolify?" → deploy-coolify

Always explain: "I'd recommend [X] because [reason]. It costs about [Y]/month."

### Step 8: "Let's pick a vibe"

Confirm the app name if not already established during the conversation, then present vibe options:

```
What vibe fits your app?

1. Friendly (Default) — Warm teal + warm neutrals. Approachable, modern.
2. Professional — Deep blue + cool grays. Corporate, trustworthy.
3. Creative — Vibrant purple + warm tones. Expressive, playful.
4. Bold — Hot coral/red + dark neutrals. Energetic, attention-grabbing.
5. Minimal — Near-black primary + pure neutrals. Ultra-clean, content-first.
6. Custom — Pick your own primary color.
```

Each vibe defines a complete palette: primary color, background warmth/coolness, border tones, chart colors, and sidebar tint. The user picks a vibe, not individual colors — this prevents clashing palettes.

#### Vibe Palettes

Each vibe sets ALL color tokens in `globals.css` (both `:root` and `.dark`). The key tokens that change per vibe:

| Token | What changes |
|-------|-------------|
| `--primary` | Brand color (buttons, links, active states, ring) |
| `--ring` | Same as primary |
| `--sidebar-primary` | Same as primary |
| `--sidebar-ring` | Same as primary |
| `--background` | Warm (`#f8f7f6`) or cool (`#f7f7f8`) base |
| `--foreground` | Warm (`#1c1b1a`) or cool (`#1b1b1f`) text |
| `--border`, `--input` | Warm or cool gray tint |
| `--muted`, `--secondary`, `--accent` | Warm or cool surface tints |
| `--chart-1` through `--chart-5` | Harmonious set that works with the primary |

**Reference palettes (hex values):**

**Friendly (default — already in globals.css):**
- Primary: `#2AB4A0` (teal)
- Backgrounds: warm brown undertones
- Charts: `#6C7AE0`, `#3DBDA7`, `#E0965C`, `#D4698A`, `#9B8AE0`

**Professional:**
- Primary: `#4A6CF7` (deep blue)
- Backgrounds: cool gray undertones
- Charts: `#4A6CF7`, `#38BDF8`, `#34D399`, `#FBBF24`, `#F472B6`

**Creative:**
- Primary: `#8B5CF6` (vibrant purple)
- Backgrounds: warm with a hint of purple
- Charts: `#8B5CF6`, `#EC4899`, `#F59E0B`, `#10B981`, `#3B82F6`

**Bold:**
- Primary: `#EF4444` (coral/red)
- Backgrounds: dark warm neutrals
- Charts: `#EF4444`, `#F97316`, `#FBBF24`, `#A855F7`, `#3B82F6`

**Minimal:**
- Primary: `#374151` (near-black)
- Backgrounds: pure neutrals (no warm/cool tint)
- Charts: `#374151`, `#6B7280`, `#9CA3AF`, `#D1D5DB`, `#4B5563`

When the user selects a vibe, update ALL color tokens in both `:root` and `.dark` sections of `src/app/globals.css`. Do NOT just change `--primary` — update the full palette so backgrounds, borders, and surfaces harmonize with the primary color.

If the user picks "Custom", ask for a hex color and generate a harmonious palette from it (warm neutrals if the color is warm, cool if cool).

Save the chosen vibe to `.vibekit/intent.json`:
```json
{
  "vibe": "friendly",
  "primaryColor": "#2AB4A0"
}
```

### Step 9: Build Plan Approval

Present the complete build manifest before any code generation. This replaces the old final confirmation — it's comprehensive, not abbreviated.

```
Here's the complete build plan for [App Name]:

PROBLEM
[One sentence from Step 2]

TARGET USER
[One sentence from Step 2]

UNIQUE ANGLE
[One sentence from Step 2]

WHAT I'LL BUILD

  Models ([N]):
  - [Model] — [key fields] — for [MVP feature]
  ...
  + User (built-in)

  API Routers ([N] routers, [M] procedures):
  - [router]: list, byId, create, update, delete
  ...

  Pages ([N]):
  - Dashboard — stats, recent activity
  - [Entity] List — searchable table
  - [Entity] Detail — full view
  - Create [Entity] — form
  - Settings — profile, preferences
  [+ Landing page if needed]

  Skills ([N]):
  - [skill] — [reason tied to MVP feature]
  ...

  Deployment: [choice]
  Design: [vibe] ([color])

DEFERRED TO V2
- [feature] — [reason it can wait]
...

Approve this plan, or tell me what to change.
```

**CRITICAL:** Claude must NOT generate any code until the user explicitly approves the build plan. If the user requests changes, update the plan and re-present it. Only proceed to Step 10 after clear approval (e.g., "looks good", "approved", "let's go", "build it").

---

## Step 10: Build

### Build Phase (follow this order exactly, with verification after each step)

#### 10a. Compile Build Spec

Translate the interview results into `.vibekit/build-spec.json` — a structured JSON config that the code generators consume to produce all standard files. The LLM writes this file directly.

##### Build Spec Field Reference

**Top-level fields:**

| Field | Source | Example |
|-------|--------|---------|
| `appName` | `intent.json.appName` | `"HomeBase"` |
| `models` | Interview Steps 5 + 3 (entities + scope) | See Model Spec below |
| `sidebar` | Interview Step 6 (pages) | Always: Dashboard, one per model, Settings |
| `dashboard` | Interview Step 6 | Description from intent, pick most active model for recent |
| `settings` | Default | `{ "tabs": [{ "label": "General", "href": "/settings/general" }] }` |

**Model spec — mapping from interview to JSON:**

| Field | How to derive | Example |
|-------|--------------|---------|
| `name` | PascalCase entity name from Step 5 | `"Chore"` |
| `slug` | Lowercase plural for URL path | `"chores"` |
| `label` | Human-readable plural | `"Chores"` |
| `labelSingular` | Human-readable singular | `"Chore"` |
| `icon` | Pick from Lucide icons matching the entity's domain (see Icon Guide below) | `"CheckSquare"` |
| `iconColor` | Cycle through palette: 1st model blue, 2nd emerald, 3rd amber, 4th violet | `"text-emerald-500"` |
| `fields` | From Step 5 entity fields (see Field Spec below) | See example |
| `belongsTo` | FK relationships to OTHER app models (NOT User — User is auto-added) | `[{ "model": "Household", "field": "householdId" }]` |
| `hasMany` | Model names that have a belongsTo pointing to THIS model | `["Chore", "Bill"]` |
| `searchFields` | Text fields users would search by (name/title + description if exists) | `["title", "description"]` |
| `defaultSort` | Almost always `"updatedAt"` | `"updatedAt"` |

**Field spec — mapping from interview to JSON:**

| Field | Rule | Example |
|-------|------|---------|
| `name` | camelCase field name | `"dueDate"` |
| `type` | Map from interview: text→`"String"`, number→`"Int"` or `"Float"`, yes/no→`"Boolean"`, date→`"DateTime"` | `"DateTime"` |
| `required` | `true` for name/title fields and key data. `false` for descriptions, dates, optional fields | `false` |
| `maxLength` | `255` for short strings (names, titles). `1000`-`2000` for descriptions. Omit for non-strings | `255` |
| `enum` | For constrained-value fields (status, priority, category, type). List all valid values | `["pending", "in_progress", "completed"]` |
| `defaultEnum` | Default value for enum fields | `"pending"` |
| `showInList` | `true` for the display field (name/title) + 1-3 key fields users scan in a table. `false` for descriptions, long text | `true` |
| `showInDetail` | `true` (default) for all fields. Set `false` only to hide a field from the detail sidebar | `true` |
| `listLabel` | Override column header if the camelCase→Title conversion isn't good enough | `"Amount"` |

**belongsTo rules:**
- Only include relationships to OTHER app models (e.g., Chore → Household)
- Do NOT include User — every model gets `userId` automatically
- The `field` is always `{lowerCaseModelName}Id` (e.g., `"householdId"`)

**hasMany rules:**
- List model NAMES (PascalCase) that reference this model via belongsTo
- Only the parent model lists its children. The child model uses belongsTo instead
- Example: Household hasMany `["Chore", "Bill"]` because both Chore and Bill belongTo Household

##### Icon Guide

Pick icons from [Lucide](https://lucide.dev) that match the entity's domain:

| Domain | Recommended Icons |
|--------|------------------|
| Home / household | `Home`, `Building`, `Building2` |
| Tasks / chores | `CheckSquare`, `ListTodo`, `ClipboardList`, `CircleCheck` |
| Money / bills / payments | `Receipt`, `DollarSign`, `CreditCard`, `Wallet`, `Banknote` |
| People / users / teams | `Users`, `UserPlus`, `Contact` |
| Projects / work | `FolderKanban`, `Briefcase`, `Target` |
| Messages / chat | `MessageSquare`, `Mail`, `Send` |
| Files / documents | `FileText`, `Files`, `FolderOpen` |
| Calendar / events | `Calendar`, `CalendarDays`, `Clock` |
| Food / recipes | `ChefHat`, `UtensilsCrossed`, `Cookie` |
| Shopping / products | `ShoppingCart`, `Package`, `Store` |
| Health / fitness | `Heart`, `Activity`, `Dumbbell` |
| Education / learning | `GraduationCap`, `BookOpen`, `School` |
| Music / media | `Music`, `Headphones`, `Film` |
| Settings / config | `Settings`, `Wrench`, `Cog` |
| Analytics / data | `BarChart3`, `TrendingUp`, `PieChart` |
| General | `Star`, `Bookmark`, `Tag`, `Zap`, `Globe` |

##### Icon Color Palette

Assign colors in order as models are listed. Cycle through:

1. `"text-blue-500"` — first model
2. `"text-emerald-500"` — second model
3. `"text-amber-500"` — third model
4. `"text-violet-500"` — fourth model
5. Cycle back to blue for 5th, etc.

##### Sidebar Convention

Always include these entries in order:
1. Dashboard (`LayoutDashboard` icon, `/dashboard`)
2. One entry per app model (same icon as model, `/{slug}`)
3. Settings (`Settings` icon, `/settings`)

##### Dashboard Convention

- `description`: A welcome message referencing the app's purpose (e.g., `"Welcome back! Here's your household overview."`)
- `recentEntity`: The PascalCase model name of the most "active" entity — the one users interact with most frequently. For task-like apps pick the task model; for content apps pick the content model.

##### Worked Example

For a household management app with three models (from the interview):

```json
{
  "appName": "HomeBase",
  "models": [
    {
      "name": "Household",
      "slug": "households",
      "label": "Households",
      "labelSingular": "Household",
      "icon": "Home",
      "iconColor": "text-blue-500",
      "fields": [
        { "name": "name", "type": "String", "required": true, "maxLength": 255, "showInList": true },
        { "name": "description", "type": "String", "required": false, "maxLength": 1000 }
      ],
      "belongsTo": [],
      "hasMany": ["Chore", "Bill"],
      "searchFields": ["name", "description"],
      "defaultSort": "updatedAt"
    },
    {
      "name": "Chore",
      "slug": "chores",
      "label": "Chores",
      "labelSingular": "Chore",
      "icon": "CheckSquare",
      "iconColor": "text-emerald-500",
      "fields": [
        { "name": "title", "type": "String", "required": true, "maxLength": 255, "showInList": true },
        { "name": "description", "type": "String", "required": false, "maxLength": 2000 },
        { "name": "status", "type": "String", "required": false, "enum": ["pending", "in_progress", "completed"], "defaultEnum": "pending", "showInList": true },
        { "name": "priority", "type": "String", "required": false, "enum": ["low", "medium", "high"], "defaultEnum": "medium", "showInList": true },
        { "name": "dueDate", "type": "DateTime", "required": false }
      ],
      "belongsTo": [{ "model": "Household", "field": "householdId" }],
      "hasMany": [],
      "searchFields": ["title", "description"],
      "defaultSort": "updatedAt"
    },
    {
      "name": "Bill",
      "slug": "bills",
      "label": "Bills",
      "labelSingular": "Bill",
      "icon": "Receipt",
      "iconColor": "text-amber-500",
      "fields": [
        { "name": "title", "type": "String", "required": true, "maxLength": 255, "showInList": true },
        { "name": "amount", "type": "Float", "required": true, "showInList": true, "listLabel": "Amount" },
        { "name": "status", "type": "String", "required": false, "enum": ["pending", "paid", "overdue"], "defaultEnum": "pending", "showInList": true },
        { "name": "dueDate", "type": "DateTime", "required": false }
      ],
      "belongsTo": [{ "model": "Household", "field": "householdId" }],
      "hasMany": [],
      "searchFields": ["title"],
      "defaultSort": "updatedAt"
    }
  ],
  "sidebar": [
    { "title": "Dashboard", "href": "/dashboard", "icon": "LayoutDashboard" },
    { "title": "Households", "href": "/households", "icon": "Home" },
    { "title": "Chores", "href": "/chores", "icon": "CheckSquare" },
    { "title": "Bills", "href": "/bills", "icon": "Receipt" },
    { "title": "Settings", "href": "/settings", "icon": "Settings" }
  ],
  "dashboard": {
    "description": "Welcome back! Here's your household overview.",
    "recentEntity": "Chore"
  },
  "settings": {
    "tabs": [
      { "label": "General", "href": "/settings/general" }
    ]
  }
}
```

**What this produces:** 3 Prisma models with relations and indexes, 3 tRPC routers (15 procedures), 13 pages (list + detail + create + edit per model + dashboard), sidebar with 5 nav items, and seed data — all in seconds.

**Verify**: The build-spec is valid JSON and all model names referenced in `belongsTo`, `hasMany`, `sidebar`, and `dashboard.recentEntity` match actual model names in the spec.

#### 10b. Run Code Generators

```bash
npx tsx generators/compose.ts
```

This produces ALL standard files in seconds:
- Prisma models (appended to `schema.prisma`)
- tRPC routers (5 procedures each: list, byId, create, update, delete)
- List pages (server + client component + loading skeleton)
- Detail pages (sidebar + content + loading skeleton + delete button)
- Form pages (create + edit + loading skeletons)
- Dashboard (stat cards + recent entity)
- Sidebar navigation
- Seed data

**Verify**: Generator completes without errors.

#### 10c. Install Skills

```bash
npx tsx skills-engine/index.ts apply <name>
```
**Verify**: Each skill installs without errors. If a skill fails, diagnose and fix before continuing — don't skip it and hope for the best.

#### 10d. Push Database + Verify Generated Code

```bash
pnpm db:push
pnpm build
```

**Verify**: Both commands succeed. If the build fails, fix the issue (likely a generator bug or skill conflict) and re-run. Catch errors early — do NOT proceed with a broken build.

#### 10d-checkpoint. Commit: generated scaffolding
```bash
git add -A && git commit -m "feat: add generated scaffolding"
```
This creates a save point. The generators produced all standard CRUD pages. If the customization pass introduces issues, you can revert to this.

#### 10e. LLM Customization Pass

The generators produce functional CRUD scaffolding. This step elevates it from "works" to "impresses." The user's expectation is that the output EXCEEDS what they imagined — not that they have to troubleshoot or feel underwhelmed. Spend real effort here.

##### What to customize:

- **Business logic** — Custom validation rules, computed fields, non-standard workflows
- **Skill integration** — Wire skill-specific features into generated pages (e.g., file upload fields, chart components)
- **Branding** — Apply the user's chosen vibe palette to `globals.css`
- **Non-standard pages** — Any pages that don't follow the standard CRUD pattern
- **Landing page** — If `needsLandingPage` is true, customize the landing page content
- **Polish and richness** — See Feature Richness Checklist below

##### Feature Richness Checklist (MANDATORY)

The generators produce bare CRUD. The customization pass must elevate every page. Go through each category and add what's relevant:

**Dashboard must feel alive and useful:**
- Stat cards with colored icons, trends or context (not just raw numbers — add "↑ 3 this week" or "12 pending")
- Recent activity showing the 5 most recent items with key details, relative timestamps ("2 hours ago"), and status badges
- Quick action buttons (create new item, go to most urgent item)
- First-run experience: when the user has zero data, show a "Getting Started" card with 3-4 setup steps and progress indicators instead of empty stat cards showing all zeros
- If the app has status/priority fields, show a breakdown (e.g., "4 pending, 2 in progress, 1 completed")
- Use `StaggerList` animation on the stat cards grid

**List pages must feel powerful, not like a basic table:**
- Working search that filters by relevant text fields (not just exact match — case-insensitive contains)
- Status/priority/category badges with distinct colors (use `enumColorMap` pattern)
- Relative timestamps for dates ("2 hours ago", "Yesterday", not raw ISO strings)
- Row click navigates to detail page (not just an actions dropdown)
- Sort indicators on clickable column headers
- Pagination that shows "Showing 1-10 of 47"
- Bulk select + bulk actions where it makes sense (e.g., mark multiple tasks complete)
- Filter tabs or dropdown for enum fields (e.g., "All | Pending | Completed")

**Detail pages must feel comprehensive:**
- Organize content in clear sections, not just a dump of all fields
- Related items displayed inline (if model has `hasMany` relations, show a mini-list of children)
- Metadata footer: "Created 3 days ago · Updated 2 hours ago"
- Edit and Delete buttons prominently placed in the header
- Breadcrumb trail: Dashboard > Recipes > Pasta Carbonara
- If there's a description/notes field, render it with proper typography (not crammed into a badge)

**Forms must feel thoughtful:**
- Smart defaults that reduce typing (today's date for date fields, "pending" for status)
- Field descriptions/hints for non-obvious fields (gray helper text below the input)
- Proper field types: date picker for dates, number input for numbers, textarea for long text, select for enums
- Character count indicator for text fields with maxLength
- Inline validation — show errors immediately when the user leaves a field, not just on submit
- Cancel button returns to where the user came from (router.back())

**Overall polish that makes the app feel professional:**
- Page transitions using `FadeIn`/`SlideUp` from `motion.tsx`
- Toast notifications for ALL mutations (create, update, delete) with descriptive messages
- Confirmation dialogs for destructive actions (delete) with the item name in the message
- Consistent use of the chosen vibe's color palette on interactive elements
- Tab titles that include the page context (e.g., "Pasta Carbonara | RecipeVault")
- No raw enum values displayed — always `camelToTitle()` or proper labels

**Page Type Reference** (for any custom pages that need manual creation):

| Page Type | Server `page.tsx` | Client `_components/` | Data Access |
|-----------|-------------------|----------------------|-------------|
| Dashboard | `caller.user.stats()` + `caller.entity.list({ pageSize: 5 })` | N/A (server component) | Stats object + `recentItems.items` |
| List | `void trpc.entity.list.prefetch({})` → `<HydrateClient>` | `entity-list.tsx`: `trpc.entity.list.useQuery({})` | `data?.items.length`, `data.items` |
| Detail | `caller.entity.byId({ id })` + try/catch → `notFound()` | Optional: `delete-entity-button.tsx` | Single record directly |
| Create | N/A (client `"use client"` page) | `useForm({ resolver: zodResolver(schema), defaultValues })` + `trpc.entity.create.useMutation()` | Form state |
| Edit | N/A (client `"use client"` page) | `trpc.entity.byId.useQuery({ id })` + `useForm({ values })` + `trpc.entity.update.useMutation()` | Query → form values |

See `.claude/docs/adding-a-page.md` for complete code patterns per page type.

#### 10g. Seed and Verify
```bash
pnpm db:push && pnpm db:seed
pnpm build
```

**Verify**: Build passes with zero errors. If it fails, fix and re-run. Do NOT skip the build check.

#### 10h. Generate Documentation Vault

Create the `docs/` Obsidian vault with real content from the interview and build. This is the project's structured knowledge base — PRDs, decision records, engineering docs, and feature specs.

##### 10h-1. Create `.obsidian/` config

Create these files for a ready-to-open Obsidian vault:

**`docs/.obsidian/app.json`:**
```json
{
  "showLineCount": true,
  "strictLineBreaks": true,
  "showFrontmatter": false,
  "livePreview": true,
  "defaultViewMode": "preview",
  "readableLineLength": true,
  "showInlineTitle": true,
  "tabSize": 2,
  "attachmentFolderPath": "assets",
  "newFileLocation": "folder",
  "newFileFolderPath": "features"
}
```

**`docs/.obsidian/appearance.json`:**
```json
{
  "baseFontSize": 16,
  "interfaceFontSize": 14,
  "cssTheme": "",
  "theme": "obsidian"
}
```

**`docs/.obsidian/core-plugins.json`:**
```json
{
  "file-explorer": true,
  "global-search": true,
  "graph-view": true,
  "backlink": true,
  "outgoing-link": true,
  "tag-pane": true,
  "page-preview": true,
  "command-palette": true,
  "editor-status": true,
  "starred": true,
  "outline": true,
  "templates": false,
  "daily-notes": false,
  "word-count": true,
  "file-recovery": true,
  "workspaces": false,
  "note-composer": false,
  "audio-recorder": false,
  "canvas": false,
  "publish": false,
  "sync": false,
  "slides": false,
  "switcher": true,
  "properties": true
}
```

**`docs/.obsidian/graph.json`:**
```json
{
  "collapse-filter": false,
  "search": "",
  "showTags": true,
  "showAttachments": false,
  "hideUnresolved": false,
  "showOrphans": true,
  "collapse-color-groups": false,
  "colorGroups": [
    { "query": "path:product", "color": { "a": 1, "rgb": 5765887 } },
    { "query": "path:decisions", "color": { "a": 1, "rgb": 16744448 } },
    { "query": "path:engineering", "color": { "a": 1, "rgb": 65408 } },
    { "query": "path:features", "color": { "a": 1, "rgb": 16711935 } }
  ],
  "collapse-display": false,
  "lineSizeMultiplier": 1,
  "nodeSizeMultiplier": 1
}
```

Do NOT create `workspace.json` — Obsidian generates it on first open.

##### 10h-2. Copy template files

Copy the two templates that ship with vibekit:
- `docs/decisions/_template.md` — already exists
- `docs/features/_template.md` — already exists

##### 10h-3. Generate vault documents

Read `.vibekit/intent.json` for interview data. Read `prisma/schema.prisma` for the data model. Read `src/trpc/routers/*.ts` for the API surface. Generate these documents with REAL content — not templates, not placeholders.

Every document must have YAML frontmatter with `type`, `status`, and `created` fields.
Use `[[wiki-links]]` for cross-references between docs (shortest unambiguous name).

**`docs/_index.md`** — Vault home and navigation map:
- App name and one-line description (from `intent.json.description`)
- Quick Links organized by category (wiki-links to every doc)
- "For AI Agents" section: "Start here. Read `[[prd]]` for product context. Read `[[data-model]]` and `[[api-reference]]` for technical context. Check `[[roadmap]]` for what's planned."
- Vault conventions: frontmatter schema, how to add new docs

**`docs/product/prd.md`** — Product Requirements Document:
- Overview (expand `intent.json.description` into a paragraph)
- Problem Statement (`intent.json.problem`)
- Target User (`intent.json.targetUser`, link to `[[target-user]]`)
- Unique Value Proposition (`intent.json.uniqueAngle`)
- MVP Features (`intent.json.mvpFeatures`) — for each: name, one-paragraph description, acceptance criteria. Link to `[[feature-name]]` docs
- Deferred Features (`intent.json.v2Features`) — name, brief description, why deferred
- Non-Goals — what this app explicitly does NOT do
- Constraints — tech constraints (SQLite dev, skills limitations)

**`docs/product/target-user.md`** — User Persona:
- Who they are (expand `intent.json.targetUser`)
- What frustrates them (from `intent.json.problem`)
- What they currently use (`intent.json.competitors`)
- What success looks like
- 2-3 day-in-the-life scenarios

**`docs/product/competitive-landscape.md`** — Competitor Analysis:
- Market overview
- Competitors table (`intent.json.competitors`): name, strengths, weaknesses, pricing
- Differentiation (`intent.json.uniqueAngle`)
- Opportunities — gaps competitors don't fill

**`docs/product/user-flows.md`** — Critical User Journeys:
- Critical Path: `Sign up → Onboarding → [First key action] → [Value delivered]`
- Per-feature flows: trigger, steps, outcome (link to `[[feature-name]]`)

**`docs/decisions/001-tech-stack.md`** — Tech Stack Decision (ADR):
- Context: building a `category` app called `appName`
- Decision: vibekit stack (Next.js, Prisma, tRPC, Auth.js, Tailwind, shadcn/ui)
- Skills installed from `intent.json.skills` with rationale
- Consequences: positives and trade-offs

**`docs/decisions/002-data-model.md`** — Data Model Decision (ADR):
- Context: what entities the app needs (from interview)
- Decision: the chosen schema with models and relationships (read `prisma/schema.prisma`)
- Alternatives considered (if discussed during interview)
- Consequences: trade-offs of the schema design

**`docs/decisions/003-mvp-scope.md`** — MVP Scope Decision (ADR):
- Context: user described N features, scoped to MVP
- Decision: what's in v1 (`mvpFeatures`) vs deferred (`v2Features`)
- For each deferred feature, why it was deferred
- Criteria for promotion: when should a v2 feature get built?

**`docs/engineering/architecture.md`** — Architecture Reference:
- Stack overview with links to `[[001-tech-stack]]`
- Directory structure
- Data flow: browser → Next.js → tRPC → Prisma → SQLite
- Authentication flow
- Route groups: `(marketing)`, `(auth)`, `(app)` with what each contains for THIS app
- Skills system overview

**`docs/engineering/data-model.md`** — Data Model Reference:
- Entity relationship summary (ASCII or mermaid diagram)
- For each Prisma model (read `prisma/schema.prisma`):
  - Name, purpose
  - Fields table: name, type, constraints, description
  - Relationships
- Data scoping strategy (userId, etc.)

**`docs/engineering/api-reference.md`** — API Reference:
- Overview: tRPC-based, all `protectedProcedure`
- For each router (read `src/trpc/routers/*.ts`):
  - Router name
  - Procedures table: name, type (query/mutation), input schema, return type, description
- Common patterns: pagination shape, error handling, auth context

**`docs/engineering/deployment.md`** — Deployment Reference:
- Prerequisites
- Environment variables (from `.env.example`, never include values)
- Deployment steps (if a deploy skill is installed, include its instructions)
- Database migration strategy

**`docs/features/{feature-name}.md`** — One per MVP feature:
- Frontmatter: `type: feature`, `status: shipped`, `feature`, `version: v1`, `related-models`, `related-routes`
- Overview
- User Story: "As a [targetUser], I want to [action] so that [benefit]"
- Data Model: which models, link to `[[data-model]]`
- Pages: routes and descriptions
- API: which tRPC procedures
- States: empty, loading, error descriptions
- Acceptance Criteria checklist
- Future Enhancements from `v2Features` if related

**`docs/roadmap.md`** — Feature Roadmap:
- Current Sprint (empty — app just launched)
- Up Next (3-5 features from `intent.json.v2Features`, PRIORITIZED by user impact)
- Future Ideas (3-5 longer-term ideas based on app type and domain knowledge)
- Completed: "Initial build — [today's date]" with summary

**Roadmap quality rules:**
- Every item must describe a concrete user benefit, not a technical task. "Real-time message streaming — see agent responses as they arrive" not "Add WebSocket support."
- Prioritize by impact: what would the user ask for FIRST? That goes at the top.
- For external system dashboards: features should be based on what data is ACTUALLY available in the external system — check the schema. Don't propose features that require data that doesn't exist.
- Include a mix of quick wins (can build in one session) and ambitious features (require multiple sessions). Label them.
- Never include generic filler like "improve performance" or "add more charts" — every item should be specific to THIS app's domain.

**`docs/changelog.md`** — Change History:
```markdown
# Changelog

## [Unreleased]

## [YYYY-MM-DD] - Initial Release

### Added
- [List every feature built in the initial setup]
```

##### 10h-4. Generate `APP.md`

Generate `APP.md` in the project root as a concise quick-reference. Follow the structure in CLAUDE.md's "Living Documentation" section:
- App name and one-paragraph description
- Tech Stack
- Data Models (every Prisma model with key fields — summary, not full detail)
- Routes & Pages
- API / tRPC Routers (every procedure)
- Installed Skills
- Environment Variables (from .env.example, never include values)
- Key Decisions

Add a **Documentation** section at the end:
```markdown
## Documentation

Full project documentation is in the `docs/` Obsidian vault. Open it in Obsidian or browse the markdown files directly.

- [Product Requirements](docs/product/prd.md)
- [Architecture](docs/engineering/architecture.md)
- [Data Model](docs/engineering/data-model.md)
- [API Reference](docs/engineering/api-reference.md)
- [Roadmap](docs/roadmap.md)
- [Changelog](docs/changelog.md)
```

##### 10h-5. Verify vault

- Every `.md` file in `docs/` has valid YAML frontmatter with `type`, `status`, `created`
- All `[[wiki-links]]` resolve to existing files in the vault
- `_index.md` links to every other document
- No TODO, FIXME, or placeholder text — every section has real content
- Feature docs reference correct models and routes from the actual build

#### 10i. Deployment (if applicable)
If a deploy skill was installed, walk through setup step by step. Each deployment skill's SKILL.md has its own guided setup.

#### 10j. Initialize git and make the first commit
```bash
git init
git add .
git commit -m "feat: initial vibekit build — [app name]"
```

If the user wants to push to GitHub:
```bash
gh repo create [app-name] --private --source=. --push
```

### Non-Standard Apps

Not every app fits the standard CRUD pattern. If the user describes something that doesn't map cleanly to "create/read/update/delete entities" — such as a monitoring dashboard, an external database viewer, a tool that wraps an existing API, or a read-only analytics app — the generators may not apply. Adapt the build flow:

#### When to skip generators

Skip `10b` (generators) when:
- The app reads from an external database instead of its own Prisma DB
- The app is primarily a dashboard/viewer with no create/edit flows
- The data model doesn't map to standard user-owned entities
- The app wraps an external API or service

#### External database apps

When the app needs to read from an external database (another app's SQLite, Postgres, etc.):

**Setup:**
- Install `better-sqlite3` (for SQLite) or the appropriate client package
- Create a connection module in `src/lib/` that opens the connection ONCE at module level
- **CRITICAL:** If the connection is read-only, do NOT set WAL pragma or any write-mode pragma. `db.pragma("journal_mode = WAL")` will throw `SQLITE_READONLY` on a read-only connection.
- Create TypeScript interfaces for every table/view being read
- Handle the case where the external DB file doesn't exist — return a clear error, don't crash

**Data flow — still use tRPC:**
- Create tRPC routers that wrap external DB queries
- The frontend uses `trpc.x.useQuery()` just like any other page
- This keeps the HydrateClient/prefetch patterns working
- Add proper error handling for connection failures

**Read-only SQLite pattern:**
```typescript
import Database from "better-sqlite3";
import { existsSync } from "fs";

const DB_PATH = process.env.EXTERNAL_DB_PATH || "/path/to/external.db";

function getDb(): Database.Database | null {
  if (!existsSync(DB_PATH)) return null;
  return new Database(DB_PATH, { readonly: true });
  // NO pragma("journal_mode = WAL") — read-only!
}
```

#### Dashboard-focused apps

For apps that are primarily dashboards (monitoring, analytics, status views):
- Make the dashboard the primary page — it should be information-dense and immediately useful
- Use cards, grids, and tables to display data compactly
- Include refresh buttons or auto-refresh for real-time data
- Group related metrics with clear section headers
- Use the `charts` skill if data visualization adds value
- Add drill-down: clicking a metric should navigate to a detailed view

#### Quality bar for non-standard apps

Even when skipping generators, maintain the SAME quality bar:
- Every page needs `loading.tsx` with layout-matching skeletons
- Every data view needs an empty state and error state
- Use the same component library (shadcn/ui, PageHeader, EmptyState, etc.)
- Follow the same spacing rules (`p-4 md:p-6`, `space-y-6`)
- Use the HydrateClient pattern for pages with client interactivity
- Apply the chosen vibe palette
- **All the Feature Richness Checklist items from Step 10e still apply**

### Programmatic Verification (run before the manual checklist)

After the build passes, run these automated checks:

```
For every page.tsx under src/app/(app)/:
  1. Check that a loading.tsx exists in the same directory
  2. Grep the page or its client components for "EmptyState" — every list page must use it
  3. Grep for error handling (onError, error boundary, or error state rendering)
  4. Grep for TODO, FIXME, "goes here", or similar stub markers — any found means the page is not done

For each skill listed in the build plan or .vibekit/intent.json:
  1. Verify at least one component, route, or page imports or uses the skill
  2. If a skill was installed but not integrated, either integrate it now or remove it:
     npx tsx skills-engine/index.ts remove <name>
```

If any check fails, fix it before continuing. Do not ship stubs or unused skills.

### Post-Build Verification (MANDATORY)

After building, verify EVERY generated page against this checklist:

| Check | How to Verify |
|-------|---------------|
| Loading state | Does `loading.tsx` exist? Does its skeleton match the page layout? |
| Empty state | What happens with zero data? Is there a helpful EmptyState with action button? |
| Error state | What happens when the API fails? Is there a retry button? |
| Mobile layout | Does it look right at 375px? No overflow? Touch targets ≥ 44px? |
| Consistent spacing | Is page padding `p-4 md:p-6`? Are sections `space-y-6`? |
| Data propagation | After mutations, do all affected pages update? |
| Navigation | Is the page in the sidebar? Can the user get there and back? |
| First-run experience | What does a brand new user see? Is it helpful, not empty? |
| Long text | What happens with a 200-character name? Does it truncate or break the layout? |
| Missing fields | If optional fields are empty, is there a blank gap or graceful fallback? |
| Many items | With 100+ items, is there pagination? Or does the page choke? |
| Single item | Does a 1-item list/grid still look right? No weird empty columns? |
| Rapid clicks | If you click "Create" 5 times fast, does it create 5 duplicates? Buttons should disable during async. |

If ANY check fails, fix it immediately. Do not move on to the next page.

### Self-Assessment (MANDATORY — do this BEFORE showing the summary)

After verification passes, step back and critically evaluate what you built. Ask yourself these questions and FIX any issues before presenting the summary:

**Does the data make sense?**
- For a messaging/chat system: Can the user see BOTH sides of conversations (sent AND received)? If not, the dashboard is broken.
- For a monitoring system: Does the data feel alive? Is there auto-refresh or timestamps showing how current the data is?
- For a task/job system: Can the user see inputs, outputs, success/failure, and history — not just a list of names?
- For any system with relationships: Can the user navigate between related items? (e.g., click a group to see its messages, click a task to see its runs)

**Would the user keep this open all day?**
- If the dashboard only shows static lists of data, it's a database viewer, not a dashboard. Add: real-time indicators, status summaries, trend information, or actionable items.
- If the user has to go to the terminal/CLI to do common tasks, the dashboard isn't useful enough. Add interactive features for the most common actions.

**Is anything obviously missing?**
- Think about what someone who uses this system DAILY would expect. What would they check first thing in the morning? That should be on the dashboard.
- If the system has error states or failure modes, can the user see them? Errors and failures are usually the #1 reason someone checks a dashboard.
- If there are logs, can the user search and filter them? Raw log dumps are useless — add search, level filtering, and time ranges.

**Is the roadmap actually useful?**
- The roadmap should list specific, prioritized features based on what the system's data supports — not generic items like "add more charts" or "improve performance."
- Each roadmap item should describe a concrete user benefit: "Real-time message streaming — see agent responses as they arrive, not after refreshing" is good. "Add WebSocket support" is too technical and vague.
- Prioritize by user impact: what would the user ask for FIRST if they could only build one more thing?

**If any of these checks reveal a gap, fix it now.** It's cheaper to add a missing feature before presenting the summary than to have the user discover it's missing and lose confidence.

### Post-Build Summary

After everything passes, present a summary to the user:

```
Your app is ready!

[App Name] is running at http://localhost:3000

What I built:
- [N] data models: [names]
- [N] pages: [names]
- [N] API endpoints across [N] routers
- Skills installed: [names]

What's next:
- Run `pnpm dev` to start the app
- Check `docs/roadmap.md` for planned features
- Use `/add-feature` to build the next feature
- Use `/roadmap` to manage your feature backlog
- Open `docs/` in Obsidian for full project documentation

Everything is documented in APP.md (quick reference) and the docs/ vault (deep reference). I'll keep both updated as we build.
```

---

## Feature-to-Skill Mapping

| Feature | Skill |
|---------|-------|
| AI (local) | ollama |
| AI (cloud) | cloud-llm |
| Payments | stripe |
| File storage | file-uploads |
| Email | email |
| Real-time chat | realtime-chat |
| Maps | maps |
| Charts | charts |
| PDF generation | pdf |
| Background jobs | background-jobs |
| Admin panel | admin-panel |
| Push notifications | notifications-push |
| Analytics | analytics |
| Role-based access | rbac |
| Multi-language | i18n |

## Common Pitfalls (from real projects)

These are the mistakes people actually make. Avoid them:

1. **Skipping empty states** — "I'll add those later." You won't. Every list/table needs one from day 1.
2. **Inconsistent padding** — One page uses `p-3`, another `p-6`, another `p-4`. Use `p-4 md:p-6` everywhere.
3. **Missing loading skeletons** — White flash or spinner instead of layout-matching skeleton. Create `loading.tsx` for every page.
4. **Forgetting data propagation** — User creates an item, navigates to dashboard, dashboard still shows old count. Invalidate ALL affected queries.
5. **Desktop-first layout** — Looks great on desktop, broken on mobile. Start with 375px, add breakpoints up.
6. **No error handling** — API fails → blank page. Every fetch needs an error state with retry.
7. **Onboarding as afterthought** — First-run experience should be designed first, not bolted on after launch.
8. **Hover-only interactions** — Tooltips, dropdowns, actions only visible on hover. Mobile users can't hover.
9. **Building without a plan** — Jumping straight to code without confirming models, pages, and skills leads to rework. Always present the plan first.
10. **Skipping verification checkpoints** — "It probably works" is not verification. Run the build, check the states, test the flow.
11. **Passing functions across server/client boundary** — Lucide icons are React components (functions). You CANNOT pass them as props from a server component to a client component — Next.js will throw "Functions cannot be passed directly to Client Components." Fix: (a) use HydrateClient pattern so the client component renders everything including icons, (b) pass icon names as strings and map to components in the client, or (c) import icons directly in the client component. See CLAUDE.md "Server/Client Boundary" section.
12. **WAL pragma on read-only databases** — If connecting to an external SQLite database with `{ readonly: true }`, do NOT call `db.pragma("journal_mode = WAL")` or any write-mode pragma. It will throw `SQLITE_READONLY`. Skip all write pragmas for read-only connections entirely.
13. **Interactive CLI tools during build** — Commands like `pnpm approve-builds` show interactive TUIs that Claude Code cannot drive. Always check for `--yes` or `--non-interactive` flags. If none exist, warn the user and let them run it manually.
14. **Bare minimum output** — Building functional-but-sparse pages is not enough. Users expect to be IMPRESSED, not just unblocked. A dashboard with four zero-value stat cards and an empty recent list is disappointing. Add first-run guidance, smart defaults, contextual help, and polish. See the Feature Richness Checklist in Step 10e.
15. **Excessive codebase exploration** — Don't spend 50+ tool calls reading every file in the repo before starting to build. Read CLAUDE.md, APP.md, and the specific files you need. The documentation is designed to give you everything you need without reading every source file.
