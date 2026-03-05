import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { createCallerFactory, createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/router";
import { makeQueryClient } from "@/trpc/query-client";

export const getQueryClient = cache(makeQueryClient);

const createCaller = createCallerFactory(appRouter);

const getContext = cache(async () => {
  const heads = new Headers();
  heads.set("x-trpc-source", "rsc");
  return createTRPCContext({ headers: heads });
});

export const caller = createCaller(getContext);

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  createCaller(getContext),
  getQueryClient
);
