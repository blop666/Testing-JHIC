import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { apiError, apiSuccess } from "@/lib/api-response";
import { jurusanContextFor } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { checkRateLimit, requestIp } from "@/server/rate-limit";
import { aiConfigured, chat, chatJSON, describeImage, estimateInputTokens } from "@/server/ai/provider";
import { aiResourceResultSchema, aiResourceGenerateInputSchema, type AiResourceResult } from "@/server/ai/resource-schemas";
import { buildResourcePrompt, RESOURCE_SYSTEM_PROMPT } from "@/server/ai/resource-prompts";
import { auditAiAction } from "@/server/ai/audit";

const MAX_INPUT_TOKENS = 8_000;
const MIME_BY_EXT: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

async function toVisionImage(imageUrl: string): Promise<string> {
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (!imageUrl.startsWith("/uploads/")) return imageUrl;
  const filePath = path.join(process.cwd(), "public", imageUrl);
  const buffer = await readFile(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = MIME_BY_EXT[ext] ?? "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const dailyLimit = Number(process.env.AI_ADMIN_DAILY_LIMIT ?? 30);
    if (!checkRateLimit(`ai:resource:${session.id}:${requestIp(request)}`, dailyLimit, 24 * 60 * 60 * 1000)) {
      return apiError({ code: "RATE_LIMITED", message: "Batas penggunaan AI hari ini tercapai." }, { status: 429 });
    }
    if (!aiConfigured()) return apiError({ code: "AI_UNAVAILABLE", message: "Layanan AI belum dikonfigurasi." }, { status: 503 });

    const input = aiResourceGenerateInputSchema.parse(await request.json());
    const jurusanContext = await jurusanContextFor(session);

    let imageDescription: string | undefined;
    if (input.imageUrl) {
      try {
        imageDescription = await describeImage(await toVisionImage(input.imageUrl), "Deskripsikan gambar ini secara faktual untuk data sekolah (tanpa menebak nama, merek, atau angka).");
      } catch {
        imageDescription = undefined;
      }
    }

    const userPrompt = buildResourcePrompt({
      prompt: input.prompt,
      resourceType: input.resourceType,
      baseDraft: input.baseDraft as Record<string, unknown> | undefined,
      imageDescription,
      mode: input.mode,
      jurusanContext,
    });

    const messages = [
      { role: "system" as const, content: RESOURCE_SYSTEM_PROMPT },
      { role: "user" as const, content: userPrompt },
    ];
    if (estimateInputTokens(messages) > MAX_INPUT_TOKENS) {
      return apiError({ code: "INPUT_TOO_LARGE", message: "Instruksi terlalu panjang." }, { status: 422 });
    }

    let result: AiResourceResult;
    try {
      result = await chatJSON(messages, aiResourceResultSchema, { maxTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS ?? 1200) });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("AI_INVALID_JSON")) {
        const fallback = await chat([...messages, { role: "user", content: "Balas HANYA JSON sesuai bentuk yang diminta." }]);
        result = aiResourceResultSchema.parse(JSON.parse(fallback.text));
      } else {
        throw error;
      }
    }

    auditAiAction("ai.resource.generate", { userId: session.id, mode: input.mode, resourceType: input.resourceType });
    if (result.kind === "chat") return apiSuccess({ kind: "chat", answer: result.answer });
    const draft = result;
    return apiSuccess({ kind: "draft", draft, imageAnalyzed: Boolean(imageDescription) });
  } catch (error) {
    return routeError(error);
  }
}
