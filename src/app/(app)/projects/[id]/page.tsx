import { notFound } from "next/navigation";
import { caller } from "@/trpc/server";
import { PageHeader } from "@/components/layout/page-header";
import { DetailLayout } from "@/components/patterns/detail-layout";
import { EmptyState } from "@/components/patterns/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, ListTodo } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { DeleteProjectButton } from "./_components/delete-project-button";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
};

const taskStatusColors: Record<string, string> = {
  completed: "bg-success",
  in_progress: "bg-primary",
  todo: "bg-muted-foreground",
};

const taskStatusLabels: Record<string, string> = {
  completed: "completed",
  in_progress: "in progress",
  todo: "todo",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let project;
  try {
    project = await caller.project.byId({ id });
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={project.description || undefined}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/projects/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <DeleteProjectButton projectId={id} />
          </div>
        }
      />

      <DetailLayout
        sidebar={
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="secondary"
                  className={statusColors[project.status] || ""}
                >
                  {project.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <Badge
                  variant="secondary"
                  className={priorityColors[project.priority] || ""}
                >
                  {project.priority}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tasks</span>
                <span>{project._count.tasks}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatRelativeTime(project.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {project.tasks.length === 0 ? (
              <EmptyState
                icon={ListTodo}
                title="No tasks yet"
                description="This project doesn't have any tasks."
                className="min-h-[200px]"
              />
            ) : (
              <div className="space-y-2">
                {project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    <div
                      className={`h-2 w-2 shrink-0 rounded-full ${taskStatusColors[task.status] || "bg-muted-foreground"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm truncate">{task.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {taskStatusLabels[task.status] || task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DetailLayout>
    </div>
  );
}
