import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

/**
 * Copy new files from skill's add/ directory into the project.
 */
export function copyAddedFiles(rootDir: string, skillName: string, files: string[]): void {
  const skillDir = path.join(rootDir, "skills", skillName, "add");

  for (const file of files) {
    const src = path.join(skillDir, file);
    const dest = path.join(rootDir, file);

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`  Added: ${file}`);
  }
}

/**
 * Merge modified files using git merge-file (3-way merge).
 * Falls back to overwrite if base file doesn't exist.
 */
export function mergeModifiedFiles(
  rootDir: string,
  skillName: string,
  files: string[]
): { merged: string[]; conflicts: string[] } {
  const skillDir = path.join(rootDir, "skills", skillName, "modify");
  const baseDir = path.join(rootDir, ".vibekit", "base");
  const merged: string[] = [];
  const conflicts: string[] = [];

  for (const file of files) {
    const currentPath = path.join(rootDir, file);
    const skillVersionPath = path.join(skillDir, file);
    const basePath = path.join(baseDir, file);

    if (!fs.existsSync(currentPath)) {
      // File doesn't exist in project yet, just copy the skill version
      fs.mkdirSync(path.dirname(currentPath), { recursive: true });
      fs.copyFileSync(skillVersionPath, currentPath);
      merged.push(file);
      console.log(`  Added (new): ${file}`);
      continue;
    }

    if (!fs.existsSync(basePath)) {
      // No base file — try to use git merge-file with current as base
      // This effectively appends skill changes
      try {
        const tmpBase = `${currentPath}.base.tmp`;
        fs.copyFileSync(currentPath, tmpBase);
        execSync(`git merge-file "${currentPath}" "${tmpBase}" "${skillVersionPath}"`, {
          cwd: rootDir,
          stdio: "pipe",
        });
        fs.unlinkSync(tmpBase);
        merged.push(file);
        console.log(`  Merged: ${file}`);
      } catch {
        // Merge conflict — overwrite with skill version and warn
        fs.copyFileSync(skillVersionPath, currentPath);
        conflicts.push(file);
        console.log(`  Conflict (overwritten): ${file}`);
      }
    } else {
      // 3-way merge: base (original) vs current vs skill version
      try {
        execSync(
          `git merge-file "${currentPath}" "${basePath}" "${skillVersionPath}"`,
          { cwd: rootDir, stdio: "pipe" }
        );
        merged.push(file);
        console.log(`  Merged (3-way): ${file}`);
      } catch {
        conflicts.push(file);
        console.log(`  Conflict: ${file} (manual resolution needed)`);
      }
    }
  }

  return { merged, conflicts };
}

/**
 * Remove files that were added by a skill.
 */
export function removeAddedFiles(rootDir: string, files: string[]): void {
  for (const file of files) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  Removed: ${file}`);

      // Clean up empty parent directories
      let dir = path.dirname(filePath);
      while (dir !== rootDir) {
        const contents = fs.readdirSync(dir);
        if (contents.length === 0) {
          fs.rmdirSync(dir);
          dir = path.dirname(dir);
        } else {
          break;
        }
      }
    }
  }
}
