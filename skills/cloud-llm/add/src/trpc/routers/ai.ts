import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { chat } from "@/lib/cloud-llm";

export const aiRouter = createTRPCRouter({
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      const response = await chat(input.messages);
      return { content: response };
    }),
});
