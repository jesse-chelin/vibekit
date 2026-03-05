import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <Skeleton className="hidden w-72 shrink-0 md:block" />
      <Skeleton className="flex-1" />
    </div>
  );
}
