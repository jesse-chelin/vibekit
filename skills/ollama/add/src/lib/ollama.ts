import { Ollama } from "ollama";

const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
});

export async function chat(messages: { role: string; content: string }[], model = "llama3.2") {
  const response = await ollama.chat({ model, messages });
  return response.message.content;
}

export async function* streamChat(messages: { role: string; content: string }[], model = "llama3.2") {
  const response = await ollama.chat({ model, messages, stream: true });
  for await (const part of response) {
    yield part.message.content;
  }
}

export async function listModels() {
  const response = await ollama.list();
  return response.models.map((m) => ({ name: m.name, size: m.size }));
}

export { ollama };
