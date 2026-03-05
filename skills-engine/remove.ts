import * as path from "path";
import { execSync } from "child_process";
import { loadManifest } from "./validate.js";
import { removeInstalledSkill, readState } from "./state.js";
import { removeAddedFiles } from "./merge.js";
import { removePackageDeps } from "./structured.js";
import { restoreBackup } from "./backup.js";

export async function removeSkill(skillName: string, rootDir: string): Promise<{ success: boolean; errors: string[] }> {
  console.log(`\nRemoving skill: ${skillName}`);
  console.log("─".repeat(40));

  const errors: string[] = [];

  // Check if installed
  const state = readState(rootDir);
  const installed = state.installedSkills.find((s) => s.name === skillName);
  if (!installed) {
    return { success: false, errors: [`Skill "${skillName}" is not installed`] };
  }

  // Check if other skills depend on this one
  for (const other of state.installedSkills) {
    if (other.name === skillName) continue;
    try {
      const manifest = loadManifest(other.name, rootDir);
      if (manifest.dependencies.skills?.includes(skillName)) {
        errors.push(`Cannot remove: skill "${other.name}" depends on "${skillName}"`);
      }
    } catch {
      // Skip if manifest can't be loaded
    }
  }

  if (errors.length > 0) return { success: false, errors };

  try {
    // Load manifest for dependency info
    const manifest = loadManifest(skillName, rootDir);

    // Remove added files
    if (installed.files.added.length > 0) {
      console.log("\nRemoving files:");
      removeAddedFiles(rootDir, installed.files.added);
    }

    // Try to restore modified files from backup
    const fs = await import("fs");
    const backupDir = path.join(rootDir, ".vibekit", "backup");
    if (fs.existsSync(backupDir)) {
      const backups = fs.readdirSync(backupDir)
        .filter((d: string) => d.startsWith(`${skillName}-`))
        .sort()
        .reverse();

      if (backups.length > 0) {
        console.log("\nRestoring modified files:");
        restoreBackup(rootDir, backups[0]);
      }
    }

    // Remove npm dependencies (only if not used by other skills)
    if (manifest.dependencies.npm) {
      const otherDeps = new Set<string>();
      for (const other of state.installedSkills) {
        if (other.name === skillName) continue;
        try {
          const otherManifest = loadManifest(other.name, rootDir);
          for (const dep of Object.keys(otherManifest.dependencies.npm ?? {})) {
            otherDeps.add(dep);
          }
        } catch {
          // Skip
        }
      }

      const depsToRemove = Object.keys(manifest.dependencies.npm).filter(
        (dep) => !otherDeps.has(dep)
      );

      if (depsToRemove.length > 0) {
        console.log("\nRemoving dependencies:");
        removePackageDeps(rootDir, depsToRemove);
        execSync("pnpm install", { cwd: rootDir, stdio: "inherit" });
      }
    }

    // Update state
    removeInstalledSkill(rootDir, skillName);
    console.log(`\nSkill "${skillName}" removed successfully!`);

    return { success: true, errors: [] };
  } catch (e) {
    return { success: false, errors: [(e as Error).message] };
  }
}
