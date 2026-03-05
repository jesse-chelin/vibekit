import * as fs from "fs";
import * as path from "path";

const BACKUP_DIR = ".vibekit/backup";

export function createBackup(rootDir: string, files: string[], skillName: string): string {
  const backupId = `${skillName}-${Date.now()}`;
  const backupPath = path.join(rootDir, BACKUP_DIR, backupId);
  fs.mkdirSync(backupPath, { recursive: true });

  for (const file of files) {
    const srcPath = path.join(rootDir, file);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(backupPath, file);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // Write manifest of backed up files
  fs.writeFileSync(
    path.join(backupPath, "_manifest.json"),
    JSON.stringify({ skillName, files, timestamp: new Date().toISOString() }, null, 2)
  );

  return backupId;
}

export function restoreBackup(rootDir: string, backupId: string): void {
  const backupPath = path.join(rootDir, BACKUP_DIR, backupId);
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup not found: ${backupId}`);
  }

  const manifestPath = path.join(backupPath, "_manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  for (const file of manifest.files as string[]) {
    const backupFile = path.join(backupPath, file);
    const destFile = path.join(rootDir, file);

    if (fs.existsSync(backupFile)) {
      fs.mkdirSync(path.dirname(destFile), { recursive: true });
      fs.copyFileSync(backupFile, destFile);
    }
  }

  console.log(`Restored backup: ${backupId}`);
}

export function cleanupBackup(rootDir: string, backupId: string): void {
  const backupPath = path.join(rootDir, BACKUP_DIR, backupId);
  if (fs.existsSync(backupPath)) {
    fs.rmSync(backupPath, { recursive: true, force: true });
  }
}
