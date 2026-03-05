# Adding an API Route

All API logic goes through tRPC routers. Do NOT create raw Next.js API routes.

## Standard Entity Router

Every Prisma model gets a tRPC router with these 5 procedures. This is the minimum — add more only when the entity genuinely needs them.

```typescript
// src/trpc/routers/recipe.ts
import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const recipeRouter = createTRPCRouter({
  // 1. LIST — paginated, filterable
  // MUST return { items, total, page, pageSize, totalPages } — never a raw array
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, difficulty, page, pageSize } = input;
      const where = {
        userId: ctx.session.user.id,
        ...(difficulty && { difficulty }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      };

      const [items, total] = await Promise.all([
        ctx.db.recipe.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        ctx.db.recipe.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  // 2. BY ID — single record, throws on not found
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const recipe = await ctx.db.recipe.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      if (!recipe) throw new Error("Recipe not found");
      return recipe;
    }),

  // 3. CREATE — Zod-validated input, scoped to userId
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required").max(255),
        description: z.string().max(1000).optional(),
        cookTime: z.number().min(1).optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.recipe.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),

  // 4. UPDATE — id required, all other fields optional
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(1000).optional(),
        cookTime: z.number().min(1).optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.recipe.update({
        where: { id, userId: ctx.session.user.id },
        data,
      });
    }),

  // 5. DELETE — scoped to userId to prevent cross-user deletion
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.recipe.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),
});
```

## Register the Router

After creating the router file, add it to `src/trpc/router.ts`:

```typescript
import { createTRPCRouter } from "@/trpc/init";
import { recipeRouter } from "@/trpc/routers/recipe";
// ... other imports

export const appRouter = createTRPCRouter({
  recipe: recipeRouter,
  // ... other routers
});

export type AppRouter = typeof appRouter;
```

If you skip this step, the router exists but no page can call it.

## Update Dashboard Stats

When adding a new entity, update `src/trpc/routers/user.ts` so the `stats` procedure counts it:

```typescript
// Inside the stats procedure, add:
const recipeCount = await ctx.db.recipe.count({
  where: { userId: ctx.session.user.id },
});

// Return it alongside existing counts:
return {
  // ... existing stats
  recipeCount,
};
```

Every dashboard stat card needs a count from this procedure. If you add an entity but don't add its count here, the dashboard will be incomplete.

## Rules

1. **Always `protectedProcedure`** for authenticated endpoints. Use `publicProcedure` only for truly public data (e.g., a public recipe gallery).
2. **Always scope to `ctx.session.user.id`** — in `where` clauses for queries, in `data` for creates, in `where` for updates/deletes.
3. **Validate ALL inputs with Zod** — including `id` fields (`z.string()`).
4. **`list` MUST return `{ items, total, page, pageSize, totalPages }`** — page templates access `data.items`, not `data` directly. A raw array will crash every list page.
5. **Import Zod from `"zod/v4"`** — not `"zod"`. The project uses Zod v4.
6. **Reference implementation:** `src/trpc/routers/project.ts` — the canonical 5-procedure router.
