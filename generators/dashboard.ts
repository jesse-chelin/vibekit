import type { BuildSpec, ModelSpec } from "./types";
import { resolvePath, writeFile, lowerFirst, iconColor } from "./utils";

const DASHBOARD_DIR = resolvePath("src", "app", "(app)", "dashboard");

export function generateDashboard(spec: BuildSpec): void {
  writeFile(`${DASHBOARD_DIR}/page.tsx`, generateDashboardPage(spec));
  writeFile(`${DASHBOARD_DIR}/loading.tsx`, generateDashboardLoading(spec));
  console.log("  ✓ Dashboard page");
}

function generateDashboardPage(spec: BuildSpec): string {
  const recentModel = spec.models.find(
    (m) => m.name === spec.dashboard.recentEntity
  );
  const recentLower = recentModel ? lowerFirst(recentModel.name) : lowerFirst(spec.models[0].name);
  const recentSlug = recentModel?.slug ?? spec.models[0].slug;
  const recentLabel = recentModel?.label ?? spec.models[0].label;
  const recentLabelSingular = recentModel?.labelSingular ?? spec.models[0].labelSingular;
  const recentIcon = recentModel?.icon ?? spec.models[0].icon;

  // Collect all icons needed
  const iconImports = new Set<string>();
  for (const model of spec.models) {
    iconImports.add(model.icon);
  }
  iconImports.add("TrendingUp");

  // Stat cards
  const statCards = spec.models.map((model, i) => {
    const lower = lowerFirst(model.name);
    const color = model.iconColor || iconColor(i);
    return `        <StaggerItem>
          <StatCard
            title="Total ${model.label}"
            value={stats.${lower}Count.toLocaleString()}
            icon={${model.icon}}
            iconColor="${color}"
          />
        </StaggerItem>`;
  });

  // Status color map for recent items (use first enum field if available)
  const statusField = recentModel?.fields.find(
    (f) => f.enum && f.name === "status"
  );
  let statusColorMap = "";
  let statusBadge = "";
  if (statusField && statusField.enum) {
    const positive = ["active", "completed", "done", "approved", "paid", "open"];
    const entries = statusField.enum
      .map((v) => {
        const color = positive.includes(v)
          ? "bg-success/10 text-success"
          : "bg-muted text-muted-foreground";
        return `  ${v}: "${color}",`;
      })
      .join("\n");
    statusColorMap = `\nconst statusColors: Record<string, string> = {\n${entries}\n};\n`;
    statusBadge = `
                    {item.status && (
                      <Badge
                        variant="secondary"
                        className={statusColors[item.status] ?? ""}
                      >
                        {item.status}
                      </Badge>
                    )}`;
    iconImports.delete("TrendingUp"); // not needed if we have status
  }

  // Determine display field for recent items
  const displayFieldName = recentModel?.fields.find(
    (f) => f.name === "name" || f.name === "title"
  )?.name ?? "name";

  // Grid columns based on stat count
  const gridCols =
    spec.models.length <= 2
      ? "sm:grid-cols-2"
      : spec.models.length === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  const needsBadge = statusField != null;

  return `import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/patterns/stat-card";
import { EmptyState } from "@/components/patterns/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";${needsBadge ? '\nimport { Badge } from "@/components/ui/badge";' : ""}
import { Button } from "@/components/ui/button";
import { StaggerList, StaggerItem, SlideUp } from "@/components/shared/motion";
import { ${[...iconImports].join(", ")} } from "lucide-react";
import { caller } from "@/trpc/server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };
${statusColorMap}
export default async function DashboardPage() {
  const [stats, recent${recentModel?.name ?? spec.models[0].name}s] = await Promise.all([
    caller.user.stats(),
    caller.${recentLower}.list({ page: 1, pageSize: 5 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="${spec.dashboard.description}"
      />

      <StaggerList className="grid gap-4 ${gridCols}">
${statCards.join("\n")}
      </StaggerList>

      <SlideUp>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent ${recentLabel}</CardTitle>
            {recent${recentModel?.name ?? spec.models[0].name}s.items.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/${recentSlug}">View All</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {recent${recentModel?.name ?? spec.models[0].name}s.items.length === 0 ? (
              <EmptyState
                icon={${recentIcon}}
                title="No ${recentLabel.toLowerCase()} yet"
                description="Create your first ${recentLabelSingular.toLowerCase()} to get started."
                action={{ label: "New ${recentLabelSingular}", href: "/${recentSlug}/new" }}
                className="min-h-[200px]"
              />
            ) : (
              <div className="space-y-2">
                {recent${recentModel?.name ?? spec.models[0].name}s.items.map((item: { id: string; ${displayFieldName}: string${statusField ? "; status: string | null" : ""} }) => (
                  <Link
                    key={item.id}
                    href={\`/${recentSlug}/\${item.id}\`}
                    className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {item.${displayFieldName}}
                      </p>
                    </div>${statusBadge}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </SlideUp>
    </div>
  );
}
`;
}

function generateDashboardLoading(spec: BuildSpec): string {
  const statCount = spec.models.length;
  const statSkeletons = Array.from({ length: statCount })
    .map(
      () => `          <Skeleton className="h-[104px] rounded-lg" />`
    )
    .join("\n");

  const gridCols =
    statCount <= 2
      ? "sm:grid-cols-2"
      : statCount === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return `import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>

      <div className="grid gap-4 ${gridCols}">
${statSkeletons}
      </div>

      <div className="rounded-lg border">
        <div className="border-b p-6">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="p-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}
