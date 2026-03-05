export type Role = "admin" | "member" | "viewer";

export const PERMISSIONS: Record<Role, string[]> = {
  admin: ["*"],
  member: ["read", "write", "delete:own"],
  viewer: ["read"],
};

export function hasPermission(role: Role, permission: string): boolean {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}

export function hasRole(userRole: string, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole as Role);
}
