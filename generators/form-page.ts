import type { ModelSpec, FieldSpec } from "./types";
import {
  resolvePath,
  writeFile,
  lowerFirst,
  camelToTitle,
  zodType,
} from "./utils";

export function generateFormPages(model: ModelSpec): void {
  const slug = model.slug;

  // Create page
  const createDir = resolvePath("src", "app", "(app)", slug, "new");
  writeFile(`${createDir}/page.tsx`, generateCreatePage(model));
  writeFile(`${createDir}/loading.tsx`, generateFormLoading(model, "Create"));

  // Edit page
  const editDir = resolvePath("src", "app", "(app)", slug, "[id]", "edit");
  writeFile(`${editDir}/page.tsx`, generateEditPage(model));
  writeFile(`${editDir}/loading.tsx`, generateFormLoading(model, "Edit"));

  console.log(`  ✓ Form pages: /${slug}/new, /${slug}/[id]/edit`);
}

function formFieldComponent(field: FieldSpec): string {
  const label = camelToTitle(field.name);
  const id = field.name;

  if (field.enum) {
    const options = field.enum
      .map(
        (val) =>
          `                <SelectItem value="${val}">${camelToTitle(val)}</SelectItem>`
      )
      .join("\n");

    return `            <div className="space-y-2">
              <Label htmlFor="${id}">${label}</Label>
              <Select
                value={form.watch("${id}")}
                onValueChange={(value) => form.setValue("${id}", value as ${field.enum.map((v) => `"${v}"`).join(" | ")})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ${label.toLowerCase()}" />
                </SelectTrigger>
                <SelectContent>
${options}
                </SelectContent>
              </Select>
            </div>`;
  }

  if (field.type === "Boolean") {
    return `            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="${id}">${label}</Label>
              </div>
              <Switch
                id="${id}"
                checked={form.watch("${id}")}
                onCheckedChange={(checked) => form.setValue("${id}", checked)}
              />
            </div>`;
  }

  if (field.type === "DateTime") {
    return `            <div className="space-y-2">
              <Label htmlFor="${id}">${label}</Label>
              <Input
                id="${id}"
                type="date"
                {...form.register("${id}")}
              />
              {form.formState.errors.${id} && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.${id}.message}
                </p>
              )}
            </div>`;
  }

  if (field.type === "Int" || field.type === "Float") {
    return `            <div className="space-y-2">
              <Label htmlFor="${id}">${label}</Label>
              <Input
                id="${id}"
                type="number"
                ${field.type === "Float" ? 'step="0.01"' : ""}
                {...form.register("${id}", { valueAsNumber: true })}
              />
              {form.formState.errors.${id} && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.${id}.message}
                </p>
              )}
            </div>`;
  }

  // String field — use Textarea for long text
  const isTextarea = field.maxLength && field.maxLength > 500;
  const inputComponent = isTextarea
    ? `<Textarea
                id="${id}"
                placeholder="${label}..."
                rows={4}
                {...form.register("${id}")}
              />`
    : `<Input
                id="${id}"
                placeholder="${label}..."
                {...form.register("${id}")}
              />`;

  return `            <div className="space-y-2">
              <Label htmlFor="${id}">${label}</Label>
              ${inputComponent}
              {form.formState.errors.${id} && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.${id}.message}
                </p>
              )}
            </div>`;
}

function generateCreatePage(model: ModelSpec): string {
  const lower = lowerFirst(model.name);
  const name = model.name;
  const slug = model.slug;

  // Build Zod schema
  const schemaFields = model.fields
    .map((f) => `  ${f.name}: ${zodType(f)},`)
    .join("\n");

  // Add belongsTo FK fields
  const fkSchemaFields = model.belongsTo
    .map((rel) => `  ${rel.field}: z.string(),`)
    .join("\n");

  // Default values
  const defaults = model.fields
    .map((f) => {
      if (f.enum && f.defaultEnum) return `    ${f.name}: "${f.defaultEnum}",`;
      if (f.type === "String") return `    ${f.name}: "",`;
      if (f.type === "Boolean") return `    ${f.name}: ${f.default ?? false},`;
      if (f.type === "Int" || f.type === "Float") return `    ${f.name}: ${f.default ?? 0},`;
      return `    ${f.name}: "",`;
    })
    .join("\n");

  // FK default values
  const fkDefaults = model.belongsTo
    .map((rel) => `    ${rel.field}: "",`)
    .join("\n");

  // Form fields
  const formFields = model.fields.map((f) => formFieldComponent(f)).join("\n");

  // Determine which UI imports are needed
  const hasTextarea = model.fields.some((f) => f.type === "String" && f.maxLength && f.maxLength > 500);
  const hasEnum = model.fields.some((f) => f.enum);
  const hasBoolean = model.fields.some((f) => f.type === "Boolean");
  const hasNumber = model.fields.some((f) => f.type === "Int" || f.type === "Float");

  const uiImports = [
    'import { Button } from "@/components/ui/button";',
    'import { Input } from "@/components/ui/input";',
    'import { Label } from "@/components/ui/label";',
    hasTextarea ? 'import { Textarea } from "@/components/ui/textarea";' : "",
    hasEnum
      ? 'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";'
      : "",
    hasBoolean ? 'import { Switch } from "@/components/ui/switch";' : "",
    'import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";',
  ]
    .filter(Boolean)
    .join("\n");

  return `"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { trpc } from "@/trpc/client";
import { PageHeader } from "@/components/layout/page-header";
${uiImports}
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const create${name}Schema = z.object({
${schemaFields}
${fkSchemaFields}
});

type Create${name}Input = z.infer<typeof create${name}Schema>;

export default function New${name}Page() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm<Create${name}Input>({
    resolver: zodResolver(create${name}Schema),
    defaultValues: {
${defaults}
${fkDefaults}
    },
  });

  const create${name} = trpc.${lower}.create.useMutation({
    onSuccess: (${lower}) => {
      void utils.${lower}.list.invalidate();
      void utils.user.stats.invalidate();
      toast.success("${model.labelSingular} created!");
      router.push(\`/${slug}/\${${lower}.id}\`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create ${model.labelSingular}"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
      <form onSubmit={form.handleSubmit((data) => create${name}.mutate(data))}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>${model.labelSingular} Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
${formFields}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={create${name}.isPending}>
              {create${name}.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {create${name}.isPending ? "Creating..." : "Create ${model.labelSingular}"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
`;
}

function generateEditPage(model: ModelSpec): string {
  const lower = lowerFirst(model.name);
  const name = model.name;
  const slug = model.slug;

  // Build Zod schema (all fields optional for update)
  const schemaFields = model.fields
    .map((f) => `  ${f.name}: ${zodType(f, true)},`)
    .join("\n");

  // Values mapping from fetched data
  const valuesMapping = model.fields
    .map((f) => {
      if (f.type === "DateTime") {
        return `          ${f.name}: ${lower}.${f.name} ? new Date(${lower}.${f.name}).toISOString().split("T")[0] : "",`;
      }
      if (f.enum) {
        const unionType = f.enum.map((v) => `"${v}"`).join(" | ");
        return `          ${f.name}: ${lower}.${f.name} as ${unionType},`;
      }
      if (f.type === "String") {
        return `          ${f.name}: ${lower}.${f.name} ?? "",`;
      }
      if ((f.type === "Int" || f.type === "Float" || f.type === "Boolean") && !f.required) {
        return `          ${f.name}: ${lower}.${f.name} ?? undefined,`;
      }
      return `          ${f.name}: ${lower}.${f.name},`;
    })
    .join("\n");

  // Form fields
  const formFields = model.fields.map((f) => formFieldComponent(f)).join("\n");

  // Determine which UI imports are needed
  const hasTextarea = model.fields.some((f) => f.type === "String" && f.maxLength && f.maxLength > 500);
  const hasEnum = model.fields.some((f) => f.enum);
  const hasBoolean = model.fields.some((f) => f.type === "Boolean");

  const uiImports = [
    'import { Button } from "@/components/ui/button";',
    'import { Input } from "@/components/ui/input";',
    'import { Label } from "@/components/ui/label";',
    hasTextarea ? 'import { Textarea } from "@/components/ui/textarea";' : "",
    hasEnum
      ? 'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";'
      : "",
    hasBoolean ? 'import { Switch } from "@/components/ui/switch";' : "",
    'import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";',
  ]
    .filter(Boolean)
    .join("\n");

  return `"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { trpc } from "@/trpc/client";
import { PageHeader } from "@/components/layout/page-header";
${uiImports}
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const update${name}Schema = z.object({
${schemaFields}
});

type Update${name}Input = z.infer<typeof update${name}Schema>;

export default function Edit${name}Page() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const utils = trpc.useUtils();

  const { data: ${lower}, isLoading, error } = trpc.${lower}.byId.useQuery({ id });

  const form = useForm<Update${name}Input>({
    resolver: zodResolver(update${name}Schema),
    values: ${lower}
      ? {
${valuesMapping}
        }
      : undefined,
  });

  const update${name} = trpc.${lower}.update.useMutation({
    onSuccess: () => {
      void utils.${lower}.byId.invalidate({ id });
      void utils.${lower}.list.invalidate();
      void utils.user.stats.invalidate();
      toast.success("${model.labelSingular} updated!");
      router.push(\`/${slug}/\${id}\`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) return null;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit ${model.labelSingular}" />
        <Card className="max-w-2xl">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Something went wrong loading this ${model.labelSingular.toLowerCase()}.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit ${model.labelSingular}"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
      <form onSubmit={form.handleSubmit((data) => update${name}.mutate({ id, ...data }))}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>${model.labelSingular} Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
${formFields}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={update${name}.isPending}>
              {update${name}.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {update${name}.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
`;
}

function generateFormLoading(model: ModelSpec, action: string): string {
  const fieldCount = model.fields.length;
  const skeletons = Array.from({ length: Math.min(fieldCount, 6) })
    .map(
      () => `            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>`
    )
    .join("\n");

  return `import { Skeleton } from "@/components/ui/skeleton";

export default function ${action}${model.name}Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="max-w-2xl rounded-lg border">
        <div className="p-6">
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-4">
${skeletons}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t p-6">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
`;
}
