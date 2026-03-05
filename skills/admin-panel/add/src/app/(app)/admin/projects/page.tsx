"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  completed: "secondary",
  archived: "destructive",
};

const priorityColors: Record<string, "default" | "secondary" | "destructive"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

type EditProject = { id: string; name: string; status: string; priority: string } | null;

export default function AdminProjectsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editProject, setEditProject] = useState<EditProject>(null);

  const { data, isLoading } = trpc.admin.listProjects.useQuery({ search: search || undefined, page });
  const utils = trpc.useUtils();

  const updateProject = trpc.admin.updateProject.useMutation({
    onSuccess: () => {
      utils.admin.listProjects.invalidate();
      setEditProject(null);
      toast.success("Project updated.");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteProject = trpc.admin.deleteProject.useMutation({
    onSuccess: () => {
      utils.admin.listProjects.invalidate();
      utils.admin.stats.invalidate();
      toast.success("Project deleted.");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      No projects found.
                    </TableCell>
                  </TableRow>
                )}
                {data?.items.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="text-muted-foreground">{project.user.name ?? project.user.email}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[project.status] ?? "secondary"}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityColors[project.priority] ?? "secondary"}>
                        {project.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{project._count.tasks}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(project.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => setEditProject({
                            id: project.id, name: project.name,
                            status: project.status, priority: project.priority,
                          })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => {
                            if (confirm("Delete this project and all its tasks? This can't be undone.")) {
                              deleteProject.mutate({ id: project.id });
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{data.total} project{data.total !== 1 ? "s" : ""}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>{page} / {data.totalPages}</Button>
            <Button variant="outline" size="icon" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!editProject} onOpenChange={(open) => { if (!open) setEditProject(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
          {editProject && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProject.mutate({
                  id: editProject.id, name: editProject.name,
                  status: editProject.status as "active" | "completed" | "archived",
                  priority: editProject.priority as "low" | "medium" | "high",
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={editProject.name} onChange={(e) => setEditProject({ ...editProject, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={editProject.status} onValueChange={(v) => setEditProject({ ...editProject, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={editProject.priority} onValueChange={(v) => setEditProject({ ...editProject, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={updateProject.isPending}>
                {updateProject.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
