"use client";

import { useRouter } from "next/navigation";
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

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  priority: z.enum(["low", "medium", "high"]),
});

type CreateProjectInput = z.infer<typeof createProjectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "", priority: "medium" },
  });

  const createProject = trpc.project.create.useMutation({
    onSuccess: (project) => {
      void utils.project.list.invalidate();
      void utils.user.stats.invalidate();
      toast.success("Project created!");
      router.push(`/projects/${project.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Project"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
      <form onSubmit={form.handleSubmit((data) => createProject.mutate(data))}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My awesome project"
                {...form.register("name")}
              />
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
                placeholder="What is this project about?"
                rows={4}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value) =>
                  form.setValue("priority", value as "low" | "medium" | "high")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
