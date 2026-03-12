import type { ModelSpec } from "./types";
import {
  resolvePath,
  writeFile,
  lowerFirst,
  camelToTitle,
  displayField,
  enumColorMap,
} from "./utils";

let _allModels: ModelSpec[] = [];

export function setAllModels(models: ModelSpec[]): void {
  _allModels = models;
}

export function generateDetailPage(model: ModelSpec): void {
  const slug = model.slug;
  const baseDir = resolvePath("src", "app", "(app)", slug, "[id]");

  writeFile(`${baseDir}/page.tsx`, generateDetailServer(model));
  writeFile(`${baseDir}/loading.tsx`, generateDetailLoading(model));

  console.log(`  ✓ Detail page: /${slug}/[id]`);
}

function generateDetailServer(model: ModelSpec): string {
  const lower = lowerFirst(model.name);
  const name = model.name;
  const slug = model.slug;
  const display = displayField(model.fields);
  const readOnly = model.readOnly === true;

  // Detail fields for sidebar (all fields except the display field)
  const detailFields = model.fields.filter(
    (f) => f.showInDetail !== false && f.name !== display
  );

  // Enum color maps
  const colorMapCode: string[] = [];
  for (const field of detailFields) {
    if (field.enum) {
      const colors = enumColorMap(field);
      if (colors) {
        const entries = Object.entries(colors)
          .map(([k, v]) => `  ${k}: "${v}",`)
          .join("\n");
        colorMapCode.push(
          `const ${field.name}Colors: Record<string, string> = {\n${entries}\n};`
        );
      }
    }
  }

  // Sidebar field rendering
  const sidebarFields = detailFields.map((field) => {
    const label = camelToTitle(field.name);
    if (field.enum) {
      const hasColors = enumColorMap(field) !== null;
      return `              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">${label}</span>
                <Badge
                  variant="secondary"
                  className={${hasColors ? `${lower}.${field.name} ? ${field.name}Colors[${lower}.${field.name}] ?? "" : ""` : '""'}}
                >
                  {${lower}.${field.name}}
                </Badge>
              </div>`;
    }
    if (field.type === "DateTime") {
      return `              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">${label}</span>
                <span>{${lower}.${field.name} ? new Date(${lower}.${field.name}).toLocaleDateString() : "—"}</span>
              </div>`;
    }
    if (field.type === "Boolean") {
      return `              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">${label}</span>
                <span>{${lower}.${field.name} ? "Yes" : "No"}</span>
              </div>`;
    }
    return `              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">${label}</span>
                <span className="truncate ml-4">{${lower}.${field.name} ?? "—"}</span>
              </div>`;
  });

  // HasMany child rendering
  const childSections: string[] = [];
  for (const childName of model.hasMany) {
    const childLower = lowerFirst(childName);
    const childModel = _allModels.find((m) => m.name === childName);
    const childDisplay = childModel ? displayField(childModel.fields) : "name";
    const childIcon = childModel?.icon ?? model.icon;
    childSections.push(`
          <Card>
            <CardHeader>
              <CardTitle>${childName}s</CardTitle>
            </CardHeader>
            <CardContent>
              {${lower}.${childLower}s.length === 0 ? (
                <EmptyState
                  icon={${childIcon}}
                  title="No ${childName.toLowerCase()}s yet"
                  description="This ${model.labelSingular.toLowerCase()} doesn't have any ${childName.toLowerCase()}s."
                  className="min-h-[200px]"
                />
              ) : (
                <div className="space-y-2">
                  {${lower}.${childLower}s.map((item: { id: string; ${childDisplay}: string }) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <p className="text-sm font-medium truncate">{item.${childDisplay}}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>`);
  }

  // Description field rendering (if exists)
  const descField = model.fields.find((f) => f.name === "description");
  const descriptionSection = descField
    ? `
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {${lower}.description || "No description provided."}
              </p>
            </CardContent>
          </Card>`
    : "";

  // If no content sections, add a general info card
  const hasContent = descriptionSection || childSections.length > 0;
  const fallbackContent = hasContent
    ? ""
    : `
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created {new Date(${lower}.createdAt).toLocaleDateString()}
                {${lower}.updatedAt !== ${lower}.createdAt && (
                  <> · Last updated {new Date(${lower}.updatedAt).toLocaleDateString()}</>
                )}
              </p>
            </CardContent>
          </Card>`;

  const needsBadge = detailFields.some((f) => f.enum);

  const deleteButtonImport = readOnly ? "" : '\nimport { DeleteButton } from "./_components/delete-button";';
  const iconImports = readOnly ? `${model.icon}` : `${model.icon}, Edit`;

  const actionsBlock = readOnly
    ? ""
    : `
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={\`/${slug}/\${id}/edit\`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <DeleteButton ${lower}Id={id} />
          </div>
        }`;

  return `import { notFound } from "next/navigation";
import Link from "next/link";
import { caller } from "@/trpc/server";
import { PageHeader } from "@/components/layout/page-header";
import { DetailLayout } from "@/components/patterns/detail-layout";
import { EmptyState } from "@/components/patterns/empty-state";
import { Button } from "@/components/ui/button";${needsBadge ? '\nimport { Badge } from "@/components/ui/badge";' : ""}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ${iconImports} } from "lucide-react";${deleteButtonImport}

export const dynamic = "force-dynamic";

${colorMapCode.join("\n\n")}

export default async function ${name}DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let ${lower};
  try {
    ${lower} = await caller.${lower}.byId({ id });
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={${lower}.${display}}
        ${descField ? `description={${lower}.description || undefined}` : ""}${actionsBlock}
      />

      <DetailLayout
        sidebar={
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
${sidebarFields.join("\n")}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(${lower}.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        }
      >${descriptionSection}${childSections.join("")}${hasContent ? "" : fallbackContent}
      </DetailLayout>
    </div>
  );
}
`;
}

function generateDetailLoading(model: ModelSpec): string {
  return `import { Skeleton } from "@/components/ui/skeleton";

export default function ${model.name}DetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1 space-y-6">
          <div className="rounded-lg border p-6">
            <Skeleton className="h-5 w-24 mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        </div>
        <div className="w-full lg:w-80">
          <div className="rounded-lg border p-6 space-y-3">
            <Skeleton className="h-4 w-16" />
            ${Array.from({ length: 4 })
              .map(() => '<Skeleton className="h-4 w-full" />')
              .join("\n            ")}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}

// Also generate the delete button client component
export function generateDeleteButton(model: ModelSpec): void {
  if (model.readOnly) return;

  const lower = lowerFirst(model.name);
  const slug = model.slug;
  const baseDir = resolvePath("src", "app", "(app)", slug, "[id]", "_components");

  const code = `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteButton({ ${lower}Id }: { ${lower}Id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const delete${model.name} = trpc.${lower}.delete.useMutation({
    onSuccess: () => {
      void utils.${lower}.list.invalidate();
      void utils.user.stats.invalidate();
      toast.success("${model.labelSingular} deleted.");
      router.push("/${slug}");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Trash2 className="mr-2 h-4 w-4" /> Delete
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete ${model.labelSingular.toLowerCase()}?"
        description="This will permanently delete this ${model.labelSingular.toLowerCase()}. This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={delete${model.name}.isPending}
        onConfirm={() => delete${model.name}.mutate({ id: ${lower}Id })}
      />
    </>
  );
}
`;

  writeFile(`${baseDir}/delete-button.tsx`, code);
}
