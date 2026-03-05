import { cn } from "@/lib/utils";

interface DetailLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function DetailLayout({
  children,
  sidebar,
  className,
}: DetailLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-6 lg:flex-row lg:gap-8", className)}>
      <div className="flex-1 min-w-0">{children}</div>
      {sidebar && (
        <aside className="w-full lg:w-80 shrink-0">{sidebar}</aside>
      )}
    </div>
  );
}
