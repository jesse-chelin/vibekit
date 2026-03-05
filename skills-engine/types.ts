export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  category: "integration" | "feature" | "deploy" | "ui" | "security" | "infra";
  adds: string[];
  modifies: string[];
  dependencies: {
    npm?: Record<string, string>;
    env?: string[];
    skills?: string[];
  };
  conflicts?: string[];
  postInstall?: string[];
}

export interface SkillState {
  installedSkills: InstalledSkill[];
  lastModified: string;
}

export interface InstalledSkill {
  name: string;
  version: string;
  installedAt: string;
  files: {
    added: string[];
    modified: string[];
  };
}

export interface ApplyResult {
  success: boolean;
  skill: string;
  filesAdded: string[];
  filesModified: string[];
  errors: string[];
}
