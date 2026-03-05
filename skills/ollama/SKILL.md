---
name: ollama
description: Adds local AI capabilities using Ollama with streaming chat, model selection, and a reusable chat UI component. Use when the user wants AI features running locally, mentions Ollama, wants free/private AI, or needs offline AI capabilities. Requires Ollama installed on the host machine.
---

# Ollama — Local LLM Integration

Run AI models locally via Ollama — free, private, and works offline. Includes a streaming chat component, model selector, and tRPC router for chat/completion.

## When NOT to Use

- User wants cloud-hosted AI (use cloud-llm instead)
- User's machine lacks sufficient hardware (minimum 8GB RAM for small models, 16GB+ recommended)
- User needs specific models only available via API (GPT-4o, Claude, etc.)
- User wants to avoid installing additional software on their machine

## What It Adds

| File | Purpose |
|------|---------|
| `src/lib/ollama.ts` | Ollama client: chat, completion, streaming, model listing |
| `src/trpc/routers/ai.ts` | tRPC router: chat, listModels, generateCompletion |
| `src/components/patterns/chat.tsx` | Streaming chat UI with model selector and message history |
| `src/app/(app)/ai/page.tsx` | AI chat page |
| `src/app/(app)/ai/loading.tsx` | Skeleton loading state |

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. Ollama is installed: `ollama --version` (install from https://ollama.com if not)
2. At least one model is pulled: `ollama list` (if empty, run `ollama pull llama3.2`)
3. Ollama is running: `curl http://localhost:11434/api/tags` should return JSON

## Setup

### 1. Install Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Or visit https://ollama.com for platform-specific installers
```

### 2. Pull a Model

```bash
# Recommended starting model (~2GB, fast, good quality)
ollama pull llama3.2

# Larger, more capable
ollama pull llama3.1

# Small and fast (good for low-RAM machines)
ollama pull phi3:mini
```

### 3. Environment Variables

```env
OLLAMA_BASE_URL=http://localhost:11434
```

For Docker deployments, use the host machine's IP instead of localhost:
```env
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

## Architecture

```
Chat UI → tRPC ai.chat → Ollama Client → Ollama API (localhost:11434) → Local Model
   ↑                                                                         |
   └────────────────── Streaming response (Server-Sent Events) ──────────────┘
```

- Messages stream token-by-token for responsive feel
- Model selector auto-populates from `ollama list`
- Chat history stored client-side (conversation resets on page refresh)
- All inference happens on the local machine — nothing sent to the cloud

### Supported Operations

| Procedure | Description |
|-----------|-------------|
| `ai.chat` | Send messages, get streaming response |
| `ai.listModels` | List all locally available models |
| `ai.generateCompletion` | Single prompt → completion (non-chat) |

## Customization

### Using in Other Components

```tsx
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

// List available models
const trpc = useTRPC();
const { data: models } = useQuery(trpc.ai.listModels.queryOptions());

// Generate a completion
const { data } = useQuery(
  trpc.ai.generateCompletion.queryOptions({
    model: "llama3.2",
    prompt: "Summarize this text: ...",
  })
);
```

### Adding System Prompts

Edit the `chat` procedure in `src/trpc/routers/ai.ts` to prepend a system message:

```typescript
messages: [
  { role: "system", content: "You are a helpful assistant for [app purpose]." },
  ...input.messages,
],
```

## Post-Install Verification

1. Start your app: `pnpm dev`
2. Navigate to `/ai`
3. Select a model from the dropdown
4. Send a message — you should see a streaming response
5. If no models appear in the dropdown, run `ollama list` to verify models are installed

## Troubleshooting

**"Connection refused" error**: Ollama isn't running. Start it with `ollama serve` or check if it's running as a system service.

**No models in dropdown**: No models are pulled. Run `ollama pull llama3.2`.

**Slow responses**: Larger models need more RAM/VRAM. Try a smaller model (`phi3:mini`) or check if other processes are using GPU memory.

**Docker can't reach Ollama**: Use `host.docker.internal` instead of `localhost` in `OLLAMA_BASE_URL`, or run Ollama in the same Docker network.
