import { z } from "zod";

type Role = "system" | "user" | "assistant";

export type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

export type ChatMessage = { role: Role; content: string | ContentPart[] };

type ChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
};

export type ChatResult = {
  text: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
};

function env(name: string) {
  return process.env[name]?.trim();
}

export function aiConfigured() {
  return Boolean(env("AI_BASE_URL") && env("AI_API_KEY") && env("AI_MODEL"));
}

export function aiVisionModel() {
  return env("AI_VISION_MODEL") || env("AI_MODEL");
}

export function aiFallbackModel() {
  return env("AI_FALLBACK_MODEL");
}

function toText(content: ChatMessage["content"]) {
  if (typeof content === "string") return content;
  return content.map((part) => (part.type === "text" ? part.text : "[gambar]")).join("\n");
}

export async function chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
  const baseUrl = env("AI_BASE_URL");
  const apiKey = env("AI_API_KEY");
  const model = options.model ?? env("AI_MODEL");
  if (!baseUrl || !apiKey || !model) throw new Error("AI_NOT_CONFIGURED");

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? Number(env("AI_MAX_OUTPUT_TOKENS") ?? 1200),
  };
  if (options.json) body.response_format = { type: "json_object" };

  const timeoutMs = Number(env("AI_REQUEST_TIMEOUT_MS") ?? 30000);
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`AI_UPSTREAM_ERROR:${response.status}:${detail.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    model?: string;
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("AI_EMPTY_RESPONSE");

  return {
    text,
    model: data.model ?? model,
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
  };
}

export async function chatJSON<T>(messages: ChatMessage[], schema: z.ZodType<T>, options: ChatOptions = {}): Promise<T> {
  const result = await chat(messages, { ...options, json: true, temperature: options.temperature ?? 0 });
  let raw: unknown;
  try {
    raw = JSON.parse(result.text);
  } catch {
    throw new Error("AI_INVALID_JSON");
  }
  return schema.parse(raw);
}

/**
 * Uses the vision-capable model, falling back to the main model when the
 * vision model is identical. Images must be passed as data URLs or HTTP(S)
 * URLs accepted by the provider.
 */
export async function describeImage(imageUrl: string, instruction: string): Promise<string> {
  const model = aiVisionModel();
  const result = await chat(
    [
      { role: "system", content: "Anda menganalisis gambar untuk membantu admin membuat konten sekolah. Jawab dalam bahasa Indonesia yang ringkas dan faktual." },
      { role: "user", content: [{ type: "text", text: instruction }, { type: "image_url", image_url: { url: imageUrl } }] },
    ],
    { model, temperature: 0, maxTokens: 800 },
  );
  return result.text;
}

export function estimateInputTokens(messages: ChatMessage[]) {
  return messages.reduce((sum, message) => sum + Math.ceil(toText(message.content).length / 4), 0);
}
