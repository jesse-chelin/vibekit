# Adding a Page

Every page is a set of files, not a single file. A page is NOT complete until all files exist.

## Required Files (per page)

```
src/app/(group)/route/
├── page.tsx      ← Main page (REQUIRED)
└── loading.tsx   ← Skeleton loader (REQUIRED)
```

No exceptions. No "I'll add the loading state later." Create both files together.

## Marketing Page (public, `(marketing)` group)

```tsx
// src/app/(marketing)/about/page.tsx
import { Section } from "@/components/layout/section";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <Section>
      <h1 className="text-4xl font-bold tracking-tight">About</h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl">...</p>
    </Section>
  );
}
```

```tsx
// src/app/(marketing)/about/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-16 space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-5 w-96" />
    </div>
  );
}
```

## Auth Page (`(auth)` group)

Centered card layout is automatic from the group layout.

```tsx
// src/app/(auth)/verify/page.tsx
export default function VerifyPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
      <p className="text-muted-foreground">We sent you a verification link.</p>
    </div>
  );
}
```

## App Page (authenticated, `(app)` group) — Most Common

### Template: Server Component Page

```tsx
// src/app/(app)/projects/page.tsx
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectList } from "./project-list";

export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <PageHeader
        title="Projects"
        description="Manage your projects and track progress."
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        }
      />
      <ProjectList />
    </div>
  );
}
```

### Template: Loading Skeleton

```tsx
// src/app/(app)/projects/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* PageHeader skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      {/* Content skeleton — match your actual layout */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
```

### Template: Data-Fetching Client Component

```tsx
// src/app/(app)/projects/project-list.tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/patterns/empty-state";
import { Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectList() {
  const trpc = useTRPC();
  const { data, isLoading, error, refetch } = useQuery(
    trpc.project.list.queryOptions()
  );

  // 1. Error state — REQUIRED
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Something went wrong loading your projects.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  // 2. Loading state — REQUIRED
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // 3. Empty state — REQUIRED
  if (!data?.length) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No projects yet"
        description="Create your first project to get started."
        action={{
          label: "New Project",
          onClick: () => {/* open create dialog or navigate */},
        }}
      />
    );
  }

  // 4. Data state
  return (
    <div className="space-y-3">
      {data.map((project) => (
        /* render project rows */
      ))}
    </div>
  );
}
```

## Page Types Reference

| Type | Layout | PageHeader | Data States |
|------|--------|------------|-------------|
| Dashboard | Stat grid + content sections | Yes | Loading skeleton for each section |
| List/Table | DataTable with filters | Yes (with "New" button) | Empty + Error + Loading |
| Detail | DetailLayout (main + sidebar) | Yes (with Edit/Delete) | Error + Loading |
| Create/Edit | Form with FormSection | Yes | Loading for edit (prefill) |
| Settings | SettingsLayout with tabs | Yes | Loading + Error per tab |

## Mandatory Checklist

Before considering a page complete, verify ALL of these:

- [ ] `page.tsx` exists with `p-4 md:p-6` padding and `space-y-6` sections
- [ ] `loading.tsx` exists with skeleton matching the page layout
- [ ] Every data list has an EmptyState component (icon + title + description + action)
- [ ] Every data fetch has error handling with retry
- [ ] Page uses `PageHeader` with title (and description if applicable)
- [ ] Mutations invalidate all affected queries (not just the current page's data)
- [ ] Toast notifications confirm user actions (create, update, delete)
- [ ] Works at 375px mobile width — no horizontal overflow
- [ ] Touch targets are ≥ 44px
- [ ] Interactive elements have hover + focus-visible states
- [ ] No raw color values — all semantic tokens
- [ ] Added to sidebar navigation (if it's a main page)

## Anti-Patterns (DO NOT)

- Don't defer loading states: "I'll add loading.tsx later" → you won't, and it'll flash white
- Don't use a spinner instead of skeleton: skeletons show layout structure, spinners don't
- Don't forget empty states: a blank page is confusing; EmptyState guides the user
- Don't use different padding per page: `p-4 md:p-6` everywhere, always
- Don't only handle the happy path: error state and empty state are not optional
- Don't forget data propagation: creating an item should update the dashboard count
