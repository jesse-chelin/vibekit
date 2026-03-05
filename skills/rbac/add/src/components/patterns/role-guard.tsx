"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@/lib/rbac";
import { hasRole } from "@/lib/rbac";

interface RoleGuardProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "viewer";

  if (!hasRole(userRole, roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
