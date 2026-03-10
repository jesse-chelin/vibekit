import * as fs from "fs";
import * as path from "path";
import type { BuildSpec } from "./types";
import { resolvePath, deleteFileOrDir } from "./utils";
import { generatePrismaModels } from "./prisma-model";
import { generateTrpcRouters } from "./trpc-router";
import { generateExternalRouters } from "./trpc-router-external";
import { generateListPage } from "./list-page";
import { generateDetailPage, generateDeleteButton } from "./detail-page";
import { generateFormPages } from "./form-page";
import { generateDashboard } from "./dashboard";
import { generateSidebar } from "./sidebar";
import { generateSeed } from "./seed";
import { generateAppChrome } from "./app-chrome";
import { stripTemplateModels } from "./prisma-model";

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

  // Remove template pages that are generic stubs
  deleteFileOrDir(resolvePath("src", "app", "(app)", "onboarding"));
  deleteFileOrDir(resolvePath("src", "app", "(app)", "settings", "billing", "page.tsx"));
  deleteFileOrDir(resolvePath("src", "app", "(app)", "settings", "team", "page.tsx"));
}

function main(): void {
  const specPath = process.argv[2] || resolvePath(".vibekit", "build-spec.json");
  const resolvedPath = path.isAbsolute(specPath) ? specPath : path.resolve(process.cwd(), specPath);

  console.log(`\nVibeKit Code Generator`);
  console.log(`─────────────────────`);
  console.log(`Spec: ${resolvedPath}\n`);

  const spec = loadBuildSpec(resolvedPath);
  const isExternal = spec.dataSource === "external";

  console.log(`Building: ${spec.appName}`);
  console.log(`Data source: ${isExternal ? "external" : "prisma"}`);
  console.log(`Models: ${spec.models.map((m) => m.name).join(", ")}\n`);

  // 1. Clean up template files
  console.log("Cleaning template files...");
  cleanupTemplateFiles();

  // 2. Strip template Prisma models (Project/Task) before generating new ones
  console.log("\nStripping template Prisma models...");
  stripTemplateModels();

  // 3. Generate app chrome (logo, search command, root redirect)
  console.log("\nGenerating app chrome...");
  generateAppChrome(spec);

  // 4. Generate data layer
  console.log("\nGenerating data layer...");
  if (isExternal) {
    // External: skip Prisma models, use external router generator
    generateExternalRouters(spec);
  } else {
    // Prisma (default): generate models, routers, and seed
    generatePrismaModels(spec);
    generateTrpcRouters(spec);
  }

  // 5. Generate pages for each model
  console.log("\nGenerating pages...");
  for (const model of spec.models) {
    generateListPage(model);
    generateDetailPage(model);
    generateDeleteButton(model);
    generateFormPages(model);
  }

  // 6. Generate dashboard
  generateDashboard(spec);

  // 7. Generate sidebar
  console.log("\nGenerating navigation...");
  generateSidebar(spec);

  // 8. Generate seed data (skip for external)
  if (!isExternal) {
    console.log("\nGenerating seed data...");
    generateSeed(spec);
  }

  // Summary
  const readOnlyCount = spec.models.filter((m) => m.readOnly).length;
  const mutableCount = spec.models.length - readOnlyCount;
  const totalPages = mutableCount * 4 + readOnlyCount * 2 + 1; // mutable: list+detail+create+edit, readOnly: list+detail, +dashboard
  const procedureCount = isExternal
    ? spec.models.reduce((sum, m) => sum + (m.readOnly ? 2 : 5), 0)
    : spec.models.length * 5;

  console.log(`\n✓ Generation complete!`);
  console.log(`  ${spec.models.length} models${readOnlyCount > 0 ? ` (${readOnlyCount} read-only)` : ""}`);
  console.log(`  ${spec.models.length} tRPC routers (${procedureCount} procedures)`);
  console.log(`  ${totalPages} pages`);
  console.log(`  ${spec.sidebar.length} sidebar items`);

  if (isExternal) {
    console.log(`\nNext steps:`);
    console.log(`  1. Set EXTERNAL_DB_PATH in .env`);
    console.log(`  2. Implement query bodies in src/trpc/routers/ (search for "IMPLEMENT:")`);
    console.log(`  3. pnpm build            (verify)`);
  } else {
    console.log(`\nNext steps:`);
    console.log(`  1. pnpm db:push          (apply schema)`);
    console.log(`  2. pnpm db:seed          (seed data)`);
    console.log(`  3. pnpm build            (verify)`);
  }
}

main();
