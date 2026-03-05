---
description: Audit frontend performance and optimization
---

Audit a component or page for performance issues following vibekit standards.

## Performance Standards

### Rendering
- **Server Components by default** — Only add `"use client"` if the component needs hooks, event handlers, or browser APIs
- **No unnecessary re-renders** — Don't create new objects/arrays/functions in render (`useMemo`, `useCallback` where needed)
- **Virtualization** for lists > 50 items — consider `@tanstack/react-virtual`
- **`React.memo()`** on components rendered in loops (list items, table rows, grid cards)
- **Never compute derived state in render** — use `useMemo` or compute outside the component

### Images
- **`next/image`** for all images — automatic WebP/AVIF, lazy loading, responsive sizes
- **Set explicit width/height or fill** — prevents content layout shift
- **Use `sizes` prop** — tells the browser which image size to load based on viewport
- **`priority`** only for above-the-fold hero images

### Data Fetching
- **Server Components fetch on the server** — use `caller` from `src/trpc/server.tsx`
- **Client Components use TanStack Query** — automatic caching, deduplication, stale-while-revalidate
- **Prefetch on server, hydrate on client** — use `HydrateClient` pattern for interactive pages
- **Optimistic updates** for toggle/preference operations (update UI first, API in background)
- **Don't poll unless needed** — use mutation invalidation instead of `refetchInterval`

### CSS & Animation
- **GPU-accelerated only** — animate `transform`, `opacity` (not `width`, `height`, `top`, `left`)
- **Use motion.tsx presets** — they're already optimized for performance
- **No layout thrashing** — don't read DOM measurements in scroll/resize handlers without `requestAnimationFrame`
- **Prefer CSS transitions** over JS animations for simple state changes

### Bundle
- **Tree-shakeable imports** — `import { Search } from "lucide-react"` not `import * as Icons`
- **Lazy load heavy components** — `next/dynamic` for modals, charts, PDF viewers
- **No giant dependencies** without justification — check bundle impact

### State Management
- **URL state** for filters/search/pagination (survives refresh, shareable)
- **Server state** via TanStack Query (not local state for API data)
- **Local state** only for UI state (open/closed, selected tab, form inputs)
- **Don't duplicate server state locally** — it gets stale

## Audit

For the target ($ARGUMENTS or most recently modified components):

1. Read the component and its children
2. Check each standard above
3. Classify issues:
   - **High** — visible jank, slow load, excessive bundle
   - **Medium** — measurable but subtle impact
   - **Low** — best practice, minor optimization
4. Report issues with file:line and concrete fix
