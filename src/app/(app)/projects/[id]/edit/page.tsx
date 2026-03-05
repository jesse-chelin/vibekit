"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const updateProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(["active", "completed", "archived"]),
  priority: z.enum(["low", "medium", "high"]),
});

type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const utils = trpc.useUtils();

  const { data: project, isLoading, error } = trpc.project.byId.useQuery({ id });

  const form = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    values: project
      ? {
          name: project.name,
          description: project.description ?? "",
          status: project.status as "active" | "completed" | "archived",
          priority: project.priority as "low" | "medium" | "high",
        }
      : undefined,
  });

  const updateProject = trpc.project.update.useMutation({
    onSuccess: () => {
      void utils.project.byId.invalidate({ id });
      void utils.project.list.invalidate();
      void utils.user.stats.invalidate();
      toast.success("Project updated!");
      router.push(`/projects/${id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) return null; // loading.tsx handles this

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Project" />
        <Card className="max-w-2xl">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Something went wrong loading this project.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.back()}
            >
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
        title="Edit Project"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
      <form
        onSubmit={form.handleSubmit((data) =>
          updateProject.mutate({ id, ...data })
        )}
      >
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) =>
                    form.setValue(
                      "status",
                      value as "active" | "completed" | "archived"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(value) =>
                    form.setValue(
                      "priority",
                      value as "low" | "medium" | "high"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProject.isPending}>
              {updateProject.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {updateProject.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
