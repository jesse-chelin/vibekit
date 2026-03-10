import type { ModelSpec } from "./types";
import {
  resolvePath,
  writeFile,
  lowerFirst,
  camelToTitle,
  displayField,
  enumColorMap,
} from "./utils";

export function generateListPage(model: ModelSpec): void {
  const slug = model.slug;
  const lower = lowerFirst(model.name);
  const baseDir = resolvePath("src", "app", "(app)", slug);

  // 1. Server page.tsx
  writeFile(
    `${baseDir}/page.tsx`,
    generateServerPage(model)
  );

  // 2. Client list component
  writeFile(
    `${baseDir}/_components/${slug}-list.tsx`,
    generateClientList(model)
  );

  // 3. Loading skeleton
  writeFile(
    `${baseDir}/loading.tsx`,
    generateListLoading(model)
  );

  console.log(`  ✓ List page: /${slug}`);
}

function generateServerPage(model: ModelSpec): string {
  const lower = lowerFirst(model.name);
  const slug = model.slug;
  const componentName = model.name + "List";
  const fileName = slug + "-list";

  return `import { trpc, HydrateClient } from "@/trpc/server";
import { ${componentName} } from "./_components/${fileName}";

export const dynamic = "force-dynamic";
export const metadata = { title: "${model.label}" };

export default async function ${model.label.replace(/\s/g, "")}Page() {
  void trpc.${lower}.list.prefetch({});
  return (
    <HydrateClient>
      <${componentName} />
    </HydrateClient>
  );
}
`;
}

function generateClientList(model: ModelSpec): string {
  const lower = lowerFirst(model.name);
  const name = model.name;
  const slug = model.slug;
  const display = displayField(model.fields);
  const listFields = model.fields.filter((f) => f.showInList);
  const readOnly = model.readOnly === true;

  // Collect enum fields that need color maps
  const enumListFields = listFields.filter((f) => f.enum);
  const colorMaps: string[] = [];
  for (const field of enumListFields) {
    const colors = enumColorMap(field);
    if (colors) {
      const entries = Object.entries(colors)
        .map(([k, v]) => `  ${k}: "${v}",`)
        .join("\n");
      colorMaps.push(
        `const ${field.name}Colors: Record<string, string> = {\n${entries}\n};`
      );
    }
  }

  // Build column definitions
  const columnDefs: string[] = [];

  // Display field column (clickable link, sortable)
  const displayLabel = listFields.find((f) => f.name === display)?.listLabel || camelToTitle(display);
  columnDefs.push(`    {
      accessorKey: "${display}",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ${displayLabel} <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link
          href={\`/${slug}/\${row.original.id}\`}
          className="font-medium hover:underline"
        >
          {row.getValue("${display}")}
        </Link>
      ),
    },`);

  // Other list fields
  for (const field of listFields) {
    if (field.name === display) continue;

    const label = field.listLabel || camelToTitle(field.name);

    if (field.enum) {
      const hasColors = enumColorMap(field) !== null;
      columnDefs.push(`    {
      accessorKey: "${field.name}",
      header: "${label}",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={${hasColors ? `${field.name}Colors[row.getValue("${field.name}") as string]` : '""'}}
        >
          {row.getValue("${field.name}") as string}
        </Badge>
      ),
    },`);
    } else {
      columnDefs.push(`    {
      accessorKey: "${field.name}",
      header: "${label}",
    },`);
    }
  }

  // HasMany count columns
  for (const child of model.hasMany) {
    const childLower = lowerFirst(child);
    columnDefs.push(`    {
      id: "${childLower}s",
      header: "${child}s",
      cell: ({ row }) => row.original._count.${childLower}s,
    },`);
  }

  // Actions column
  if (readOnly) {
    columnDefs.push(`    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={\`/${slug}/\${row.original.id}\`}>View</Link>
        </Button>
      ),
    },`);
  } else {
    columnDefs.push(`    {
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
              <Link href={\`/${slug}/\${row.original.id}\`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={\`/${slug}/\${row.original.id}/edit\`}>Edit</Link>
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
    },`);
  }

  // Build item type
  const typeFields = [
    "  id: string;",
    ...model.fields.map((f) => {
      const tsType = f.type === "String" ? "string" : f.type === "Int" || f.type === "Float" ? "number" : f.type === "Boolean" ? "boolean" : "Date";
      const nullable = !f.required ? " | null" : "";
      return `  ${f.name}: ${tsType}${nullable};`;
    }),
    "  createdAt: Date;",
    "  updatedAt: Date;",
  ];
  if (model.hasMany.length > 0) {
    const countFields = model.hasMany.map((c) => `${lowerFirst(c)}s: number`).join("; ");
    typeFields.push(`  _count: { ${countFields} };`);
  }

  // Badge import needed?
  const needsBadge = enumListFields.length > 0;

  // Conditional imports and component body based on readOnly
  const stateImport = readOnly ? "" : '\nimport { useState } from "react";';
  const routerImport = readOnly ? "" : '\nimport { useRouter } from "next/navigation";';
  const confirmImport = readOnly ? "" : '\nimport { ConfirmDialog } from "@/components/patterns/confirm-dialog";';
  const dropdownImport = readOnly
    ? ""
    : `\nimport {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";`;
  const iconList = readOnly
    ? `ArrowUpDown,\n  ${model.icon},`
    : `Plus,\n  ArrowUpDown,\n  MoreHorizontal,\n  ${model.icon},\n  Trash2,`;
  const toastImport = readOnly ? "" : '\nimport { toast } from "sonner";';

  // State + mutation block
  const stateBlock = readOnly
    ? ""
    : `\n  const router = useRouter();\n  const [deleteId, setDeleteId] = useState<string | null>(null);`;
  const mutationBlock = readOnly
    ? ""
    : `\n  const utils = trpc.useUtils();

  const delete${name} = trpc.${lower}.delete.useMutation({
    onSuccess: () => {
      void utils.${lower}.list.invalidate();
      void utils.user.stats.invalidate();
      toast.success("${model.labelSingular} deleted.");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });\n`;

  // PageHeader actions
  const headerActions = readOnly
    ? ""
    : `
          actions={
            <Button onClick={() => router.push("/${slug}/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New ${model.labelSingular}
            </Button>
          }`;

  // EmptyState content
  const emptyDescription = readOnly
    ? `"No ${model.label.toLowerCase()} found."`
    : `"Create your first ${model.labelSingular.toLowerCase()} to get started."`;
  const emptyAction = readOnly
    ? ""
    : `\n            action={{ label: "New ${model.labelSingular}", href: "/${slug}/new" }}`;

  // ConfirmDialog block
  const confirmBlock = readOnly
    ? ""
    : `

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete ${model.labelSingular.toLowerCase()}?"
        description="This will permanently delete this ${model.labelSingular.toLowerCase()}. This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={delete${name}.isPending}
        onConfirm={() => deleteId && delete${name}.mutate({ id: deleteId })}
      />`;

  // Wrapper tag: readOnly doesn't need Fragment
  const wrapOpen = readOnly ? "" : "\n    <>";
  const wrapClose = readOnly ? "" : "\n    </>";

  return `"use client";
${stateImport}${routerImport}
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/patterns/empty-state";
import { DataTable } from "@/components/patterns/data-table";${confirmImport}
import { Button } from "@/components/ui/button";${needsBadge ? '\nimport { Badge } from "@/components/ui/badge";' : ""}
import { type ColumnDef } from "@tanstack/react-table";${dropdownImport}
import {
  ${iconList}
} from "lucide-react";${toastImport}

type ${name}Item = {
${typeFields.join("\n")}
};

${colorMaps.join("\n\n")}

export function ${name}List() {${stateBlock}

  const { data, isLoading } = trpc.${lower}.list.useQuery({});
${mutationBlock}
  const columns: ColumnDef<${name}Item>[] = [
${columnDefs.join("\n")}
  ];

  if (isLoading) return null;

  return (${wrapOpen}
      <div className="space-y-6">
        <PageHeader
          title="${model.label}"
          description="${readOnly ? "Browse" : "Manage and track"} all your ${model.label.toLowerCase()}."${headerActions}
        />

        {!data?.items.length ? (
          <EmptyState
            icon={${model.icon}}
            title="No ${model.label.toLowerCase()} yet"
            description=${emptyDescription}${emptyAction}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data.items as ${name}Item[]}
            searchKey="${display}"
            searchPlaceholder="Search ${model.label.toLowerCase()}..."
          />
        )}
      </div>${confirmBlock}${wrapOpen ? "\n    </>" : ""}
  );
}
`;
}

function generateListLoading(model: ModelSpec): string {
  const listFields = model.fields.filter((f) => f.showInList);
  const columnCount = listFields.length + 1 + model.hasMany.length; // +1 for actions

  const headerSkeletons = Array.from({ length: columnCount })
    .map((_, i) => `              <Skeleton className="h-4 w-${i === 0 ? 16 : 14}" />`)
    .join("\n");

  return `import { Skeleton } from "@/components/ui/skeleton";

export default function ${model.label.replace(/\s/g, "")}Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-1 h-4 w-56" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="rounded-md border">
          <div className="border-b px-4 py-3">
            <div className="flex gap-8">
${headerSkeletons}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-3">
              <Skeleton className="h-4 w-40" />
${listFields.filter((f) => f.name !== displayField(model.fields)).map(() => '              <Skeleton className="h-5 w-16 rounded-full" />').join("\n")}
              <Skeleton className="ml-auto h-8 w-8" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  );
}
`;
}
