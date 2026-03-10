import type { BuildSpec } from "./types";
import { resolvePath, writeFile } from "./utils";

/**
 * Generates app-specific "chrome" files that replace template defaults:
 * - logo.tsx — branded with spec.appName
 * - search-command.tsx — routes from spec.sidebar + actions for mutable models
 * - src/app/page.tsx — redirect to /dashboard
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
  console.log("  ✓ App chrome (logo, search command, root redirect)");
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
