import type { BuildSpec, ModelSpec } from "./types";
import {
  resolvePath,
  writeFile,
  deleteFileOrDir,
  lowerFirst,
  zodType,
  displayField,
} from "./utils";

const ROUTERS_DIR = resolvePath("src", "trpc", "routers");
const ROUTER_FILE = resolvePath("src", "trpc", "router.ts");
const USER_ROUTER_FILE = resolvePath("src", "trpc", "routers", "user.ts");

export function generateTrpcRouters(spec: BuildSpec): void {
  // Remove template routers
  deleteFileOrDir(resolvePath("src", "trpc", "routers", "project.ts"));
  deleteFileOrDir(resolvePath("src", "trpc", "routers", "task.ts"));

  // Generate a router for each model
  for (const model of spec.models) {
    const code = generateRouter(model, spec.models);
    writeFile(`${ROUTERS_DIR}/${lowerFirst(model.name)}.ts`, code);
  }

  // Rewrite router.ts with new imports
  generateRouterIndex(spec);

  // Update user.ts stats procedure
  generateUserStats(spec);

  console.log(
    `  ✓ tRPC routers: ${spec.models.length} routers (${spec.models.length * 5} procedures)`
  );
}

function generateRouter(model: ModelSpec, allModels: ModelSpec[]): string {
  const name = model.name;
  const lower = lowerFirst(name);
  const display = displayField(model.fields);
  const searchFields = model.searchFields.length > 0 ? model.searchFields : [display];

  // Collect enum fields for list input
  const enumFields = model.fields.filter((f) => f.enum);

  // Build search OR clause
  const searchOr = searchFields
    .map((f) => `            { ${f}: { contains: search } },`)
    .join("\n");

  // Build include for hasMany counts
  const hasManyCounts = model.hasMany
    .map((child) => `${lowerFirst(child)}s: true`)
    .join(", ");
  const includeCount = model.hasMany.length > 0
    ? `\n        include: { _count: { select: { ${hasManyCounts} } } },`
    : "";

  // Build byId include (include children)
  const byIdIncludes: string[] = [];
  for (const child of model.hasMany) {
    const childModel = allModels.find((m) => m.name === child);
    if (childModel) {
      byIdIncludes.push(`          ${lowerFirst(child)}s: { orderBy: { createdAt: "desc" } },`);
    }
  }
  if (model.hasMany.length > 0) {
    byIdIncludes.push(`          _count: { select: { ${hasManyCounts} } },`);
  }
  const byIdInclude = byIdIncludes.length > 0
    ? `\n        include: {\n${byIdIncludes.join("\n")}\n        },`
    : "";

  // Build create input fields
  const createFields = model.fields
    .map((f) => `      ${f.name}: ${zodType(f)},`)
    .join("\n");

  // Add belongsTo FK fields to create input
  const createFkFields = model.belongsTo
    .map((rel) => `      ${rel.field}: z.string(),`)
    .join("\n");

  // Build update input fields (all optional)
  const updateFields = model.fields
    .map((f) => `      ${f.name}: ${zodType(f, true)},`)
    .join("\n");

  // Build create data spread (handle DateTime conversion)
  const dateTimeFields = model.fields.filter((f) => f.type === "DateTime");
  let createDataSpread: string;
  if (dateTimeFields.length > 0) {
    const dtDestructure = dateTimeFields.map((f) => f.name).join(", ");
    const dtConversions = dateTimeFields
      .map((f) => `        ...(${f.name} && { ${f.name}: new Date(${f.name}) }),`)
      .join("\n");
    createDataSpread = `      const { ${dtDestructure}, ...rest } = input;
      return ctx.db.${lower}.create({
        data: {
          ...rest,
${dtConversions}
          userId: ctx.session.user.id,
        },
      });`;
  } else {
    createDataSpread = `      return ctx.db.${lower}.create({
        data: { ...input, userId: ctx.session.user.id },
      });`;
  }

  // Build update data spread
  let updateDataSpread: string;
  if (dateTimeFields.length > 0) {
    const dtDestructure = dateTimeFields.map((f) => f.name).join(", ");
    const dtConversions = dateTimeFields
      .map(
        (f) =>
          `        ...(${f.name} !== undefined && { ${f.name}: ${f.name} ? new Date(${f.name}) : null }),`
      )
      .join("\n");
    updateDataSpread = `      const { id, ${dtDestructure}, ...data } = input;
      return ctx.db.${lower}.update({
        where: { id, userId: ctx.session.user.id },
        data: {
          ...data,
${dtConversions}
        },
      });`;
  } else {
    updateDataSpread = `      const { id, ...data } = input;
      return ctx.db.${lower}.update({
        where: { id, userId: ctx.session.user.id },
        data,
      });`;
  }

  // Enum filter inputs
  const enumInputs = enumFields
    .map((f) => {
      const vals = f.enum!.map((v) => `"${v}"`).join(", ");
      return `      ${f.name}: z.enum([${vals}]).optional(),`;
    })
    .join("\n");

  // Enum where clauses
  const enumWheres = enumFields
    .map((f) => `      ...(${f.name} && { ${f.name} }),`)
    .join("\n");

  // Destructure enum names
  const enumDestructure = enumFields.length > 0
    ? enumFields.map((f) => f.name).join(", ") + ", "
    : "";

  return `import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const ${lower}Router = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
${enumInputs}
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { ${enumDestructure}search, page, pageSize } = input;
      const where = {
        userId: ctx.session.user.id,
${enumWheres}
        ...(search && {
          OR: [
${searchOr}
          ],
        }),
      };

      const [items, total] = await Promise.all([
        ctx.db.${lower}.findMany({
          where,
          orderBy: { ${model.defaultSort}: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,${includeCount}
        }),
        ctx.db.${lower}.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ${lower} = await ctx.db.${lower}.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },${byIdInclude}
      });
      if (!${lower}) throw new Error("${name} not found");
      return ${lower};
    }),

  create: protectedProcedure
    .input(
      z.object({
${createFields}
${createFkFields}
      })
    )
    .mutation(async ({ ctx, input }) => {
${createDataSpread}
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
${updateFields}
      })
    )
    .mutation(async ({ ctx, input }) => {
${updateDataSpread}
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.${lower}.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),
});
`;
}

function generateRouterIndex(spec: BuildSpec): void {
  const imports = spec.models
    .map(
      (m) =>
        `import { ${lowerFirst(m.name)}Router } from "@/trpc/routers/${lowerFirst(m.name)}";`
    )
    .join("\n");

  const entries = spec.models
    .map((m) => `  ${lowerFirst(m.name)}: ${lowerFirst(m.name)}Router,`)
    .join("\n");

  const code = `import { createTRPCRouter } from "@/trpc/init";
${imports}
import { userRouter } from "@/trpc/routers/user";

export const appRouter = createTRPCRouter({
${entries}
  user: userRouter,
});

export type AppRouter = typeof appRouter;
`;

  writeFile(ROUTER_FILE, code);
}

function generateUserStats(spec: BuildSpec): void {
  const countLines = spec.models
    .map(
      (m) =>
        `      ctx.db.${lowerFirst(m.name)}.count({ where: { userId: ctx.session.user.id } }),`
    )
    .join("\n");

  const countNames = spec.models.map((m) => `${lowerFirst(m.name)}Count`);
  const destructure = countNames.join(", ");
  const returnFields = countNames
    .map((name) => `      ${name},`)
    .join("\n");

  const code = `import { z } from "zod/v4";
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
    const [${destructure}] = await Promise.all([
${countLines}
    ]);

    return {
${returnFields}
    };
  }),
});
`;

  writeFile(USER_ROUTER_FILE, code);
}
