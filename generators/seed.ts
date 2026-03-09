import type { BuildSpec, ModelSpec, FieldSpec } from "./types";
import { resolvePath, writeFile, lowerFirst } from "./utils";

const SEED_PATH = resolvePath("prisma", "seed.ts");

export function generateSeed(spec: BuildSpec): void {
  writeFile(SEED_PATH, generateSeedFile(spec));
  console.log("  ✓ Seed data");
}

function generateSeedFile(spec: BuildSpec): string {
  // Order models so parents come before children
  const ordered = topologicalSort(spec.models);

  const createBlocks: string[] = [];
  const seedCounts: string[] = [];

  for (const model of ordered) {
    const lower = lowerFirst(model.name);
    const records = generateRecords(model, spec.models);

    // Check if this model has parent relations
    const parentRefs = model.belongsTo.map((rel) => {
      const parentLower = lowerFirst(rel.model);
      return { field: rel.field, varName: `${parentLower}s` };
    });

    const recordsStr = records
      .map((record, i) => {
        const entries = Object.entries(record)
          .map(([key, val]) => {
            // Check if this field references a parent
            const parentRef = parentRefs.find((p) => p.field === key);
            if (parentRef) {
              return `${key}: ${parentRef.varName}[${i % 3}].id`;
            }
            if (typeof val === "string") return `${key}: "${val}"`;
            if (val instanceof Date) return `${key}: new Date("${val.toISOString()}")`;
            return `${key}: ${val}`;
          })
          .join(", ");
        return `      { ${entries} },`;
      })
      .join("\n");

    createBlocks.push(`  const ${lower}s = await Promise.all(
    [
${recordsStr}
    ].map((item) =>
      prisma.${lower}.create({
        data: { ...item, userId: user.id },
      })
    )
  );`);

    seedCounts.push(`${records.length} ${model.label.toLowerCase()}`);
  }

  return `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { email: "demo@vibekit.dev" },
    update: {},
    create: {
      email: "demo@vibekit.dev",
      name: "Demo User",
      role: "admin",
    },
  });

${createBlocks.join("\n\n")}

  console.log("Seeded: 1 user, ${seedCounts.join(", ")}");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
`;
}

function generateRecords(
  model: ModelSpec,
  _allModels: ModelSpec[]
): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];
  const count = Math.min(5, Math.max(3, model.fields.length));

  for (let i = 0; i < count; i++) {
    const record: Record<string, unknown> = {};

    for (const field of model.fields) {
      record[field.name] = generateFieldValue(field, model, i);
    }

    // Add FK fields for belongsTo relations (placeholder — will be replaced with refs)
    for (const rel of model.belongsTo) {
      record[rel.field] = `__ref__`;
    }

    records.push(record);
  }

  return records;
}

function generateFieldValue(
  field: FieldSpec,
  model: ModelSpec,
  index: number
): unknown {
  if (field.enum) {
    return field.enum[index % field.enum.length];
  }

  const nameVariants = [
    `${model.labelSingular} Alpha`,
    `${model.labelSingular} Beta`,
    `${model.labelSingular} Gamma`,
    `${model.labelSingular} Delta`,
    `${model.labelSingular} Epsilon`,
  ];

  const descVariants = [
    `First ${model.labelSingular.toLowerCase()} for testing`,
    `Second ${model.labelSingular.toLowerCase()} with more details`,
    `Another ${model.labelSingular.toLowerCase()} to work with`,
    `Important ${model.labelSingular.toLowerCase()} to review`,
    `Recently created ${model.labelSingular.toLowerCase()}`,
  ];

  switch (field.type) {
    case "String":
      if (field.name === "name" || field.name === "title") {
        return nameVariants[index % nameVariants.length];
      }
      if (field.name === "description") {
        return descVariants[index % descVariants.length];
      }
      if (field.name === "email") return `user${index + 1}@example.com`;
      if (field.name === "url" || field.name === "website") return `https://example.com/${index + 1}`;
      return `${field.name} ${index + 1}`;

    case "Int":
      return index * 10 + 1;

    case "Float":
      return Math.round((index * 10.5 + 1.5) * 100) / 100;

    case "Boolean":
      return index % 2 === 0;

    case "DateTime":
      if (!field.required) return undefined;
      const date = new Date();
      date.setDate(date.getDate() + index * 7);
      return date;

    default:
      return `${field.name}_${index}`;
  }
}

function topologicalSort(models: ModelSpec[]): ModelSpec[] {
  const sorted: ModelSpec[] = [];
  const visited = new Set<string>();
  const modelMap = new Map(models.map((m) => [m.name, m]));

  function visit(model: ModelSpec) {
    if (visited.has(model.name)) return;
    visited.add(model.name);

    // Visit parents first
    for (const rel of model.belongsTo) {
      const parent = modelMap.get(rel.model);
      if (parent) visit(parent);
    }

    sorted.push(model);
  }

  for (const model of models) {
    visit(model);
  }

  return sorted;
}
