import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border">
        <div className="border-b p-6">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
