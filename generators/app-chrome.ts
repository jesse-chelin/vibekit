import type { BuildSpec } from "./types";
import { resolvePath, writeFile } from "./utils";

/**
 * Generates app-specific "chrome" files that replace template defaults:
 * - logo.tsx — branded with spec.appName
 * - search-command.tsx — routes from spec.sidebar + actions for mutable models
 * - src/app/page.tsx — redirect to /dashboard
 * - src/lib/constants.ts — app name and description
 * - settings/layout.tsx — only relevant tabs
 * - settings/general/page.tsx — no stub preferences
 * - middleware.ts + auth.ts — auth bypass for local apps
 */

export function generateAppChrome(spec: BuildSpec): void {
  writeFile(
    resolvePath("src", "components", "shared", "logo.tsx"),
    generateLogo(spec)
  );
  writeFile(
    resolvePath("src", "components", "patterns", "search-command.tsx"),
    generateSearchCommand(spec)
  );
  writeFile(resolvePath("src", "app", "page.tsx"), generateRootRedirect());
  writeFile(resolvePath("src", "lib", "constants.ts"), generateConstants(spec));
  writeFile(
    resolvePath("src", "app", "(app)", "settings", "layout.tsx"),
    generateSettingsLayout(spec)
  );
  writeFile(
    resolvePath("src", "app", "(app)", "settings", "general", "page.tsx"),
    generateSettingsGeneral()
  );

  if (spec.needsAuth === false) {
    generateAuthBypass(spec);
  }

  console.log("  ✓ App chrome (logo, search, redirect, constants, settings)");
}

function generateLogo(spec: BuildSpec): string {
  // Use the first sidebar item's icon, or fallback to Zap
  const iconName = spec.sidebar[0]?.icon ?? "Zap";

  return `import { ${iconName} } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <${iconName} className="h-4 w-4 text-primary-foreground" />
      </div>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">${spec.appName}</span>
      )}
    </div>
  );
}
`;
}

function generateSearchCommand(spec: BuildSpec): string {
  // Collect all unique icons
  const icons = new Set<string>();
  icons.add("Plus");
  for (const item of spec.sidebar) {
    icons.add(item.icon);
  }

  // Page commands from sidebar
  const pageCommands = spec.sidebar.map(
    (item) =>
      `  { label: "${item.title}", href: "${item.href}", icon: ${item.icon}, group: "Pages" },`
  );

  // Action commands for mutable models
  const actionCommands = spec.models
    .filter((m) => !m.readOnly)
    .map(
      (m) =>
        `  { label: "New ${m.labelSingular}", href: "/${m.slug}/new", icon: Plus, group: "Actions" },`
    );

  const allCommands = [...pageCommands, ...actionCommands];

  return `"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ${[...icons].join(",\n  ")},
} from "lucide-react";

const commands = [
${allCommands.join("\n")}
];

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const groups = commands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.group]) acc[cmd.group] = [];
      acc[cmd.group].push(cmd);
      return acc;
    },
    {} as Record<string, typeof commands>
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groups).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((cmd) => (
              <CommandItem
                key={cmd.href}
                onSelect={() => {
                  router.push(cmd.href);
                  setOpen(false);
                }}
              >
                <cmd.icon className="mr-2 h-4 w-4" />
                {cmd.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
`;
}

function generateRootRedirect(): string {
  return `import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
`;
}

function generateConstants(spec: BuildSpec): string {
  return `export const APP_NAME = "${spec.appName}";
export const APP_DESCRIPTION = "${spec.dashboard.description.replace(/"/g, '\\"')}";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const AUTH_ROUTES = ["/sign-in", "/sign-up", "/forgot-password"];
export const PUBLIC_ROUTES = ["/", "/api/health", "/api/auth"${spec.needsAuth === false ? ', "/dashboard"' : ""}];
export const DEFAULT_REDIRECT = "/dashboard";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000,
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 10,
} as const;
`;
}

function generateSettingsLayout(spec: BuildSpec): string {
  const tabs: { label: string; href: string }[] = [
    { label: "General", href: "/settings/general" },
  ];

  const skills = spec.skills ?? [];
  if (skills.includes("stripe")) {
    tabs.push({ label: "Billing", href: "/settings/billing" });
  }
  if (skills.includes("rbac")) {
    tabs.push({ label: "Team", href: "/settings/team" });
  }

  const tabsJson = JSON.stringify(tabs, null, 2).replace(/\n/g, "\n  ");

  return `import { PageHeader } from "@/components/layout/page-header";
import { SettingsLayout } from "@/components/patterns/settings-layout";

const settingsTabs = ${tabsJson};

export default function SettingsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences." />
      <SettingsLayout tabs={settingsTabs}>{children}</SettingsLayout>
    </div>
  );
}
`;
}

function generateSettingsGeneral(): string {
  return `"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { trpc } from "@/trpc/client";
import { FormSection } from "@/components/patterns/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function GeneralSettingsPage() {
  const { data: user, isLoading, error } = trpc.user.me.useQuery();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.name ?? "" } : undefined,
  });

  const utils = trpc.useUtils();

  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      void utils.user.me.invalidate();
      toast.success("Profile updated!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="mt-1 h-4 w-48" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="max-w-2xl space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Something went wrong loading your settings.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form onSubmit={form.handleSubmit((data) => updateUser.mutate(data))}>
        <FormSection
          title="Profile"
          description="Update your personal information."
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ""}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>
          <Button type="submit" disabled={updateUser.isPending}>
            {updateUser.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {updateUser.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </FormSection>
      </form>
    </div>
  );
}
`;
}

function generateAuthBypass(spec: BuildSpec): void {
  // Rewrite middleware to always pass through
  writeFile(
    resolvePath("src", "middleware.ts"),
    `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth bypassed — this is a personal/local app (needsAuth: false)
export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|og-image.png).*)",
  ],
};
`
  );

  // Rewrite auth.ts without PrismaAdapter (conflicts with Credentials+JWT when auth is bypassed)
  writeFile(
    resolvePath("src", "lib", "auth.ts"),
    `import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";

// Auth is present but not enforced (needsAuth: false — personal/local app).
// Middleware does not redirect to sign-in. This config exists so tRPC
// session helpers don't crash if auth utilities are imported elsewhere.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
`
  );

  console.log("  ✓ Auth bypass (middleware + auth.ts rewritten for no-auth)");
}
