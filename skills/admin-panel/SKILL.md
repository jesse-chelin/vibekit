---
name: admin-panel
description: Adds an admin panel with dashboard stats and CRUD management for users, projects, and tasks. Use when the user needs an admin area, user management, content moderation, or a back-office interface. Only accessible to users with role "admin".
---

# Admin Panel

Full admin panel at `/admin` with dashboard overview and CRUD pages for managing users, projects, and tasks.

## What It Adds

| File | Purpose |
|------|---------|
| `src/trpc/routers/admin.ts` | Admin tRPC router with role-gated procedures for all CRUD operations |
| `src/app/(app)/admin/layout.tsx` | Admin layout with role check and tabbed navigation |
| `src/app/(app)/admin/page.tsx` | Dashboard with stats cards and recent users |
| `src/app/(app)/admin/users/page.tsx` | User management: search, role editing, deletion |
| `src/app/(app)/admin/projects/page.tsx` | Project management: search, status/priority editing, deletion |
| `src/app/(app)/admin/tasks/page.tsx` | Task management: search, deletion |

## When NOT to Use

- The app has a single user (personal tools — no need for admin management)
- User only needs role-based access control without a dashboard (use rbac skill instead)
- User wants a full-featured CMS (this is a simple CRUD admin — for complex content management, use a headless CMS)

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. The User model has a `role` field (default in vibekit)
2. At least one user exists who can be made admin
3. The app has user authentication working

## Access Control

Only users with `role: "admin"` can access the admin panel. The layout checks the role server-side and redirects non-admins to the dashboard.

### Making a User an Admin

```bash
# Via Prisma Studio
pnpm db:studio
# Find the user → set role to "admin"

# Or via database directly
sqlite3 prisma/dev.db "UPDATE User SET role='admin' WHERE email='your@email.com';"
```

## Architecture

The admin router uses a custom `adminProcedure` that extends `protectedProcedure` with an additional role check. All admin operations go through this procedure — there's no way to accidentally call them without admin access.

All CRUD pages are client components that call the admin tRPC router. They include:
- Paginated data tables with search
- Edit dialogs for inline field changes
- Delete confirmation dialogs
- Toast notifications for feedback

## Extending for New Models

To add CRUD for a new Prisma model:

1. Add list/get/update/delete procedures to `admin.ts` using `adminProcedure`
2. Create a new page at `src/app/(app)/admin/your-model/page.tsx`
3. Add a tab link in the admin layout

## Adding to Sidebar

Add this to your sidebar navigation items:
```typescript
{ label: "Admin", href: "/admin", icon: Shield }
```
