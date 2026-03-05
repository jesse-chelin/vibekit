import { PostHog } from "posthog-node";

export const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
});

export function trackEvent(userId: string, event: string, properties?: Record<string, unknown>) {
  posthog.capture({ distinctId: userId, event, properties });
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  posthog.identify({ distinctId: userId, properties });
}
