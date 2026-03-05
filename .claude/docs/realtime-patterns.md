# Realtime Patterns

## Optimistic Updates

Use the `useOptimisticMutation` hook for instant UI updates:

```tsx
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";

const { mutate } = useOptimisticMutation({
  mutationFn: (data) => trpc.project.update.mutate(data),
  queryKey: ["project", "list"],
  updater: (old, variables) => ({
    ...old,
    items: old.items.map((p) => p.id === variables.id ? { ...p, ...variables } : p),
  }),
});
```

## Live Indicators

Use `LiveIndicator` for connection/online status:
```tsx
<LiveIndicator status="online" label="Connected" />
```

## Activity Feed

Use `ActivityFeed` for real-time event timelines:
```tsx
<ActivityFeed items={[
  { id: "1", user: { name: "Alice" }, action: "created", target: "Project X", timestamp: new Date() }
]} />
```

## Toast Notifications

Use Sonner for background event notifications:
```tsx
import { toast } from "sonner";
toast.success("Project created!");
toast.error("Something went wrong.");
```
