# Performance Guide

## Server vs Client Components

**Default to Server Components** — they send zero JS to the browser.

Use Client Components (`"use client"`) ONLY when you need:
- `useState`, `useEffect`, event handlers
- Browser APIs (localStorage, IntersectionObserver, etc.)
- Third-party client libraries (charts, maps)

### Decision Guide
| Feature | Server Component | Client Component |
|---------|-----------------|-----------------|
| Static content | Yes | No |
| Data fetching | Yes (via `caller`) | Only if interactive |
| Forms | No | Yes |
| Click handlers | No | Yes |
| Conditional rendering (server data) | Yes | Not needed |
| URL-based filtering | Yes | Not needed |

## Data Fetching Patterns

### Server Component (preferred for initial load)
```tsx
import { caller } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";

export default async function ProjectsPage() {
  // Fetch on server — zero client JS, instant render
  const projects = await caller.project.list({ page: 1 });
  return <ProjectList initialData={projects} />;
}
```

### Client Component (for interactive data)
```tsx
"use client";
import { trpc } from "@/trpc/client";

export function ProjectList() {
  const { data, isLoading, error, refetch } = trpc.project.list.useQuery({});
  // TanStack Query handles caching, deduplication, stale-while-revalidate
}
```

### Prefetch + Hydrate (best of both worlds)
```tsx
// Server component prefetches, client component hydrates
// See src/trpc/server.tsx for HydrateClient pattern
```

## Mutation Best Practices

### Invalidation (CRITICAL)
After every mutation, invalidate ALL queries that could show stale data:

```tsx
const utils = trpc.useUtils();

const createProject = useMutation(
  trpc.project.create.mutationOptions({
    onSuccess: () => {
      // Invalidate everything that shows project data
      utils.project.list.invalidate();
      utils.dashboard.stats.invalidate(); // dashboard shows project count!
      toast.success("Project created!");
    },
  })
);
```

Think about what OTHER pages display this data:
- Creating a project → invalidate project list + dashboard stats
- Completing a task → invalidate task list + project detail + dashboard stats
- Deleting anything → invalidate all lists that showed it

### Optimistic Updates (for snappy UX)
```tsx
const toggleComplete = useMutation(
  trpc.task.toggleComplete.mutationOptions({
    onMutate: async ({ id }) => {
      // Cancel outgoing queries
      await utils.task.list.cancel();
      // Snapshot previous value
      const previous = utils.task.list.getData();
      // Optimistically update
      utils.task.list.setData(undefined, (old) =>
        old?.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      // Rollback on error
      utils.task.list.setData(undefined, context?.previous);
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      utils.task.list.invalidate();
    },
  })
);
```

## Images

ALWAYS use `next/image` for automatic optimization:

```tsx
import Image from "next/image";

// Fixed size — use width + height
<Image src="/hero.png" alt="Hero" width={800} height={400} priority />

// Fill container — use fill + sizes
<div className="relative aspect-video">
  <Image
    src={project.image}
    alt={project.name}
    fill
    className="object-cover rounded-lg"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
</div>
```

### Image Rules
- `priority` ONLY for above-the-fold hero images (first visible image)
- Always set `sizes` for responsive images (prevents loading oversized images)
- Use `fill` + parent with `relative` + `aspect-*` for flexible containers
- Set `className="object-cover"` to prevent distortion

## Code Splitting

Heavy client components should use dynamic imports:

```tsx
import dynamic from "next/dynamic";

// Heavy chart library — only load when needed
const Chart = dynamic(() => import("@/components/patterns/charts"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

// PDF viewer — only load on demand
const PdfViewer = dynamic(() => import("@/components/patterns/pdf-viewer"), {
  ssr: false,
});
```

## Rendering Performance

### Lists
- **< 50 items**: Render normally
- **50-200 items**: Consider pagination
- **200+ items**: Use virtualization (`@tanstack/react-virtual`) or pagination

### Memoization
```tsx
// Memoize list items to prevent re-renders
const ProjectCard = React.memo(function ProjectCard({ project }: Props) {
  return <Card>...</Card>;
});

// Memoize expensive computations
const filteredProjects = useMemo(
  () => projects.filter(p => p.name.includes(search)).sort(sortFn),
  [projects, search, sortFn]
);

// Memoize callbacks passed to memoized children
const handleClick = useCallback((id: string) => {
  // ...
}, []);
```

### When NOT to Memoize
- Simple components rendered once (not in loops)
- Components that always re-render anyway (props change every render)
- Cheap computations (string formatting, basic math)

## CSS & Animation Performance

### GPU-Accelerated Only
Animate ONLY these properties (GPU-composited, no layout recalc):
- `transform` (translateX/Y, scale, rotate)
- `opacity`
- `filter` (blur, brightness)

NEVER animate:
- `width`, `height` (triggers layout)
- `top`, `left` (triggers layout)
- `padding`, `margin` (triggers layout)
- `border-width` (triggers layout + paint)

### Use motion.tsx Presets
The 4 animation presets are already optimized:
- `FadeIn` — opacity only
- `SlideUp` — transform + opacity
- `ScaleIn` — transform + opacity
- `StaggerList` — CSS animation-delay (no JS)

## Bundle Size

### Import Discipline
```tsx
// Good — tree-shakeable
import { Search, Plus, Trash2 } from "lucide-react";

// Bad — imports entire library
import * as Icons from "lucide-react";
```

### Before Adding Dependencies
1. Check if the functionality exists in the curated component set
2. Check bundle size at bundlephobia.com
3. Consider if a simpler approach would work
4. Heavy deps (charts, PDF, maps) should be dynamically imported

## Loading States

### Every Page Gets loading.tsx
```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Match the EXACT layout of the real page */}
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />  {/* title */}
          <Skeleton className="h-4 w-64" />  {/* description */}
        </div>
        <Skeleton className="h-10 w-28" />   {/* action button */}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />  {/* stat cards */}
        ))}
      </div>
    </div>
  );
}
```

The skeleton MUST match the real page layout — same grid, same card sizes, same spacing. A mismatched skeleton causes content shift.

## State Management

| State Type | Where to Store | Example |
|-----------|---------------|---------|
| Server data | TanStack Query (via tRPC) | Projects, users, settings |
| UI state | `useState` | Open/closed, selected tab |
| URL state | Search params | Filters, pagination, search |
| Form state | React Hook Form | Form inputs |
| Global UI | React Context (sparingly) | Theme, sidebar open |

DO NOT store server data in local state. It gets stale. Always use TanStack Query.
