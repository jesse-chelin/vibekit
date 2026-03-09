import * as fs from "fs";
import * as path from "path";
import type { BuildSpec } from "./types";
import { resolvePath, deleteFileOrDir } from "./utils";
import { generatePrismaModels } from "./prisma-model";
import { generateTrpcRouters } from "./trpc-router";
import { generateListPage } from "./list-page";
import { generateDetailPage, generateDeleteButton } from "./detail-page";
import { generateFormPages } from "./form-page";
import { generateDashboard } from "./dashboard";
import { generateSidebar } from "./sidebar";
import { generateSeed } from "./seed";

function loadBuildSpec(specPath: string): BuildSpec {
  if (!fs.existsSync(specPath)) {
    console.error(`Build spec not found: ${specPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(specPath, "utf-8");
  const spec = JSON.parse(raw) as BuildSpec;

  // Basic validation
  if (!spec.appName) throw new Error("Build spec missing appName");
  if (!spec.models || spec.models.length === 0) throw new Error("Build spec has no models");
  if (!spec.sidebar || spec.sidebar.length === 0) throw new Error("Build spec has no sidebar items");
  if (!spec.dashboard) throw new Error("Build spec missing dashboard config");

  return spec;
}

function cleanupTemplateFiles(): void {
  // Remove template entity files
  deleteFileOrDir(resolvePath("src", "trpc", "routers", "project.ts"));
  deleteFileOrDir(resolvePath("src", "trpc", "routers", "task.ts"));
  deleteFileOrDir(resolvePath("src", "app", "(app)", "projects"));
}

function main(): void {
  const specPath = process.argv[2] || resolvePath(".vibekit", "build-spec.json");
  const resolvedPath = path.isAbsolute(specPath) ? specPath : path.resolve(process.cwd(), specPath);

  console.log(`\nVibeKit Code Generator`);
  console.log(`─────────────────────`);
  console.log(`Spec: ${resolvedPath}\n`);

  const spec = loadBuildSpec(resolvedPath);
  console.log(`Building: ${spec.appName}`);
  console.log(`Models: ${spec.models.map((m) => m.name).join(", ")}\n`);

  // 1. Clean up template files
  console.log("Cleaning template files...");
  cleanupTemplateFiles();

  // 2. Generate Prisma models
  console.log("\nGenerating data layer...");
  generatePrismaModels(spec);

  // 3. Generate tRPC routers
  generateTrpcRouters(spec);

  // 4. Generate pages for each model
  console.log("\nGenerating pages...");
  for (const model of spec.models) {
    generateListPage(model);
    generateDetailPage(model);
    generateDeleteButton(model);
    generateFormPages(model);
  }

  // 5. Generate dashboard
  generateDashboard(spec);

  // 6. Generate sidebar
  console.log("\nGenerating navigation...");
  generateSidebar(spec);

  // 7. Generate seed data
  console.log("\nGenerating seed data...");
  generateSeed(spec);

  // Summary
  const totalPages = spec.models.length * 4 + 1; // list + detail + create + edit per model + dashboard
  console.log(`\n✓ Generation complete!`);
  console.log(`  ${spec.models.length} models`);
  console.log(`  ${spec.models.length} tRPC routers (${spec.models.length * 5} procedures)`);
  console.log(`  ${totalPages} pages`);
  console.log(`  ${spec.sidebar.length} sidebar items`);
  console.log(`\nNext steps:`);
  console.log(`  1. pnpm db:push          (apply schema)`);
  console.log(`  2. pnpm db:seed          (seed data)`);
  console.log(`  3. pnpm build            (verify)`);
}

main();
