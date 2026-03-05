import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/patterns/stat-card";
import { EmptyState } from "@/components/patterns/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaggerList, StaggerItem, SlideUp } from "@/components/shared/motion";
import { FolderOpen, CheckCircle2, ListTodo, TrendingUp } from "lucide-react";
import { caller } from "@/trpc/server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
};

export default async function DashboardPage() {
  const [stats, recentProjects] = await Promise.all([
    caller.user.stats(),
    caller.project.list({ page: 1, pageSize: 5 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your projects."
      />

      <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            title="Total Projects"
            value={stats.projectCount.toLocaleString()}
            icon={FolderOpen}
            iconColor="text-blue-500"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Total Tasks"
            value={stats.taskCount.toLocaleString()}
            icon={ListTodo}
            iconColor="text-emerald-500"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Completed"
            value={stats.completedTaskCount.toLocaleString()}
            icon={CheckCircle2}
            iconColor="text-amber-500"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={TrendingUp}
            iconColor="text-violet-500"
          />
        </StaggerItem>
      </StaggerList>

      <SlideUp>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Projects</CardTitle>
            {recentProjects.items.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/projects">View All</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {recentProjects.items.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="No projects yet"
                description="Create your first project to get started."
                action={{ label: "New Project", href: "/projects/new" }}
                className="min-h-[200px]"
              />
            ) : (
              <div className="space-y-2">
                {recentProjects.items.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {project._count.tasks}{" "}
                        {project._count.tasks === 1 ? "task" : "tasks"}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={statusColors[project.status] || ""}
                    >
                      {project.status}
                    </Badge>
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
