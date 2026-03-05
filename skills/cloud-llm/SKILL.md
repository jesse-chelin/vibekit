---
name: cloud-llm
description: Adds cloud AI capabilities via OpenAI, Anthropic (Claude), or OpenRouter APIs with streaming chat, provider switching, and a reusable chat UI component. Use when the user wants AI features using cloud models, mentions OpenAI/ChatGPT/Claude/GPT-4, needs powerful AI without local hardware, or wants to use API-based language models.
---

# Cloud LLM — OpenAI / Claude / OpenRouter

Cloud-hosted AI integration supporting multiple providers through a unified interface. Streaming responses, provider switching, and a production-ready chat component.

## When NOT to Use

- User wants free, private, or offline AI (use ollama instead)
- User doesn't want to pay for API usage
- User has privacy requirements that prohibit sending data to third-party APIs
- User already installed ollama and doesn't also need cloud AI

## What It Adds

| File | Purpose |
|------|---------|
| `src/lib/llm.ts` | Unified LLM client: chat, completion, streaming across providers |
| `src/trpc/routers/ai.ts` | tRPC router: chat, listModels, generateCompletion |
| `src/components/patterns/chat.tsx` | Streaming chat UI with provider/model selector |
| `src/app/(app)/ai/page.tsx` | AI chat page |
| `src/app/(app)/ai/loading.tsx` | Skeleton loading state |

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. User has an API key from at least one provider
2. If ollama skill is already installed, this will **replace** the ai.ts router (both cannot coexist without merging)
3. User understands this sends data to third-party APIs and incurs per-token costs

## Supported Providers

| Provider | Env Config | Models | Cost |
|----------|-----------|--------|------|
| **OpenAI** | `LLM_PROVIDER=openai` | gpt-4o, gpt-4o-mini, o1-mini | Pay per token |
| **Anthropic** | `LLM_PROVIDER=anthropic` | claude-sonnet-4-20250514, claude-haiku-4-5-20251001 | Pay per token |
| **OpenRouter** | `LLM_PROVIDER=openrouter` | Any model from any provider | Pay per token |

## Setup

### 1. Get an API Key

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **OpenRouter**: https://openrouter.ai/keys

### 2. Environment Variables

```env
LLM_PROVIDER=openai          # openai, anthropic, or openrouter
LLM_API_KEY=sk-...           # Your API key
LLM_MODEL=gpt-4o-mini        # Default model
```

CRITICAL: Never prefix the API key with `NEXT_PUBLIC_`. It must stay server-side only to prevent exposure in client bundles.

### Provider-Specific Config

**OpenAI:**
```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-proj-...
LLM_MODEL=gpt-4o-mini
```

**Anthropic (Claude):**
```env
LLM_PROVIDER=anthropic
LLM_API_KEY=sk-ant-...
LLM_MODEL=claude-sonnet-4-20250514
```

**OpenRouter (any model):**
```env
LLM_PROVIDER=openrouter
LLM_API_KEY=sk-or-...
LLM_MODEL=anthropic/claude-sonnet-4-20250514
```

## Architecture

```
Chat UI → tRPC ai.chat → LLM Client → Provider API (OpenAI/Anthropic/OpenRouter)
   ↑                                                        |
   └──────────── Streaming response (Server-Sent Events) ───┘
```

- All API calls happen server-side — the API key never reaches the client
- Streaming delivers tokens as they're generated for responsive UX
- Provider and model are configurable at runtime via env vars
- Chat history stored client-side (resets on page refresh)

## Customization

### Adding System Prompts

Edit the `chat` procedure in `src/trpc/routers/ai.ts`:

```typescript
messages: [
  { role: "system", content: "You are a helpful assistant for [your app]." },
  ...input.messages,
],
```

### Rate Limiting

The AI router uses `protectedProcedure` — only authenticated users can call it. Add per-user rate limiting if needed:

```typescript
// In ai.ts, inside the chat procedure
const recentCalls = await ctx.db.aiUsage.count({
  where: { userId: ctx.session.user.id, createdAt: { gte: oneHourAgo } },
});
if (recentCalls > 50) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
```

## Post-Install Verification

1. Set your API key in `.env.local`
2. Start the app: `pnpm dev`
3. Navigate to `/ai`
4. Send a test message — you should see a streaming response
5. If you get a 401 error, your API key is invalid or expired

## Troubleshooting

**401 Unauthorized**: The API key is invalid. Regenerate it from your provider's dashboard.

**429 Rate Limited**: You've exceeded the provider's rate limits. Wait and retry, or upgrade your API plan.

**Model not found**: Check `LLM_MODEL` matches an available model for your provider. OpenRouter models use the `provider/model` format.

**Streaming not working**: Ensure your deployment supports streaming responses. Vercel serverless functions support streaming; some reverse proxies may buffer responses.
