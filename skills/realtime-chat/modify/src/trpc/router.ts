import { createTRPCRouter } from "@/trpc/init";
import { projectRouter } from "@/trpc/routers/project";
import { taskRouter } from "@/trpc/routers/task";
import { userRouter } from "@/trpc/routers/user";
import { chatRouter } from "@/trpc/routers/chat";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  task: taskRouter,
  user: userRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
