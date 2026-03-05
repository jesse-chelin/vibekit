import * as fs from "fs";
import * as path from "path";
import { type SkillState, type InstalledSkill } from "./types.js";

const STATE_DIR = ".vibekit";
const STATE_FILE = "state.json";

function ensureStateDir(rootDir: string): void {
  const dir = path.join(rootDir, STATE_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readState(rootDir: string): SkillState {
  const statePath = path.join(rootDir, STATE_DIR, STATE_FILE);
  if (!fs.existsSync(statePath)) {
    return { installedSkills: [], lastModified: new Date().toISOString() };
  }
  return JSON.parse(fs.readFileSync(statePath, "utf-8")) as SkillState;
}

export function writeState(rootDir: string, state: SkillState): void {
  ensureStateDir(rootDir);
  state.lastModified = new Date().toISOString();
  const statePath = path.join(rootDir, STATE_DIR, STATE_FILE);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

export function addInstalledSkill(rootDir: string, skill: InstalledSkill): void {
  const state = readState(rootDir);
  state.installedSkills.push(skill);
  writeState(rootDir, state);
}

export function removeInstalledSkill(rootDir: string, skillName: string): InstalledSkill | null {
  const state = readState(rootDir);
  const index = state.installedSkills.findIndex((s) => s.name === skillName);
  if (index === -1) return null;
  const [removed] = state.installedSkills.splice(index, 1);
  writeState(rootDir, state);
  return removed;
}
