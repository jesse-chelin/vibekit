import { createTRPCRouter } from "@/trpc/init";
import { projectRouter } from "@/trpc/routers/project";
import { taskRouter } from "@/trpc/routers/task";
import { userRouter } from "@/trpc/routers/user";
import { adminRouter } from "@/trpc/routers/admin";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  task: taskRouter,
  user: userRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
