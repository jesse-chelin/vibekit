import type { BuildSpec, ModelSpec, FieldSpec } from "./types";
import { resolvePath, readFile, writeFile, lowerFirst, prismaType } from "./utils";

const SCHEMA_PATH = resolvePath("prisma", "schema.prisma");
const APP_MODELS_MARKER = "// ─── App Models";

/**
 * Strip template models (Project, Task) and their User relations from schema.prisma.
 * Called before generating new models — works for both Prisma and external data source modes.
 */
export function stripTemplateModels(): void {
  let schema = readFile(SCHEMA_PATH);

  // Remove everything after the App Models marker (template Project/Task models)
  const markerIdx = schema.indexOf(APP_MODELS_MARKER);
  if (markerIdx !== -1) {
    schema = schema.substring(0, markerIdx);
  }

  // Remove template relation fields from User model (projects, tasks)
  const preserveRelations = ["accounts", "sessions"];
  schema = removeAppUserRelations(schema, preserveRelations);

  writeFile(SCHEMA_PATH, schema);
  console.log("  ✓ Stripped template Prisma models (Project, Task)");
}

export function generatePrismaModels(spec: BuildSpec): void {
  let schema = readFile(SCHEMA_PATH);

  // Remove everything after the App Models marker (template models)
  const markerIdx = schema.indexOf(APP_MODELS_MARKER);
  if (markerIdx !== -1) {
    schema = schema.substring(0, markerIdx);
  }

  // Remove all app-specific relation fields from User model (keep accounts, sessions)
  const preserveRelations = ["accounts", "sessions"];
  schema = removeAppUserRelations(schema, preserveRelations);

  // Add new relation fields to User model
  const userRelations = spec.models.map(
    (m) => `  ${lowerFirst(m.name)}s ${m.name}[]`
  );
  schema = addUserRelations(schema, userRelations);

  // Add App Models section with all new models
  schema += `${APP_MODELS_MARKER} ─────────────────────────────────────────────\n`;

  for (const model of spec.models) {
    schema += "\n" + generateModelBlock(model, spec.models) + "\n";
  }

  writeFile(SCHEMA_PATH, schema);
  console.log(`  ✓ Prisma schema: ${spec.models.length} models`);
}

function generateModelBlock(model: ModelSpec, allModels: ModelSpec[]): string {
  const lines: string[] = [];
  lines.push(`model ${model.name} {`);

  // Standard ID + timestamps
  lines.push("  id        String   @id @default(cuid())");

  // User-defined fields
  for (const field of model.fields) {
    const typeStr = prismaType(field);
    const padding = " ".repeat(Math.max(1, 10 - field.name.length));
    let line = `  ${field.name}${padding}${typeStr}`;

    // Add @default for enum fields
    if (field.enum && field.defaultEnum) {
      line += `   @default("${field.defaultEnum}")`;
    } else if (field.default !== undefined && !field.enum) {
      if (typeof field.default === "string") {
        line += `   @default("${field.default}")`;
      } else {
        line += `   @default(${field.default})`;
      }
    }

    lines.push(line);
  }

  // BelongsTo FK fields
  for (const rel of model.belongsTo) {
    const padding = " ".repeat(Math.max(1, 10 - rel.field.length));
    lines.push(`  ${rel.field}${padding}String`);
  }

  // userId is always present
  lines.push("  userId    String");
  lines.push("  createdAt DateTime @default(now())");
  lines.push("  updatedAt DateTime @updatedAt");

  // Blank line before relations
  lines.push("");

  // BelongsTo relation directives
  for (const rel of model.belongsTo) {
    const relName = lowerFirst(rel.model);
    lines.push(
      `  ${relName} ${rel.model} @relation(fields: [${rel.field}], references: [id], onDelete: Cascade)`
    );
  }

  // User relation (always)
  lines.push(
    "  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)"
  );

  // HasMany reverse relations
  for (const childName of model.hasMany) {
    const childModel = allModels.find((m) => m.name === childName);
    if (childModel) {
      lines.push(`  ${lowerFirst(childName)}s ${childName}[]`);
    }
  }

  // Blank line before indexes
  lines.push("");

  // Indexes
  for (const rel of model.belongsTo) {
    lines.push(`  @@index([${rel.field}])`);
  }
  lines.push("  @@index([userId])");

  // Index enum fields (status, priority, etc.)
  for (const field of model.fields) {
    if (field.enum && (field.name === "status" || field.name === "priority")) {
      lines.push(`  @@index([${field.name}])`);
    }
  }

  lines.push("}");
  return lines.join("\n");
}

/** Remove all relation array fields from the User model except the ones to preserve */
function removeAppUserRelations(schema: string, preserve: string[]): string {
  // Match any "  fieldName ModelName[]" lines in the User model
  // Keep only the ones in the preserve list (accounts, sessions)
  const userModelRegex = /model User \{[\s\S]*?\n\}/;
  const match = schema.match(userModelRegex);
  if (!match) return schema;

  const userBlock = match[0];
  const cleanedBlock = userBlock
    .split("\n")
    .filter((line) => {
      const relationMatch = line.match(/^\s+(\w+)\s+\w+\[\]\s*$/);
      if (!relationMatch) return true; // keep non-relation lines
      return preserve.includes(relationMatch[1]); // keep only preserved relations
    })
    .join("\n");

  return schema.replace(userModelRegex, cleanedBlock);
}

function addUserRelations(schema: string, relations: string[]): string {
  // Find the closing brace of the User model and insert relations before it
  // Look for the pattern: User model's last relation line before the closing }
  const userModelRegex = /model User \{[\s\S]*?\n\}/;
  const match = schema.match(userModelRegex);
  if (!match) return schema;

  const userBlock = match[0];
  const closingIdx = userBlock.lastIndexOf("}");
  const newBlock =
    userBlock.substring(0, closingIdx) +
    relations.join("\n") +
    "\n}\n";

  return schema.replace(userModelRegex, newBlock);
}
