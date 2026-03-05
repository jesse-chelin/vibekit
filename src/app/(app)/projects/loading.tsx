import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
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
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-8" />
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
