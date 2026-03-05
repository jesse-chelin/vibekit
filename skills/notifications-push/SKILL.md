---
name: notifications-push
description: Adds web push notifications with VAPID keys, service worker, subscription management, and notification center UI. Use when the user wants push notifications, browser notifications, mentions alerting users when the app is closed, or needs real-time alerts outside the browser tab.
---

# Push Notifications — Web Push API

Browser push notifications using the Web Push API with VAPID authentication. Users can opt in to receive notifications even when the app tab is closed.

## When NOT to Use

- User only needs in-app notifications visible while using the app (use notification-center pattern instead)
- User is building for iOS Safari (Web Push on iOS requires specific PWA setup — this skill covers standard web push)
- User's audience primarily uses apps that block notifications
- User needs SMS or mobile app push (this is browser-only)

## What It Adds

| File | Purpose |
|------|---------|
| `src/lib/push.ts` | Web Push server: send notifications, manage subscriptions |
| `src/trpc/routers/notifications.ts` | tRPC router: subscribe, unsubscribe, send, list |
| `src/components/patterns/push-opt-in.tsx` | "Enable notifications" prompt component |
| `src/components/patterns/notification-preferences.tsx` | Per-category notification settings |
| `public/sw.js` | Service worker for receiving and displaying push notifications |

Prisma schema additions: `PushSubscription` model with endpoint, keys, and user relation.

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. The app is served over HTTPS (push notifications require secure context — localhost works for dev)
2. User has generated VAPID keys (see setup below)
3. User understands push notifications require explicit user consent in the browser

## Setup

### 1. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

This outputs a public and private key pair. Save them.

### 2. Environment Variables

```env
VAPID_PUBLIC_KEY=BPx...
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:admin@your-domain.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPx...
```

Note: The public key IS safe to expose to the client (it's in `NEXT_PUBLIC_`). The private key stays server-side only.

### 3. Register Service Worker

Add to your root layout or app shell:

```tsx
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);
```

## Architecture

```
User opts in → Browser generates subscription → Saved to database
                                                      ↓
App event (new message, etc.) → push.ts sendNotification() → Web Push API → Browser → Service Worker → System notification
```

- **Subscription**: Browser-generated endpoint + encryption keys, stored per-user in Prisma
- **Sending**: Server pushes encrypted payload to the browser's push service (Google FCM, Mozilla autopush, etc.)
- **Display**: Service worker receives the push event and shows a system notification
- **Click handling**: Service worker opens the app to the relevant page when notification is clicked

### Notification Flow

1. User clicks "Enable notifications" → browser permission prompt
2. If granted → browser generates a PushSubscription → saved to database
3. When you call `sendNotification(userId, { title, body, url })`, the server:
   - Looks up the user's subscription in the database
   - Encrypts the payload with VAPID keys
   - Sends to the browser's push service
4. Browser receives the push → service worker shows system notification
5. User clicks notification → app opens to `url`

## Usage

### Sending a Notification

```typescript
import { sendPushNotification } from "@/lib/push";

// In a tRPC procedure or API route
await sendPushNotification(userId, {
  title: "New comment",
  body: "Someone commented on your project",
  url: "/projects/123",
});
```

### Opt-In Component

```tsx
import { PushOptIn } from "@/components/patterns/push-opt-in";

// Shows a prompt to enable notifications (only if not already subscribed)
<PushOptIn />
```

## Post-Install Verification

1. Generate and set VAPID keys in `.env.local`
2. Start the app: `pnpm dev`
3. Click "Enable notifications" in the app
4. Accept the browser permission prompt
5. Trigger a test notification — you should see a system notification

## Troubleshooting

**"Registration failed - push service error"**: VAPID keys are invalid. Regenerate with `npx web-push generate-vapid-keys`.

**Permission denied without prompt**: User previously denied notifications. They must manually re-enable via browser settings (Site Settings → Notifications).

**Notifications not showing**: Check that the service worker is registered (`navigator.serviceWorker.ready`), and the browser allows notifications from localhost.

**"NotAllowedError"**: Push requires HTTPS (or localhost). If testing on a non-localhost HTTP URL, it won't work.
