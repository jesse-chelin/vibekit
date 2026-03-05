"use client";

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
  LayoutDashboard,
  FolderOpen,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", href: "/projects", icon: FolderOpen },
  { title: "Settings", href: "/settings", icon: Settings },
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
