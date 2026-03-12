import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import type { FieldSpec } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, "..");

export function resolvePath(...segments: string[]): string {
  return path.join(PROJECT_ROOT, ...segments);
}

export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

export function deleteFileOrDir(filePath: string): void {
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fs.rmSync(filePath, { recursive: true });
    } else {
      fs.unlinkSync(filePath);
    }
  }
}

/** "Chore" → "chore" */
export function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** "Chore" → "chores" (simple pluralize — add 's' or 'es') */
export function pluralize(s: string): string {
  if (s.endsWith("s") || s.endsWith("x") || s.endsWith("sh") || s.endsWith("ch")) {
    return s + "es";
  }
  if (s.endsWith("y") && !/[aeiou]y$/i.test(s)) {
    return s.slice(0, -1) + "ies";
  }
  return s + "s";
}

/** "dueDate" → "Due Date" */
export function camelToTitle(s: string): string {
  return s
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/** "ChoreAssignment" → "chore-assignment" */
export function toKebab(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

/** Map FieldSpec type to Prisma type string */
export function prismaType(field: FieldSpec): string {
  const base = field.type === "DateTime" ? "DateTime" : field.type;
  const optional = !field.required ? "?" : "";
  return `${base}${optional}`;
}

/** Map FieldSpec type to Zod validator string */
export function zodType(field: FieldSpec, forUpdate = false): string {
  if (field.enum) {
    const enumStr = field.enum.map((v) => `"${v}"`).join(", ");
    let z = `z.enum([${enumStr}])`;
    if (field.defaultEnum && !forUpdate) z += `.default("${field.defaultEnum}")`;
    if (forUpdate || !field.required) z += ".optional()";
    return z;
  }

  switch (field.type) {
    case "String": {
      let z = "z.string()";
      if (field.required && !forUpdate) z += ".min(1)";
      if (field.maxLength) z += `.max(${field.maxLength})`;
      if (forUpdate || !field.required) z += ".optional()";
      return z;
    }
    case "Int":
    case "Float": {
      let z = field.type === "Int" ? "z.number().int()" : "z.number()";
      if (forUpdate || !field.required) z += ".optional()";
      return z;
    }
    case "Boolean": {
      let z = "z.boolean()";
      if (field.default !== undefined && !forUpdate) z += `.default(${field.default})`;
      if (forUpdate || !field.required) z += ".optional()";
      return z;
    }
    case "DateTime": {
      let z = "z.string().datetime()";
      z += ".optional()";
      if (forUpdate) z += ".nullable()";
      return z;
    }
    default:
      return "z.string().optional()";
  }
}

/** Get the primary display field name (first required String field, or "name"/"title") */
export function displayField(fields: FieldSpec[]): string {
  const nameField = fields.find((f) => f.name === "name" || f.name === "title");
  if (nameField) return nameField.name;
  const firstRequired = fields.find((f) => f.required && f.type === "String");
  return firstRequired?.name ?? fields[0]?.name ?? "id";
}

/** Generate status/priority color maps for enum fields */
export function enumColorMap(field: FieldSpec): Record<string, string> | null {
  if (!field.enum) return null;

  const statusLike = field.name === "status" || field.name.endsWith("Status");
  const priorityLike = field.name === "priority" || field.name.endsWith("Priority");

  if (priorityLike) {
    const colors: Record<string, string> = {};
    for (const val of field.enum) {
      if (val === "high" || val === "urgent" || val === "critical") {
        colors[val] = "bg-destructive/10 text-destructive";
      } else if (val === "medium" || val === "normal") {
        colors[val] = "bg-warning/10 text-warning";
      } else {
        colors[val] = "bg-muted text-muted-foreground";
      }
    }
    return colors;
  }

  if (statusLike) {
    const colors: Record<string, string> = {};
    const positive = ["active", "completed", "done", "approved", "paid", "open"];
    for (const val of field.enum) {
      if (positive.includes(val)) {
        colors[val] = "bg-success/10 text-success";
      } else {
        colors[val] = "bg-muted text-muted-foreground";
      }
    }
    return colors;
  }

  return null;
}

const ICON_COLORS = [
  "text-blue-500",
  "text-emerald-500",
  "text-amber-500",
  "text-violet-500",
];

export function iconColor(index: number): string {
  return ICON_COLORS[index % ICON_COLORS.length];
}
