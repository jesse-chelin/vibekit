import { cn } from "@/lib/utils";
import { type LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border p-8 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action &&
        (action.href ? (
          <Button asChild className="mt-4">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : action.onClick ? (
          <Button onClick={action.onClick} className="mt-4">
            {action.label}
          </Button>
        ) : null)}
    </div>
  );
}
