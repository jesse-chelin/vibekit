import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-1 h-4 w-72" />
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1">
          <div className="rounded-lg border">
            <div className="border-b p-6">
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="p-6 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-md border p-3">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="ml-auto h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-80">
          <div className="rounded-lg border">
            <div className="border-b p-6">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  {i < 3 && <Skeleton className="mt-3 h-px w-full" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
