---
type: feature
status: planned
feature: ""
version: ""
created: YYYY-MM-DD
last-updated: YYYY-MM-DD
related-models: []
related-routes: []
---

# [Feature Name]

## Overview

What does this feature do? One paragraph.

## User Story

As a [target user], I want to [action] so that [benefit].

## Data Model

Which Prisma models are involved? Link to [[data-model]] for full schema.

| Model | Role |
|-------|------|
| ModelName | What this model does for this feature |

## Pages

| Route | Type | Description |
|-------|------|-------------|
| `/path` | List / Detail / Create / Edit | What this page shows |

## API Procedures

| Router | Procedure | Type | Description |
|--------|-----------|------|-------------|
| `entity` | `list` | query | Paginated list |
| `entity` | `create` | mutation | Create with validation |

## States

- **Empty:** What the user sees with no data (EmptyState component)
- **Loading:** Skeleton matching page layout (loading.tsx)
- **Error:** Error message with retry button

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] Works at 375px viewport
- [ ] All states handled (empty, loading, error)

## Future Enhancements

Ideas for v2+:
- Enhancement idea
