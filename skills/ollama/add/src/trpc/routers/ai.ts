import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { chat, listModels } from "@/lib/ollama";

export const aiRouter = createTRPCRouter({
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({ role: z.string(), content: z.string() })),
      model: z.string().default("llama3.2"),
    }))
    .mutation(async ({ input }) => {
      const response = await chat(input.messages, input.model);
      return { content: response };
    }),

  models: protectedProcedure.query(async () => {
    return listModels();
  }),
});
