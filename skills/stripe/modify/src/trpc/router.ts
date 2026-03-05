import { createTRPCRouter } from "@/trpc/init";
import { projectRouter } from "@/trpc/routers/project";
import { taskRouter } from "@/trpc/routers/task";
import { userRouter } from "@/trpc/routers/user";
import { billingRouter } from "@/trpc/routers/billing";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  task: taskRouter,
  user: userRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
