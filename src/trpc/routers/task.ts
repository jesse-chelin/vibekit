import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const taskRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        status: z.enum(["todo", "in_progress", "completed"]).optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, status, page, pageSize } = input;
      const where = {
        userId: ctx.session.user.id,
        ...(projectId && { projectId }),
        ...(status && { status }),
      };

      const [items, total] = await Promise.all([
        ctx.db.task.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { project: { select: { id: true, name: true } } },
        }),
        ctx.db.task.count({ where }),
      ]);

      return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().max(2000).optional(),
        status: z.enum(["todo", "in_progress", "completed"]).default("todo"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        dueDate: z.string().datetime().optional(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { dueDate, ...rest } = input;
      return ctx.db.task.create({
        data: {
          ...rest,
          ...(dueDate && { dueDate: new Date(dueDate) }),
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(2000).optional(),
        status: z.enum(["todo", "in_progress", "completed"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        dueDate: z.string().datetime().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, dueDate, ...data } = input;
      return ctx.db.task.update({
        where: { id, userId: ctx.session.user.id },
        data: {
          ...data,
          ...(dueDate !== undefined && {
            dueDate: dueDate ? new Date(dueDate) : null,
          }),
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),
});
