---
name: analytics
description: Adds PostHog analytics with event tracking, user identification, feature flags, and a GDPR-compliant consent banner. Use when the user wants usage analytics, user tracking, feature flags, A/B testing, or mentions PostHog/analytics/metrics.
---

# Analytics — PostHog

Product analytics with PostHog: automatic page views, custom event tracking, user identification, feature flags, and a consent banner for GDPR compliance.

## When NOT to Use

- User doesn't need analytics or tracking
- User has privacy concerns about any third-party tracking (PostHog Cloud sends data to PostHog's servers; self-hosted keeps data local)
- User already has an analytics solution (Google Analytics, Mixpanel, etc.) and doesn't want to switch
- The app is purely internal/personal with no need for usage insights

## What It Adds

| File | Purpose |
|------|---------|
| `src/lib/analytics.ts` | PostHog client initialization and helper functions |
| `src/components/shared/analytics-provider.tsx` | Provider component with page view tracking |
| `src/components/patterns/consent-banner.tsx` | Cookie consent banner (opt-in before tracking) |
| `src/hooks/use-feature-flag.ts` | Hook for reading PostHog feature flags |
| `src/hooks/use-track-event.ts` | Hook for tracking custom events |

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. User has a PostHog account: https://posthog.com (free tier: 1M events/month)
2. User understands PostHog Cloud sends data to PostHog's servers (self-hosting is an alternative)
3. If GDPR applies, the consent banner MUST be used — tracking only starts after user opts in

## Setup

### 1. Get PostHog Credentials

1. Create project at https://app.posthog.com
2. Go to Settings → Project → Project API Key

### 2. Environment Variables

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Note: These are `NEXT_PUBLIC_` because the PostHog client runs in the browser. The API key is a public project key (not a secret).

### 3. Add Provider to Root Layout

```tsx
import { AnalyticsProvider } from "@/components/shared/analytics-provider";

export default function RootLayout({ children }) {
  return (
    <AnalyticsProvider>
      {children}
    </AnalyticsProvider>
  );
}
```

### 4. Add Consent Banner (If GDPR Applies)

```tsx
import { ConsentBanner } from "@/components/patterns/consent-banner";

// Add to your root layout, after other providers
<ConsentBanner />
```

## Architecture

```
Page Load → AnalyticsProvider → PostHog.init() → Auto page views
User Action → useTrackEvent("clicked_button") → PostHog.capture() → PostHog Cloud/Self-hosted
                                                                          ↓
                                                                   PostHog Dashboard
                                                                   (funnels, retention, etc.)
```

- **Automatic tracking**: Page views tracked on route changes via the provider
- **User identification**: Calls `posthog.identify(userId)` when the user signs in
- **Consent**: If using the consent banner, no events fire until user opts in
- **Feature flags**: Evaluated client-side for instant decisions, server-side for SSR

## Usage

### Track Custom Events

```tsx
"use client";

import { useTrackEvent } from "@/hooks/use-track-event";

export function CreateProjectButton() {
  const track = useTrackEvent();

  return (
    <Button onClick={() => {
      track("project_created", { source: "dashboard" });
      // ... create project logic
    }}>
      New Project
    </Button>
  );
}
```

### Feature Flags

```tsx
"use client";

import { useFeatureFlag } from "@/hooks/use-feature-flag";

export function NewFeature() {
  const isEnabled = useFeatureFlag("new-dashboard");

  if (!isEnabled) return null;
  return <NewDashboard />;
}
```

### Server-Side Tracking

```typescript
import { trackServerEvent } from "@/lib/analytics";

// In a tRPC procedure
await trackServerEvent(ctx.session.user.id, "subscription_upgraded", {
  plan: "pro",
  amount: 19,
});
```

## Post-Install Verification

1. Set PostHog credentials in `.env.local`
2. Start the app: `pnpm dev`
3. Navigate between pages
4. Check PostHog Dashboard → Activity → you should see page view events
5. If using consent banner, verify no events fire until consent is given

## Troubleshooting

**No events in PostHog dashboard**: Check browser console for PostHog initialization errors. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set correctly.

**Consent banner not showing**: It only shows once — after the user responds, it stores the preference in a cookie. Clear cookies to test again.

**Feature flags always returning false**: Feature flags need to be created in the PostHog dashboard first. They also need the user to be identified (`posthog.identify()`).

**Events firing before consent**: Make sure the `AnalyticsProvider` respects the consent cookie. Check that `persistence: "localStorage+cookie"` is set with `opt_out_capturing_by_default: true`.
