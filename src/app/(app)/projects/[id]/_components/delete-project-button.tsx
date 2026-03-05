"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => {
      void utils.project.list.invalidate();
      void utils.user.stats.invalidate();
      toast.success("Project deleted.");
      router.push("/projects");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <Button variant="destructive" size="icon" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete project?"
        description="This will permanently delete the project and all its tasks. This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteProject.isPending}
        onConfirm={() => deleteProject.mutate({ id: projectId })}
      />
    </>
  );
}
