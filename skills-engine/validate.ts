import * as fs from "fs";
import * as path from "path";
import { type SkillManifest, type SkillState } from "./types.js";

export function loadManifest(skillName: string, rootDir: string): SkillManifest {
  const manifestPath = path.join(rootDir, "skills", skillName, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Skill "${skillName}" not found at ${manifestPath}`);
  }
  const raw = fs.readFileSync(manifestPath, "utf-8");
  return JSON.parse(raw) as SkillManifest;
}

export function loadState(rootDir: string): SkillState {
  const statePath = path.join(rootDir, ".vibekit", "state.json");
  if (!fs.existsSync(statePath)) {
    return { installedSkills: [], lastModified: new Date().toISOString() };
  }
  return JSON.parse(fs.readFileSync(statePath, "utf-8")) as SkillState;
}

export function validateManifest(manifest: SkillManifest, rootDir: string): string[] {
  const errors: string[] = [];

  if (!manifest.name) errors.push("Manifest missing 'name'");
  if (!manifest.version) errors.push("Manifest missing 'version'");
  if (!manifest.description) errors.push("Manifest missing 'description'");

  // Check that files in 'adds' exist in the skill's add/ directory
  const skillDir = path.join(rootDir, "skills", manifest.name);
  for (const file of manifest.adds) {
    const addPath = path.join(skillDir, "add", file);
    if (!fs.existsSync(addPath)) {
      errors.push(`File to add not found: ${addPath}`);
    }
  }

  // Check that files in 'modifies' exist in the skill's modify/ directory
  for (const file of manifest.modifies) {
    const modifyPath = path.join(skillDir, "modify", file);
    if (!fs.existsSync(modifyPath)) {
      errors.push(`Modified file version not found: ${modifyPath}`);
    }
  }

  return errors;
}

export function checkDependencies(manifest: SkillManifest, state: SkillState): string[] {
  const errors: string[] = [];
  const installed = new Set(state.installedSkills.map((s) => s.name));

  for (const dep of manifest.dependencies.skills ?? []) {
    if (!installed.has(dep)) {
      errors.push(`Required skill "${dep}" is not installed. Install it first.`);
    }
  }

  return errors;
}

export function checkConflicts(manifest: SkillManifest, state: SkillState): string[] {
  const errors: string[] = [];
  const installed = new Set(state.installedSkills.map((s) => s.name));

  for (const conflict of manifest.conflicts ?? []) {
    if (installed.has(conflict)) {
      errors.push(`Skill "${manifest.name}" conflicts with installed skill "${conflict}"`);
    }
  }

  if (installed.has(manifest.name)) {
    errors.push(`Skill "${manifest.name}" is already installed`);
  }

  return errors;
}
