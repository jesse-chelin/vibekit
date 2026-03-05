---
name: rbac
description: Adds role-based access control with configurable roles (admin/member/viewer), permission guards for middleware and tRPC, role management UI, and team invite flow. Use when the user needs different permission levels, mentions roles, wants admin-only features, or needs to restrict access by user type.
---

# RBAC — Role-Based Access Control

Fine-grained access control with configurable roles, middleware guards, tRPC procedure guards, and client-side role components. The User model already has a `role` field — this skill adds the infrastructure to enforce it.

## When NOT to Use

- All users should have equal access (no permission differences needed)
- Admin-panel skill alone is sufficient (it has its own built-in admin role check)
- User needs attribute-based access control (ABAC) or complex permission trees — this is simple role-based only
- The app has a single user (personal tools)

## What It Adds

| File | Purpose |
|------|---------|
| `src/lib/rbac.ts` | Role definitions, permission mappings, and check functions |
| `src/components/patterns/role-guard.tsx` | Client component: show/hide content by role |
| `src/trpc/middleware/require-role.ts` | tRPC middleware: restrict procedures by role |
| `src/trpc/routers/roles.ts` | tRPC router: get user role, update roles (admin only) |
| `src/app/(app)/settings/team/page.tsx` | Team management: invite users, assign roles |

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. The User model has a `role` field (default in vibekit schema: `role String @default("member")`)
2. At least one user is set as admin: `pnpm db:studio` → find user → set role to "admin"
3. User understands the role hierarchy: admin > member > viewer

## Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access — manage users, change roles, delete anything |
| `member` | Standard access — CRUD on own resources, view shared resources |
| `viewer` | Read-only — view resources, no create/update/delete |

## Setup

After installation, seed an admin user:

```bash
# Via Prisma Studio
pnpm db:studio
# Find your user → change role to "admin"

# Or via SQL
sqlite3 prisma/dev.db "UPDATE User SET role='admin' WHERE email='your@email.com';"
```

## Architecture

### Three Layers of Protection

```
1. Middleware (src/middleware.ts)
   → Route-level: block entire pages by role

2. tRPC Procedures (require-role middleware)
   → API-level: block data access by role

3. Client Components (RoleGuard)
   → UI-level: hide buttons/sections by role
```

CRITICAL: Always protect at the API level (layer 2). Client-side guards (layer 3) are for UX only — they can be bypassed. Never rely on UI hiding alone for security.

### Permission Checking

```typescript
import { hasRole, hasPermission } from "@/lib/rbac";

// Check if user has a specific role
hasRole(user.role, "admin"); // true if admin

// Check if user's role meets minimum requirement
hasPermission(user.role, "member"); // true if member or admin
```

## Usage

### Protecting a tRPC Procedure

```typescript
import { requireRole } from "@/trpc/middleware/require-role";

export const userRouter = createTRPCRouter({
  // Only admins can delete users
  deleteUser: protectedProcedure
    .use(requireRole("admin"))
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.delete({ where: { id: input.userId } });
    }),

  // Members and above can create projects
  createProject: protectedProcedure
    .use(requireRole("member"))
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({ data: { name: input.name, userId: ctx.session.user.id } });
    }),
});
```

### Hiding UI by Role

```tsx
import { RoleGuard } from "@/components/patterns/role-guard";

// Only show delete button to admins
<RoleGuard roles={["admin"]}>
  <Button variant="destructive" onClick={handleDelete}>Delete User</Button>
</RoleGuard>

// Show to members and admins
<RoleGuard roles={["admin", "member"]}>
  <Button onClick={handleCreate}>New Project</Button>
</RoleGuard>
```

### Protecting a Page via Middleware

Add to `src/middleware.ts`:

```typescript
if (pathname.startsWith("/admin") && session.user.role !== "admin") {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

## Post-Install Verification

1. Set your user as admin via Prisma Studio
2. Start the app: `pnpm dev`
3. Navigate to `/settings/team` — you should see the team management page
4. Try accessing admin features as a non-admin — you should be blocked
5. Try calling a role-protected tRPC procedure without the right role — you should get FORBIDDEN

## Troubleshooting

**"FORBIDDEN" on all requests**: Your user doesn't have the required role. Check `pnpm db:studio` → User table → role field.

**RoleGuard not hiding content**: The session may not include the role field. Verify the role is in the JWT token / session callback in `src/lib/auth.ts`.

**New users have no role**: The default role is "member" (set in Prisma schema). If you want new users to be "viewer" by default, change the `@default("member")` to `@default("viewer")`.

**Admin can't manage roles**: The roles router uses `adminProcedure`. Make sure your user's role is exactly `"admin"` (case-sensitive).
