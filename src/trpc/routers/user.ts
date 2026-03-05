import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const [projectCount, taskCount, completedTaskCount] = await Promise.all([
      ctx.db.project.count({ where: { userId: ctx.session.user.id } }),
      ctx.db.task.count({ where: { userId: ctx.session.user.id } }),
      ctx.db.task.count({
        where: { userId: ctx.session.user.id, status: "completed" },
      }),
    ]);

    return {
      projectCount,
      taskCount,
      completedTaskCount,
      completionRate: taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0,
    };
  }),
});
