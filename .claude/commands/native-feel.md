---
description: Audit for native app quality (Linear/Vercel-level polish)
---

Review a component or page for native app quality — the kind of polish expected from Linear, Vercel, or Raycast. This goes beyond functional correctness into **feel**.

## Native App Quality Checklist

### Animation & Motion
- **Entry animations** — Content should stagger in using `StaggerList` + `StaggerItem` from motion.tsx
- **Transitions** — State changes should transition smoothly (opacity, transform), never just appear/disappear
- **Loading → content** — Skeletons should match the exact layout of real content, so the transition is seamless
- **No jank** — 60fps animations, GPU-accelerated properties only (transform, opacity)

### Visual Depth
- **Layered surfaces** — Use `bg-background` → `bg-card` → `bg-muted` hierarchy, not flat
- **Border subtlety** — Borders should be barely visible (`border-border`), not prominent
- **Elevation cues** — Cards and dialogs feel like they sit above the page
- **Color consistency** — All colors from semantic tokens, never raw hex

### Interaction Feedback
- **Instant response** — Click feedback < 50ms (optimistic updates, local state before API)
- **Loading states** — Skeleton screens, not spinners (except for button inline spinners)
- **Progress tracking** — Long operations show progress (current/total), not just a spinner
- **Success confirmation** — Toast notifications for completed actions
- **Disabled during action** — Buttons show inline spinner + `disabled:opacity-50` during async

### Layout Polish
- **No content shift** — Fixed-height containers for dynamic content, aspect ratios for images
- **Overflow handling** — Text truncates with `truncate` or `line-clamp-N`, never wraps unexpectedly
- **Consistent density** — Info density matches nearby UI (don't mix spacious hero with cramped tables)
- **Alignment** — Elements on the same row should baseline-align or center-align consistently

### Mobile Native Feel
- **Bottom sheets** — Dialogs should use Drawer on mobile (Sheet component), Dialog on desktop
- **Touch targets** — All tappable elements ≥ 44px
- **No hover-only UI** — Everything accessible without hover (no tooltip-only information)
- **Responsive grids** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (never fixed columns)

### Typography & Readability
- **Text hierarchy** — Max 3 levels visible at once (title, subtitle, metadata)
- **Contrast** — Primary text is `text-foreground`, secondary is `text-muted-foreground`
- **Number formatting** — Use `.toLocaleString()` for large numbers, proper date formatting
- **Consistent separators** — Use `·` (interpunct) or `|` consistently, not mixed

### Empty & Error States
- **Designed empty states** — Icon + title + description + optional action (EmptyState component)
- **Graceful errors** — Retry button + human-readable message, no raw error strings
- **Partial loading** — Show available data while loading remaining sections

## Audit

For the target ($ARGUMENTS or recently modified pages):

1. Walk through the component as a user would — first load, scroll, click, navigate back
2. Check each category above
3. Rate overall native feel: **A** (Linear-quality) / **B** (Good web app) / **C** (Functional but flat) / **D** (Needs work)
4. List the top 5 highest-impact improvements with file:line and concrete implementation
