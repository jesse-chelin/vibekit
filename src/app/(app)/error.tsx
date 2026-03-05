"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-4 text-center md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        We ran into an unexpected issue. Try again, and if it keeps happening,
        let us know.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
