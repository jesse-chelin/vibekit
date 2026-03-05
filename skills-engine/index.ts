#!/usr/bin/env node

import * as path from "path";
import { applySkill } from "./apply.js";
import { removeSkill } from "./remove.js";
import { readState } from "./state.js";

const args = process.argv.slice(2);
const command = args[0];
const skillName = args[1];
const rootDir = path.resolve(process.cwd());

async function main() {
  switch (command) {
    case "apply":
    case "install": {
      if (!skillName) {
        console.error("Usage: npx tsx skills-engine/index.ts apply <skill-name>");
        process.exit(1);
      }
      const result = await applySkill(skillName, rootDir);
      if (!result.success) {
        console.error("\nErrors:", result.errors.join("\n  "));
        process.exit(1);
      }
      break;
    }

    case "remove":
    case "uninstall": {
      if (!skillName) {
        console.error("Usage: npx tsx skills-engine/index.ts remove <skill-name>");
        process.exit(1);
      }
      const result = await removeSkill(skillName, rootDir);
      if (!result.success) {
        console.error("\nErrors:", result.errors.join("\n  "));
        process.exit(1);
      }
      break;
    }

    case "list": {
      const state = readState(rootDir);
      if (state.installedSkills.length === 0) {
        console.log("No skills installed.");
      } else {
        console.log("Installed skills:");
        for (const skill of state.installedSkills) {
          console.log(`  ${skill.name}@${skill.version} (installed ${skill.installedAt})`);
        }
      }
      break;
    }

    default:
      console.log("Vibekit Skills Engine");
      console.log("");
      console.log("Usage:");
      console.log("  npx tsx skills-engine/index.ts apply <skill-name>   Install a skill");
      console.log("  npx tsx skills-engine/index.ts remove <skill-name>  Remove a skill");
      console.log("  npx tsx skills-engine/index.ts list                 List installed skills");
      break;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
