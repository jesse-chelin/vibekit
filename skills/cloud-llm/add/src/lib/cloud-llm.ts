import OpenAI from "openai";

const providers: Record<string, { baseURL: string }> = {
  openai: { baseURL: "https://api.openai.com/v1" },
  openrouter: { baseURL: "https://openrouter.ai/api/v1" },
};

const provider = process.env.LLM_PROVIDER || "openai";
const model = process.env.LLM_MODEL || "gpt-4o-mini";

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: providers[provider]?.baseURL || providers.openai.baseURL,
});

export async function chat(messages: { role: "user" | "assistant" | "system"; content: string }[]) {
  const response = await client.chat.completions.create({ model, messages });
  return response.choices[0]?.message?.content || "";
}

export async function* streamChat(messages: { role: "user" | "assistant" | "system"; content: string }[]) {
  const stream = await client.chat.completions.create({ model, messages, stream: true });
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}

export { client };
