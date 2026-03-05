import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/patterns/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/components/patterns/activity-feed";
import { FolderOpen, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export const metadata = { title: "Dashboard" };

const stats = [
  { title: "Total Projects", value: "5", icon: FolderOpen, trend: { value: 12, label: "from last month" } },
  { title: "Completed Tasks", value: "7", icon: CheckCircle2, trend: { value: 8, label: "from last week" } },
  { title: "In Progress", value: "4", icon: Clock, description: "across 3 projects" },
  { title: "Completion Rate", value: "47%", icon: TrendingUp, trend: { value: 5, label: "improvement" } },
];

const recentActivity = [
  { id: "1", user: { name: "Demo User" }, action: "completed task", target: "Design system audit", timestamp: new Date(Date.now() - 3600000) },
  { id: "2", user: { name: "Demo User" }, action: "created project", target: "Analytics Dashboard", timestamp: new Date(Date.now() - 7200000) },
  { id: "3", user: { name: "Demo User" }, action: "updated task", target: "Homepage wireframes", timestamp: new Date(Date.now() - 86400000) },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your projects."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={recentActivity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active projects</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasks due this week</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overdue tasks</span>
                <span className="font-medium text-destructive">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
