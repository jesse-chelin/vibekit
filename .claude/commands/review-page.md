---
description: Review a page/component for issues, completeness, and consistency
---

Perform a comprehensive review of a page or component against vibekit standards.

The goal: would you trust this page with real data, real users, and real money? Not "does the demo look good?"

## Review Checklist

### 1. Page Completeness — MOST CRITICAL
- Has a `loading.tsx` with layout-matching skeletons?
- Has empty state (EmptyState component) for all lists/tables?
- Has error state handling with retry button?
- Has `PageHeader` with title + description?
- Uses `p-4 md:p-6` for page content padding?

### 2. Real-World Data Resilience — THE ANTI-SLOP CHECK
This is what separates a production app from a demo. Check every data-displaying element:

- **0 items**: Does it show a helpful empty state (not a blank area or broken grid)?
- **1 item**: Does the layout still look right with a single item in a grid/list?
- **100+ items**: Is there pagination or virtualization? Or does it render all items and destroy performance?
- **Very long text**: What happens when a name is 200 characters? Does `truncate` or `line-clamp-N` prevent layout breaks?
- **Very short text**: What happens with a 1-character name? Any awkward whitespace?
- **Missing optional fields**: If description is optional and empty, is there a blank gap? Or is it handled gracefully?
- **Special characters**: What if the name contains `<script>`, quotes, or emoji? Any XSS or rendering issues?
- **Rapid actions**: What if the user clicks "Delete" 5 times fast? Is the button disabled during async? Is the mutation debounced?
- **Slow network**: What does the user see while waiting 3+ seconds for data? Skeleton or blank?
- **API failure**: What does the user see if the server returns a 500? Error state with retry, or a crash?

### 3. TypeScript
- No `any`, no `as` casts without justification
- Proper Zod schemas on all tRPC inputs
- Return types are explicit where complex

### 4. Spacing Consistency
- Page padding: `p-4 md:p-6` (no exceptions)
- Section gaps: `space-y-6`
- Form gaps: `space-y-4`
- Grid gaps: `gap-4` or `gap-6`
- No ad-hoc spacing values (no `p-3`, `p-5`, `p-7` for page content)

### 5. Responsiveness — Verify at 375px mobile width
- No horizontal overflow
- Touch targets ≥ 44px
- Grids collapse: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Text truncation: `truncate` or `line-clamp-N` (no unexpected wrapping)
- Tables convert to card layouts or scroll horizontally on mobile

### 6. Interactive States
- All buttons/links have hover + focus-visible states
- Async actions show loading spinner + disabled state
- Selected items have distinct visual state
- Destructive actions require confirmation dialog

### 7. Data Flow
- Mutations invalidate ALL affected queries (not just current page)
- Dashboard stats, sidebar counts, related lists — all refreshed
- Optimistic updates where appropriate
- No stale data after mutations

### 8. Performance
- Server Components where possible (no `"use client"` without interactivity)
- Images use `next/image` with proper sizes
- Lists > 50 items should consider virtualization
- No unnecessary re-renders (check dependency arrays)

### 9. UX Polish
- No content shift on load (skeletons match layout)
- Toast feedback for mutations ("Project created!" not silence)
- Consistent density (don't mix spacious and cramped)
- Destructive actions are visually distinct (red/destructive variant)

### 10. Dead Code
- Unused imports, unreachable branches, commented-out code

## Output Format

Present findings grouped by severity:
- **Bugs** — Will cause errors or incorrect behavior
- **Missing** — Required by vibekit standards but absent
- **Issues** — Suboptimal but functional
- **Polish** — Nice-to-have improvements

For each finding: file path, line number, and concrete fix.

End with a **verdict**: "Production-ready" / "Needs work (N issues)" / "Not ready (N critical issues)"

$ARGUMENTS
