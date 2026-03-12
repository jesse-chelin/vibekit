import type { BuildSpec } from "./types";
import { resolvePath, writeFile, lowerFirst, iconColor, relativeTimeHelper, displayField } from "./utils";

const DASHBOARD_DIR = resolvePath("src", "app", "(app)", "dashboard");

export function generateDashboard(spec: BuildSpec): void {
  writeFile(`${DASHBOARD_DIR}/page.tsx`, generateDashboardServer(spec));
  writeFile(`${DASHBOARD_DIR}/_components/dashboard-content.tsx`, generateDashboardClient(spec));
  writeFile(`${DASHBOARD_DIR}/loading.tsx`, generateDashboardLoading(spec));
  console.log("  ✓ Dashboard page");
}

function generateDashboardServer(spec: BuildSpec): string {
  const recentModel = spec.models.find(
    (m) => m.name === spec.dashboard.recentEntity
  );
  const recentLower = recentModel ? lowerFirst(recentModel.name) : lowerFirst(spec.models[0].name);

  return `import { trpc, HydrateClient } from "@/trpc/server";
import { DashboardContent } from "./_components/dashboard-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  void trpc.user.stats.prefetch();
  void trpc.${recentLower}.list.prefetch({ page: 1, pageSize: 5 });

  return (
    <HydrateClient>
      <DashboardContent />
    </HydrateClient>
  );
}
`;
}

function generateDashboardClient(spec: BuildSpec): string {
  const recentModel = spec.models.find(
    (m) => m.name === spec.dashboard.recentEntity
  );
  const recentLower = recentModel ? lowerFirst(recentModel.name) : lowerFirst(spec.models[0].name);
  const recentSlug = recentModel?.slug ?? spec.models[0].slug;
  const recentLabel = recentModel?.label ?? spec.models[0].label;
  const recentLabelSingular = recentModel?.labelSingular ?? spec.models[0].labelSingular;
  const recentIcon = recentModel?.icon ?? spec.models[0].icon;

  const hasCharts = spec.skills?.includes("charts") === true;
  const isExternal = spec.dataSource === "external";

  // Collect all icons needed
  const iconImports = new Set<string>();
  for (const model of spec.models) {
    iconImports.add(model.icon);
  }
  iconImports.add("RefreshCw");
  iconImports.add("Loader2");

  // Stat cards
  const statCards = spec.models.map((model, i) => {
    const lower = lowerFirst(model.name);
    const color = model.iconColor || iconColor(i);
    return `        <StaggerItem>
          <StatCard
            title="Total ${model.label}"
            value={stats?.${lower}Count.toLocaleString() ?? "0"}
            icon={${model.icon}}
            iconColor="${color}"
          />
        </StaggerItem>`;
  });

  // Status color map for recent items
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
  }

  // Determine display field for recent items
  const displayFieldName = recentModel
    ? displayField(recentModel.fields)
    : "name";

  // Grid columns based on stat count
  const gridCols =
    spec.models.length <= 2
      ? "sm:grid-cols-2"
      : spec.models.length === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  const needsBadge = statusField != null;
  const recentVarName = `recent${recentModel?.name ?? spec.models[0].name}s`;

  // Build imports
  const chartImports = hasCharts
    ? `\nimport { ChartCard } from "@/components/patterns/chart-card";\nimport { LineChart, DonutChart } from "@/components/patterns/charts";`
    : "";
  const badgeImport = needsBadge ? '\nimport { Badge } from "@/components/ui/badge";' : "";

  // Recent item type fields
  const recentTypeFields = [`id: string`, `${displayFieldName}: string`, `createdAt: string`];
  if (statusField) recentTypeFields.push("status: string | null");

  // Charts section (only when charts skill installed)
  const chartsSection = hasCharts ? `
      {/* Charts — customize data keys in the customization pass */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SlideUp className="lg:col-span-2">
          <ChartCard
            title="Activity"
            description="Trend over time"
          >
            {stats?.dailyActivity && stats.dailyActivity.length > 0 ? (
              <LineChart data={stats.dailyActivity} dataKey="count" xAxisKey="date" height={280} />
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                No activity data yet
              </div>
            )}
          </ChartCard>
        </SlideUp>
        <SlideUp>
          <ChartCard
            title="Breakdown"
            description="Distribution by category"
          >
            {stats?.breakdown && stats.breakdown.length > 0 ? (
              <DonutChart data={stats.breakdown} height={280} />
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                No breakdown data yet
              </div>
            )}
          </ChartCard>
        </SlideUp>
      </div>
` : "";

  // Auto-refresh for external/monitoring apps
  const autoRefreshBlock = isExternal ? `
  useEffect(() => {
    const interval = setInterval(() => {
      void utils.user.stats.invalidate();
      void utils.${recentLower}.list.invalidate();
      setLastUpdated(new Date().toISOString());
    }, 60_000);
    return () => clearInterval(interval);
  }, [utils]);
` : "";

  // Health indicator for external apps
  const healthIndicator = isExternal ? `
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Connected</span>
              </span>` : "";

  return `"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/patterns/stat-card";
import { EmptyState } from "@/components/patterns/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";${badgeImport}${chartImports}
import { Button } from "@/components/ui/button";
import { StaggerList, StaggerItem, SlideUp } from "@/components/shared/motion";
import { ${[...iconImports].join(", ")} } from "lucide-react";
import { useState${isExternal ? ", useEffect" : ""}, useCallback } from "react";

${relativeTimeHelper()}
${statusColorMap}
export function DashboardContent() {
  const utils = trpc.useUtils();
  const { data: stats } = trpc.user.stats.useQuery();
  const { data: ${recentVarName} } = trpc.${recentLower}.list.useQuery({ page: 1, pageSize: 5 });
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await utils.user.stats.invalidate();
    await utils.${recentLower}.list.invalidate();
    setLastUpdated(new Date().toISOString());
    setIsRefreshing(false);
  }, [utils]);
${autoRefreshBlock}
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="${spec.dashboard.description}"
        actions={
          <div className="flex items-center gap-3">${healthIndicator}
            <span className="text-xs text-muted-foreground">
              Updated {formatRelativeTime(lastUpdated)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        }
      />

      <StaggerList className="grid gap-4 ${gridCols}">
${statCards.join("\n")}
      </StaggerList>
${chartsSection}
      <SlideUp>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent ${recentLabel}</CardTitle>
            {${recentVarName} && ${recentVarName}.items.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/${recentSlug}">View All</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!${recentVarName}?.items.length ? (
              <EmptyState
                icon={${recentIcon}}
                title="No ${recentLabel.toLowerCase()} yet"
                description="${(recentModel?.readOnly ?? false) ? `${recentLabel} will appear here once data is available.` : `Create your first ${recentLabelSingular.toLowerCase()} to get started.`}"${(recentModel?.readOnly ?? false) ? "" : `
                action={{ label: "New ${recentLabelSingular}", href: "/${recentSlug}/new" }}`}
                className="min-h-[200px]"
              />
            ) : (
              <div className="space-y-2">
                {${recentVarName}.items.map((item: { ${recentTypeFields.join("; ")} }) => (
                  <Link
                    key={item.id}
                    href={\`/${recentSlug}/\${item.id}\`}
                    className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {item.${displayFieldName}}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(item.createdAt)}
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
  const hasCharts = spec.skills?.includes("charts") === true;

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

  const chartSkeletons = hasCharts ? `
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-[360px] rounded-lg" />
        <Skeleton className="h-[360px] rounded-lg" />
      </div>
` : "";

  return `import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 ${gridCols}">
${statSkeletons}
      </div>
${chartSkeletons}
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
