"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/patterns/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  status: string;
  priority: string;
  taskCount: number;
  updatedAt: string;
};

const projects: Project[] = [
  { id: "1", name: "Website Redesign", status: "active", priority: "high", taskCount: 4, updatedAt: "2024-01-15" },
  { id: "2", name: "Mobile App", status: "active", priority: "high", taskCount: 3, updatedAt: "2024-01-14" },
  { id: "3", name: "API Integration", status: "active", priority: "medium", taskCount: 3, updatedAt: "2024-01-13" },
  { id: "4", name: "Documentation", status: "completed", priority: "low", taskCount: 2, updatedAt: "2024-01-12" },
  { id: "5", name: "Analytics Dashboard", status: "active", priority: "medium", taskCount: 3, updatedAt: "2024-01-11" },
];

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

const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link href={`/projects/${row.original.id}`} className="font-medium hover:underline">
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary" className={statusColors[row.getValue("status") as string]}>
        {(row.getValue("status") as string)}
      </Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <Badge variant="secondary" className={priorityColors[row.getValue("priority") as string]}>
        {(row.getValue("priority") as string)}
      </Badge>
    ),
  },
  {
    accessorKey: "taskCount",
    header: "Tasks",
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
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function ProjectsPage() {
  const router = useRouter();

  return (
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
      <DataTable columns={columns} data={projects} searchKey="name" searchPlaceholder="Search projects..." />
    </div>
  );
}
