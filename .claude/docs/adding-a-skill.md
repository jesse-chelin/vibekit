# Adding a Custom Skill

## Structure

```
skills/my-skill/
├── manifest.json
├── SKILL.md
├── add/          # New files to add
│   └── src/
│       └── lib/my-feature.ts
└── modify/       # Modified versions of existing files (for 3-way merge)
    └── src/trpc/router.ts
```

## manifest.json

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "description": "What this skill does",
  "category": "feature",
  "adds": ["src/lib/my-feature.ts"],
  "modifies": ["src/trpc/router.ts"],
  "dependencies": {
    "npm": { "some-package": "^1.0.0" },
    "env": ["MY_API_KEY"],
    "skills": []
  },
  "conflicts": [],
  "postInstall": []
}
```

## Install

```bash
npx tsx skills-engine/index.ts apply my-skill
```

## Remove

```bash
npx tsx skills-engine/index.ts remove my-skill
```
