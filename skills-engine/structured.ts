import * as fs from "fs";
import * as path from "path";
import { type SkillManifest } from "./types.js";

/**
 * Merge npm dependencies into package.json
 */
export function mergePackageJson(rootDir: string, deps: Record<string, string>): void {
  const pkgPath = path.join(rootDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  if (!pkg.dependencies) pkg.dependencies = {};
  for (const [name, version] of Object.entries(deps)) {
    pkg.dependencies[name] = version;
    console.log(`  Added dependency: ${name}@${version}`);
  }

  // Sort dependencies
  pkg.dependencies = Object.fromEntries(
    Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b))
  );

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

/**
 * Merge environment variables into .env.example and .env.local
 */
export function mergeEnvFiles(rootDir: string, envVars: string[]): void {
  const envExamplePath = path.join(rootDir, ".env.example");
  const envLocalPath = path.join(rootDir, ".env.local");

  for (const envFile of [envExamplePath, envLocalPath]) {
    if (!fs.existsSync(envFile)) continue;

    let content = fs.readFileSync(envFile, "utf-8");
    const existingVars = new Set(
      content.split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.split("=")[0])
    );

    const newVars = envVars.filter((v) => !existingVars.has(v));
    if (newVars.length > 0) {
      content += "\n# Added by skill\n";
      for (const v of newVars) {
        content += `${v}=""\n`;
        console.log(`  Added env var: ${v} to ${path.basename(envFile)}`);
      }
      fs.writeFileSync(envFile, content);
    }
  }
}

/**
 * Remove npm dependencies from package.json
 */
export function removePackageDeps(rootDir: string, deps: string[]): void {
  const pkgPath = path.join(rootDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  for (const dep of deps) {
    if (pkg.dependencies?.[dep]) {
      delete pkg.dependencies[dep];
      console.log(`  Removed dependency: ${dep}`);
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}
