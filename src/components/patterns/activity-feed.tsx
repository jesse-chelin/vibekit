import { cn, formatRelativeTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityItem {
  id: string;
  user: { name: string; image?: string };
  action: string;
  target?: string;
  timestamp: Date | string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No activity yet
      </p>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <Avatar className="h-7 w-7 mt-0.5">
            <AvatarImage src={item.user.image} alt={item.user.name} />
            <AvatarFallback className="text-xs">
              {item.user.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{item.user.name}</span>{" "}
              <span className="text-muted-foreground">{item.action}</span>
              {item.target && (
                <span className="font-medium"> {item.target}</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(item.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
