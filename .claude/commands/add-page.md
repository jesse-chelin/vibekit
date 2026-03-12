---
description: Add a new page following vibekit conventions
---

Create a new page following vibekit conventions. The page MUST include all required elements from the start — never defer them.

## Mandatory Files

For every new page at `src/app/(app)/[route]/`:

1. **`page.tsx`** — The main page component
2. **`loading.tsx`** — Skeleton that matches the page layout

## Page Structure Template

```tsx
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Page Title" };

export default async function MyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Page Title"
        description="What this page shows."
        actions={<Button>Primary Action</Button>}
      />
      {/* Content sections with space-y-6 */}
    </div>
  );
}
```

## Loading Skeleton Template

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      {/* Match your page layout with skeletons */}
    </div>
  );
}
```

## Mandatory Data States

Every data-fetching component inside the page MUST handle:

```tsx
if (error) return (
    <div className="text-center py-8">
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try Again</Button>
    </div>
  );
if (isLoading) return <Skeleton ... />;
if (!data?.length) return (
  <EmptyState
    icon={IconName}
    title="No items yet"
    description="Create your first item to get started."
    action={{ label: "Create Item", onClick: handleCreate }}
  />
);
```

## Required Checklist (verify ALL before done)

- [ ] `loading.tsx` exists with layout-matching skeletons
- [ ] Empty state for every list/table (EmptyState component)
- [ ] Error state for every data fetch (retry button)
- [ ] Page padding is `p-4 md:p-6`
- [ ] Section spacing is `space-y-6`
- [ ] Mobile layout works at 375px (no overflow)
- [ ] Touch targets ≥ 44px
- [ ] Mutations invalidate all affected queries
- [ ] Toast feedback for user actions

## Steps

1. Create `page.tsx` with the structure above
2. Create `loading.tsx` with matching skeleton
3. Add data-fetching components with all 3 states (error/loading/empty)
4. Add the page to sidebar navigation if appropriate
5. Run `pnpm build` to verify

$ARGUMENTS
