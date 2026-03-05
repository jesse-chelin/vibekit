# Adding an API Route

All API logic goes through tRPC routers. Avoid creating raw API routes.

## tRPC Procedure

```typescript
import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const myRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ page: z.number().default(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.myModel.findMany({
        where: { userId: ctx.session.user.id },
        skip: (input.page - 1) * 20,
        take: 20,
      });
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.myModel.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),
});
```

Always:
- Use `protectedProcedure` for all authenticated endpoints
- Validate ALL inputs with Zod
- Scope queries to `ctx.session.user.id`
