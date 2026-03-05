"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/patterns/empty-state";
import { DataTable } from "@/components/patterns/data-table";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  ArrowUpDown,
  MoreHorizontal,
  Briefcase,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

type ProjectItem = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { tasks: number };
};

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

export function ProjectList() {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = trpc.project.list.useQuery({});
  const utils = trpc.useUtils();

  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => {
      void utils.project.list.invalidate();
      void utils.user.stats.invalidate();
      toast.success("Project deleted.");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const columns: ColumnDef<ProjectItem>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link
          href={`/projects/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={statusColors[row.getValue("status") as string]}
        >
          {row.getValue("status") as string}
        </Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={priorityColors[row.getValue("priority") as string]}
        >
          {row.getValue("priority") as string}
        </Badge>
      ),
    },
    {
      id: "tasks",
      header: "Tasks",
      cell: ({ row }) => row.original._count.tasks,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/projects/${row.original.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/projects/${row.original.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) return null; // loading.tsx handles this

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Projects"
          description="Manage and track all your projects."
          actions={
            <Button onClick={() => router.push("/projects/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          }
        />

        {!data?.items.length ? (
          <EmptyState
            icon={Briefcase}
            title="No projects yet"
            description="Create your first project to get started."
            action={{ label: "New Project", href: "/projects/new" }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data.items as ProjectItem[]}
            searchKey="name"
            searchPlaceholder="Search projects..."
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete project?"
        description="This will permanently delete the project and all its tasks. This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteProject.isPending}
        onConfirm={() => deleteId && deleteProject.mutate({ id: deleteId })}
      />
    </>
  );
}
