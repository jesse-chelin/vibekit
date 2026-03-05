"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { trpc } from "@/trpc/client";
import { FormSection } from "@/components/patterns/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function GeneralSettingsPage() {
  const { data: user, isLoading, error } = trpc.user.me.useQuery();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.name ?? "" } : undefined,
  });

  const utils = trpc.useUtils();

  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      void utils.user.me.invalidate();
      toast.success("Profile updated!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="mt-1 h-4 w-48" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="max-w-2xl space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Something went wrong loading your settings.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form onSubmit={form.handleSubmit((data) => updateUser.mutate(data))}>
        <FormSection
          title="Profile"
          description="Update your personal information."
        >
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ""}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>
          <Button type="submit" disabled={updateUser.isPending}>
            {updateUser.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {updateUser.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </FormSection>
      </form>

      <FormSection
        title="Preferences"
        description="Customize your experience."
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Email Notifications</p>
            <p className="text-xs text-muted-foreground">
              Receive updates via email
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Marketing Emails</p>
            <p className="text-xs text-muted-foreground">
              Receive tips and product updates
            </p>
          </div>
          <Switch />
        </div>
      </FormSection>
    </div>
  );
}
