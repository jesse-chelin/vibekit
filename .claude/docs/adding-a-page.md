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

**Note:** The `(app)` layout provides `p-4 md:p-6` padding on the `<main>` element. Pages do NOT need their own padding — just use `space-y-6` for section spacing.

### Pattern A: Server Component with tRPC Data

Use this for pages that display data fetched on the server. The server prefetches data and hydrates the client's React Query cache, so client components get instant data without a loading flash.

```tsx
// src/app/(app)/projects/page.tsx
import { trpc, HydrateClient } from "@/trpc/server";
import { ProjectList } from "./_components/project-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  void trpc.project.list.prefetch({});
  return (
    <HydrateClient>
      <ProjectList />
    </HydrateClient>
  );
}
```

```tsx
// src/app/(app)/projects/_components/project-list.tsx
"use client";

import { trpc } from "@/trpc/client";
import { EmptyState } from "@/components/patterns/empty-state";
import { DataTable } from "@/components/patterns/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProjectList() {
  const router = useRouter();
  const { data, isLoading } = trpc.project.list.useQuery({});

  if (isLoading) return null; // loading.tsx handles this via Suspense

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage and track all your projects."
        actions={
          <Button onClick={() => router.push("/projects/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        }
      />

      {!data?.items.length ? (
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description="Create your first project to get started."
          action={{ label: "New Project", href: "/projects/new" }}
        />
      ) : (
        <DataTable columns={columns} data={data.items} searchKey="name" />
      )}
    </div>
  );
}
```

### Pattern B: Server Component with Direct Fetch

Use this for simpler pages (like dashboards) where data is rendered directly in the server component.

```tsx
// src/app/(app)/dashboard/page.tsx
import { caller } from "@/trpc/server";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/patterns/stat-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const stats = await caller.user.stats();

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your projects." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Projects" value={stats.projectCount} icon={FolderOpen} iconColor="text-blue-500" />
        {/* ... more stat cards */}
      </div>
    </div>
  );
}
```

**Important:** Pages using `caller` or `trpc.prefetch()` require `export const dynamic = "force-dynamic"` because they need auth context (session cookies) that isn't available at build time.

### Template: Loading Skeleton

```tsx
// src/app/(app)/projects/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-1 h-4 w-64" />
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

## Form Integration Pattern

Use this for create and edit pages. Combines react-hook-form + Zod validation + tRPC mutation + toast + query invalidation.

### Create Form

```tsx
// src/app/(app)/projects/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define the Zod schema (mirrors the tRPC input schema, WITHOUT .default())
const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  priority: z.enum(["low", "medium", "high"]),
});

type CreateProjectInput = z.infer<typeof createProjectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  // react-hook-form with Zod validation
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "", priority: "medium" },
  });

  // tRPC mutation with success/error handling
  const createProject = trpc.project.create.useMutation({
    onSuccess: (project) => {
      // Invalidate ALL affected queries — not just the current page
      void utils.project.list.invalidate();
      void utils.user.stats.invalidate();
      toast.success("Project created!");
      router.push(`/projects/${project.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Project"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
      <form onSubmit={form.handleSubmit((data) => createProject.mutate(data))}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="My awesome project" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            {/* ... more fields */}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
```

### Edit Form

Same pattern, but fetch existing data first and use `values` to pre-populate:

```tsx
// Key differences from create:
const { data: project, isLoading, error } = trpc.project.byId.useQuery({ id });

const form = useForm<UpdateProjectInput>({
  resolver: zodResolver(updateProjectSchema),
  values: project ? {  // `values` re-syncs form when data loads
    name: project.name,
    description: project.description ?? "",
    status: project.status as "active" | "completed" | "archived",
    priority: project.priority as "low" | "medium" | "high",
  } : undefined,
});

const updateProject = trpc.project.update.useMutation({
  onSuccess: () => {
    void utils.project.byId.invalidate({ id });
    void utils.project.list.invalidate();
    void utils.user.stats.invalidate();
    toast.success("Project updated!");
    router.push(`/projects/${id}`);
  },
});
```

### Key Rules for Forms

1. **Zod schema without `.default()`** — react-hook-form's `defaultValues` handles defaults. Using `.default()` on the schema causes type conflicts with the zodResolver.
2. **`void` before `invalidate()`** — Invalidation returns a Promise but we don't need to await it. `void` prevents the unhandled promise warning.
3. **Invalidate ALL affected queries** — Creating a project affects `project.list` AND `user.stats` (dashboard). Always think about what OTHER pages show this data.
4. **Loading state on submit button** — Disable the button and show `Loader2` spinner while mutation is pending.
5. **Select components need `setValue`** — shadcn Select doesn't work with `register()`. Use `watch()` + `setValue()` instead.

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

- [ ] `page.tsx` exists with `space-y-6` sections (padding comes from layout)
- [ ] `loading.tsx` exists with skeleton matching the page layout
- [ ] Pages using tRPC server calls have `export const dynamic = "force-dynamic"`
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
- Don't use different padding per page: layout provides `p-4 md:p-6`, pages just use `space-y-6`
- Don't only handle the happy path: error state and empty state are not optional
- Don't forget data propagation: creating an item should update the dashboard count
- Don't use `.default()` on Zod schemas passed to react-hook-form's zodResolver — use `defaultValues` instead
