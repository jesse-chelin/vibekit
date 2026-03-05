import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  status?: "online" | "offline" | "away";
  label?: string;
  className?: string;
}

export function LiveIndicator({
  status = "online",
  label,
  className,
}: LiveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn("relative flex h-2 w-2", {
          "text-success": status === "online",
          "text-muted-foreground": status === "offline",
          "text-warning": status === "away",
        })}
      >
        {status === "online" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}
