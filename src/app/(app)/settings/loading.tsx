import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-28" />
        <Skeleton className="mt-1 h-4 w-56" />
      </div>
      <div className="flex gap-6">
        <div className="hidden md:flex flex-col gap-1 w-48">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
        <div className="flex-1 space-y-8">
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
      </div>
    </div>
  );
}
