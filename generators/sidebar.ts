import type { BuildSpec } from "./types";
import { resolvePath, writeFile } from "./utils";

const SIDEBAR_PATH = resolvePath(
  "src",
  "components",
  "layout",
  "app-sidebar.tsx"
);

export function generateSidebar(spec: BuildSpec): void {
  // Collect unique icon names from sidebar items
  const iconNames = new Set<string>();
  for (const item of spec.sidebar) {
    iconNames.add(item.icon);
  }

  const iconImports = [...iconNames].join(",\n  ");

  const navItemEntries = spec.sidebar
    .map(
      (item) =>
        `  { title: "${item.title}", href: "${item.href}", icon: ${item.icon} },`
    )
    .join("\n");

  const code = `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/logo";
import { UserNav } from "@/components/patterns/user-nav";
import {
  ${iconImports},
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const navItems: NavItem[] = [
${navItemEntries}
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? "border-l-2 border-primary bg-sidebar-accent"
                          : ""
                      }
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge != null && item.badge > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 min-w-5 justify-center px-1.5 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}
`;

  writeFile(SIDEBAR_PATH, code);
  console.log(`  ✓ Sidebar: ${spec.sidebar.length} nav items`);
}
