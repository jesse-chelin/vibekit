import * as path from "path";
import { execSync } from "child_process";
import { type ApplyResult } from "./types.js";
import { loadManifest, loadState, validateManifest, checkDependencies, checkConflicts } from "./validate.js";
import { createBackup, restoreBackup, cleanupBackup } from "./backup.js";
import { copyAddedFiles, mergeModifiedFiles } from "./merge.js";
import { mergePackageJson, mergeEnvFiles } from "./structured.js";
import { addInstalledSkill } from "./state.js";

export async function applySkill(skillName: string, rootDir: string): Promise<ApplyResult> {
  console.log(`\nInstalling skill: ${skillName}`);
  console.log("─".repeat(40));

  const result: ApplyResult = {
    success: false,
    skill: skillName,
    filesAdded: [],
    filesModified: [],
    errors: [],
  };

  // 1. Load and validate manifest
  let manifest;
  try {
    manifest = loadManifest(skillName, rootDir);
  } catch (e) {
    result.errors.push((e as Error).message);
    return result;
  }

  const validationErrors = validateManifest(manifest, rootDir);
  if (validationErrors.length > 0) {
    result.errors = validationErrors;
    return result;
  }

  // 2. Check dependencies and conflicts
  const state = loadState(rootDir);
  const depErrors = checkDependencies(manifest, state);
  const conflictErrors = checkConflicts(manifest, state);
  if (depErrors.length > 0 || conflictErrors.length > 0) {
    result.errors = [...depErrors, ...conflictErrors];
    return result;
  }

  // 3. Create backup of files that will be modified
  const filesToBackup = [...manifest.modifies];
  let backupId = "";
  try {
    backupId = createBackup(rootDir, filesToBackup, skillName);
    console.log(`  Backup created: ${backupId}`);
  } catch (e) {
    result.errors.push(`Backup failed: ${(e as Error).message}`);
    return result;
  }

  try {
    // 4. Copy new files
    if (manifest.adds.length > 0) {
      console.log("\nAdding files:");
      copyAddedFiles(rootDir, skillName, manifest.adds);
      result.filesAdded = manifest.adds;
    }

    // 5. Merge modified files
    if (manifest.modifies.length > 0) {
      console.log("\nMerging files:");
      const { merged, conflicts } = mergeModifiedFiles(rootDir, skillName, manifest.modifies);
      result.filesModified = merged;
      if (conflicts.length > 0) {
        console.log(`\nWarning: ${conflicts.length} file(s) had merge conflicts`);
      }
    }

    // 6. Merge npm dependencies
    if (manifest.dependencies.npm && Object.keys(manifest.dependencies.npm).length > 0) {
      console.log("\nAdding dependencies:");
      mergePackageJson(rootDir, manifest.dependencies.npm);
    }

    // 7. Merge env variables
    if (manifest.dependencies.env && manifest.dependencies.env.length > 0) {
      console.log("\nAdding environment variables:");
      mergeEnvFiles(rootDir, manifest.dependencies.env);
    }

    // 8. Run pnpm install if new deps added
    if (manifest.dependencies.npm && Object.keys(manifest.dependencies.npm).length > 0) {
      console.log("\nInstalling dependencies...");
      execSync("pnpm install", { cwd: rootDir, stdio: "inherit" });
    }

    // 9. Run post-install commands
    if (manifest.postInstall && manifest.postInstall.length > 0) {
      console.log("\nRunning post-install commands:");
      for (const cmd of manifest.postInstall) {
        console.log(`  $ ${cmd}`);
        execSync(cmd, { cwd: rootDir, stdio: "inherit" });
      }
    }

    // 10. Record installation
    addInstalledSkill(rootDir, {
      name: manifest.name,
      version: manifest.version,
      installedAt: new Date().toISOString(),
      files: {
        added: manifest.adds,
        modified: manifest.modifies,
      },
    });

    result.success = true;
    console.log(`\nSkill "${skillName}" installed successfully!`);

    // Clean up backup on success (keep for rollback if needed)
    // cleanupBackup(rootDir, backupId);

  } catch (e) {
    const error = e as Error;
    result.errors.push(error.message);
    console.error(`\nInstallation failed: ${error.message}`);
    console.log("Rolling back changes...");

    // Rollback
    try {
      restoreBackup(rootDir, backupId);
      // Remove added files
      for (const file of result.filesAdded) {
        const filePath = path.join(rootDir, file);
        const fs = await import("fs");
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      console.log("Rollback complete.");
    } catch (rollbackError) {
      console.error(`Rollback failed: ${(rollbackError as Error).message}`);
      result.errors.push(`Rollback failed: ${(rollbackError as Error).message}`);
    }
  }

  return result;
}
