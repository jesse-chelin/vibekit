---
description: View, plan, and manage the feature roadmap
---

Manage the project roadmap. View current status, add features, prioritize, or start working on the next item.

## Actions

Based on $ARGUMENTS:

### No arguments — Show roadmap status
1. Read `docs/roadmap.md`
2. Summarize: what's in progress, what's next, how many items completed
3. Suggest the highest-priority next item to work on

### "add [feature]" — Add a feature to the roadmap
1. Read `docs/roadmap.md`
2. Discuss with the user: what does this feature do? What priority?
3. Add it to the appropriate section (Current Sprint / Up Next / Future Ideas)
4. Save and commit: `git commit -m "docs: add [feature] to roadmap"`

### "plan [feature]" — Break down a feature into tasks
1. Read `APP.md` for current app context
2. Read `docs/roadmap.md` to find the feature
3. Break it down into specific implementation tasks:
   - Database changes (models, migrations)
   - API changes (new procedures, modified procedures)
   - Page changes (new pages, modified pages)
   - Component changes (new components, modified components)
4. Present the plan to the user for approval
5. Update docs/roadmap.md with the breakdown if approved

### "next" — Start the next roadmap item
1. Read `docs/roadmap.md`
2. Find the highest-priority unchecked item in "Current Sprint" (or "Up Next" if sprint is empty)
3. Run the `/add-feature` workflow for that item

### "sprint [items...]" — Set the current sprint
1. Read `docs/roadmap.md`
2. Move specified items to "Current Sprint"
3. Move other "Current Sprint" items back to "Up Next" if not started
4. Save and commit

## Roadmap Template (for new projects)

```markdown
# Roadmap

## Current Sprint
- [ ] Item — description

## Up Next
- [ ] Item — description

## Future Ideas
- Item — description

## Completed
- [x] Item — completed YYYY-MM-DD
```

$ARGUMENTS
