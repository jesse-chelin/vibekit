import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  trend,
  className,
}: StatCardProps) {
  const iconBg = iconColor
    ? iconColor.replace("text-", "bg-").replace(/(\w+-\d+)/, "$1/10")
    : "bg-primary/10";
  const iconText = iconColor || "text-primary";

  return (
    <Card className={cn("hover-lift hover:border-primary/30", className)}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {Icon && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                iconBg
              )}
            >
              <Icon className={cn("h-5 w-5", iconText)} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
            {(description || trend) && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {trend && (
                  <>
                    {trend.value >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span
                      className={cn(
                        "font-medium",
                        trend.value >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {trend.value > 0 ? "+" : ""}
                      {trend.value}%
                    </span>
                  </>
                )}
                {description && <span>{description}</span>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
