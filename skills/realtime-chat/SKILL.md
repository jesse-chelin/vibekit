---
name: realtime-chat
description: Adds real-time chat with message persistence, room management, and online presence. Use when the user wants messaging, chat rooms, or real-time communication between users. Polling-based with 2-second refresh for near-instant feel.
---

# Realtime Chat

Persistent, multi-room chat with online presence indicators and near-real-time message delivery via tRPC polling.

## When NOT to Use

- User needs a customer support chat widget (use a dedicated support tool like Crisp or Intercom)
- User needs video or voice calling (this is text-only messaging)
- User needs sub-second latency for gaming or trading (polling at 2s is not fast enough — needs WebSocket)
- The app has no multi-user communication features

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. The app has user authentication working (chat requires authenticated users)
2. User understands this uses polling (2s interval), not WebSockets
3. Database schema can be modified (adds ChatRoom, ChatMember, ChatMessage models)

## What It Adds

| File | Purpose |
|------|---------|
| `src/trpc/routers/chat.ts` | Full chat tRPC router: rooms, messages, members, presence |
| `src/components/patterns/chat-room.tsx` | Chat UI component: message list, input, online indicators |
| `src/app/(app)/chat/page.tsx` | Chat page with room list + active room |
| `src/app/(app)/chat/loading.tsx` | Skeleton loading state |

Prisma schema additions: `ChatRoom`, `ChatMember`, `ChatMessage` models with relations to User.

## Architecture

### How Real-Time Works

Messages are delivered via **short-polling** — the client queries for new messages every 2 seconds using tRPC's `refetchInterval`. This is simpler than WebSockets and works reliably with Next.js serverless deployments.

For most chat use cases (team messaging, support chat, community rooms), 2-second polling feels instant enough. If you need sub-second latency (e.g. gaming chat), consider adding WebSocket support.

### Data Model

```
ChatRoom (id, name, createdAt)
  ├── ChatMember (userId, roomId, lastSeen)  -- tracks membership & presence
  └── ChatMessage (content, userId, roomId, createdAt)  -- persisted messages
```

### Presence Detection

Members update their `lastSeen` timestamp every 10 seconds while the chat is open. Users seen in the last 30 seconds are shown as "online".

## Setup

1. Install the skill — Prisma models will be added automatically
2. Run `pnpm db:push` to create the tables
3. The chat page is available at `/chat`
4. Add "Chat" to your sidebar navigation if desired

## Customization

### Adjusting Polling Interval

In `chat-room.tsx`, change the `refetchInterval` value:
```typescript
refetchInterval: 2000, // milliseconds — lower = more responsive, more DB load
```

### Adding to Sidebar

Add this to `app-sidebar.tsx` navigation items:
```typescript
{ label: "Chat", href: "/chat", icon: MessageSquare }
```

## Troubleshooting

**Messages not appearing**: Check that the user is a member of the room. Only members can see and send messages.

**Online indicator always empty**: The `markSeen` mutation runs every 10 seconds. Make sure the chat component is mounted and the user is authenticated.
