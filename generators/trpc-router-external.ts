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
const EXTERNAL_DB_FILE = resolvePath("src", "lib", "external-db.ts");

export function generateExternalRouters(spec: BuildSpec): void {
  // Remove template routers
  deleteFileOrDir(resolvePath("src", "trpc", "routers", "project.ts"));
  deleteFileOrDir(resolvePath("src", "trpc", "routers", "task.ts"));

  // Generate a router for each model
  for (const model of spec.models) {
    const code = generateExternalRouter(model);
    writeFile(`${ROUTERS_DIR}/${lowerFirst(model.name)}.ts`, code);
  }

  // Rewrite router.ts with new imports
  generateRouterIndex(spec);

  // Update user.ts stats procedure
  generateExternalUserStats(spec);

  // Generate external-db.ts skeleton
  generateExternalDbModule();

  const procedureCount = spec.models.reduce(
    (sum, m) => sum + (m.readOnly ? 2 : 5),
    0
  );
  console.log(
    `  ✓ tRPC routers (external): ${spec.models.length} routers (${procedureCount} procedures)`
  );
  console.log(`  ✓ External DB module: src/lib/external-db.ts`);
}

function generateExternalRouter(model: ModelSpec): string {
  const name = model.name;
  const lower = lowerFirst(name);
  const display = displayField(model.fields);
  const searchFields =
    model.searchFields.length > 0 ? model.searchFields : [display];
  const readOnly = model.readOnly === true;

  // Collect enum fields for list input
  const enumFields = model.fields.filter((f) => f.enum);

  // Enum filter inputs
  const enumInputs = enumFields
    .map((f) => {
      const vals = f.enum!.map((v) => `"${v}"`).join(", ");
      return `      ${f.name}: z.enum([${vals}]).optional(),`;
    })
    .join("\n");

  // Destructure enum names
  const enumDestructure =
    enumFields.length > 0
      ? enumFields.map((f) => f.name).join(", ") + ", "
      : "";

  // Build output type fields for list items
  const outputFields = [
    "  id: string;",
    ...model.fields.map((f) => {
      const tsType =
        f.type === "String"
          ? "string"
          : f.type === "Int" || f.type === "Float"
            ? "number"
            : f.type === "Boolean"
              ? "boolean"
              : "string";
      const nullable = !f.required ? " | null" : "";
      return `  ${f.name}: ${tsType}${nullable};`;
    }),
    "  createdAt: string;",
    "  updatedAt: string;",
  ];
  if (model.hasMany.length > 0) {
    const countFields = model.hasMany
      .map((c) => `${lowerFirst(c)}s: number`)
      .join("; ");
    outputFields.push(`  _count: { ${countFields} };`);
  }

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

  // Mutation procedures (only if not readOnly)
  const mutationProcedures = readOnly
    ? ""
    : `

  create: protectedProcedure
    .input(
      z.object({
${createFields}
${createFkFields}
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // IMPLEMENT: Insert into external database
      // Example:
      //   const id = crypto.randomUUID();
      //   db.prepare("INSERT INTO ${lower}s (id, ...) VALUES (?, ...)").run(id, ...);
      //   return { id, ...input, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      throw new Error("Not implemented: ${lower}.create");
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
${updateFields}
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      // IMPLEMENT: Update in external database
      // Example:
      //   db.prepare("UPDATE ${lower}s SET ... WHERE id = ?").run(..., id);
      //   return { id, ...data, updatedAt: new Date().toISOString() };
      throw new Error("Not implemented: ${lower}.update");
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // IMPLEMENT: Delete from external database
      // Example:
      //   db.prepare("DELETE FROM ${lower}s WHERE id = ?").run(input.id);
      //   return { id: input.id };
      throw new Error("Not implemented: ${lower}.delete");
    }),`;

  return `import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { getDb } from "@/lib/external-db";

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
      const db = getDb();
      const offset = (page - 1) * pageSize;

      // IMPLEMENT: Query external database
      // Example:
      //   let sql = "SELECT * FROM ${lower}s WHERE 1=1";
      //   const params: unknown[] = [];
      //   if (search) { sql += " AND ${display} LIKE ?"; params.push(\`%\${search}%\`); }
      //   sql += " ORDER BY ${model.defaultSort} DESC LIMIT ? OFFSET ?";
      //   params.push(pageSize, offset);
      //   const items = db.prepare(sql).all(...params);
      //   const total = db.prepare("SELECT COUNT(*) as count FROM ${lower}s").get().count;

      // eslint-disable-next-line no-console
      console.warn("⚠ ${lower}.list not implemented — returning empty results. Search for IMPLEMENT: in src/trpc/routers/${lower}.ts");

      const items: Array<{
${outputFields.join("\n")}
      }> = [];
      const total = 0;

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
      const db = getDb();

      // IMPLEMENT: Query external database by ID
      // Example:
      //   const row = db.prepare("SELECT * FROM ${lower}s WHERE id = ?").get(input.id);
      //   if (!row) throw new Error("${name} not found");
      //   return row;

      throw new Error("Not implemented: ${lower}.byId");
    }),${mutationProcedures}
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

function generateExternalUserStats(spec: BuildSpec): void {
  const countStubs = spec.models
    .map((m) => {
      const lower = lowerFirst(m.name);
      return `      // IMPLEMENT: const ${lower}Count = db.prepare("SELECT COUNT(*) as count FROM ${lower}s").get()?.count ?? 0;
      const ${lower}Count = 0;`;
    })
    .join("\n");

  const returnFields = spec.models
    .map((m) => `      ${lowerFirst(m.name)}Count,`)
    .join("\n");

  const code = `import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { getDb } from "@/lib/external-db";

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
    const db = getDb();

${countStubs}

    return {
${returnFields}
    };
  }),
});
`;

  writeFile(USER_ROUTER_FILE, code);
}

function generateExternalDbModule(): void {
  const code = `import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";

// IMPLEMENT: Set this to the path of your external database
const DB_PATH = path.resolve(process.env.EXTERNAL_DB_PATH ?? "./data/external.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(
      \`External database not found at \${DB_PATH}. Set EXTERNAL_DB_PATH env var to the correct path.\`
    );
  }

  db = new Database(DB_PATH, { readonly: true });

  // NOTE: Do NOT set WAL pragma or any write-mode pragma on read-only connections.
  // db.pragma("journal_mode = WAL") will throw SQLITE_READONLY.

  return db;
}
`;

  writeFile(EXTERNAL_DB_FILE, code);
}
