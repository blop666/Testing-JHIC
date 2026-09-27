import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { apiError, apiSuccess } from "@/lib/api-response";
import { jurusanContextFor } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { checkRateLimit, requestIp } from "@/server/rate-limit";
import { aiConfigured, chatJSON, describeImage, estimateInputTokens, chat } from "@/server/ai/provider";
import { aiContentResultSchema, aiGenerateInputSchema, type AiContentResult } from "@/server/ai/content-schemas";
import { buildContentPrompt, CONTENT_SYSTEM_PROMPT } from "@/server/ai/content-prompts";
import { extractUrlSource } from "@/server/ai/source-extractor";
import { auditAiAction } from "@/server/ai/audit";

const MAX_INPUT_TOKENS = 12_000;
const MIME_BY_EXT: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

// Local uploads live under /public; external providers cannot reach them, so
// convert to a data URL for vision analysis. Only relative /uploads paths.
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
    if (!checkRateLimit(`ai:admin:${session.id}:${requestIp(request)}`, dailyLimit, 24 * 60 * 60 * 1000)) {
      return apiError({ code: "RATE_LIMITED", message: "Batas pembuatan konten AI hari ini tercapai." }, { status: 429 });
    }
    if (!aiConfigured()) return apiError({ code: "AI_UNAVAILABLE", message: "Layanan AI belum dikonfigurasi." }, { status: 503 });

    const input = aiGenerateInputSchema.parse(await request.json());
    const jurusanContext = await jurusanContextFor(session);

    const sources: Array<{ title: string; url: string; text: string }> = [];
    for (const url of input.sourceUrls ?? []) {
      try {
        const extracted = await extractUrlSource(url);
        sources.push({ title: extracted.title, url: extracted.url, text: extracted.text });
      } catch (error) {
        return apiError({ code: "SOURCE_EXTRACT_FAILED", message: error instanceof Error ? error.message : "Sumber tidak dapat diproses." }, { status: 422 });
      }
    }

    let imageDescription: string | undefined;
    if (input.imageUrl) {
      try {
        const visionImage = await toVisionImage(input.imageUrl);
        imageDescription = await describeImage(visionImage, "Deskripsikan isi gambar ini secara faktual untuk digunakan sebagai konteks pembuatan konten sekolah (siapa/apa/kegiatan, tanpa menebak nama orang atau tanggal).");
      } catch {
        imageDescription = undefined;
      }
    }

    const userPrompt = buildContentPrompt({
      prompt: input.prompt,
      contentType: input.contentType,
      baseDraft: input.baseDraft as Record<string, unknown> | undefined,
      sources,
      imageDescription,
      mode: input.mode,
      jurusanContext,
    });

    const messages = [
      { role: "system" as const, content: CONTENT_SYSTEM_PROMPT },
      { role: "user" as const, content: userPrompt },
    ];
    if (estimateInputTokens(messages) > MAX_INPUT_TOKENS) {
      return apiError({ code: "INPUT_TOO_LARGE", message: "Sumber terlalu panjang. Ringkas atau kurangi jumlah sumber." }, { status: 422 });
    }

    let result: AiContentResult;
    try {
      result = await chatJSON(messages, aiContentResultSchema, { maxTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS ?? 1200) });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("AI_INVALID_JSON")) {
        const fallback = await chat([...messages, { role: "user", content: "Balas HANYA JSON sesuai bentuk yang diminta." }]);
        result = aiContentResultSchema.parse(JSON.parse(fallback.text));
      } else {
        throw error;
      }
    }

    auditAiAction("ai.content.generate", { userId: session.id, mode: input.mode, contentType: result.kind === "draft" ? result.contentType : undefined, sourceUrls: input.sourceUrls ?? [] });
    if (result.kind === "chat") return apiSuccess({ kind: "chat", answer: result.answer });
    const draft = result;
    return apiSuccess({ kind: "draft", draft, sources: sources.map((s) => ({ title: s.title, url: s.url })), imageAnalyzed: Boolean(imageDescription) });
  } catch (error) {
    return routeError(error);
  }
}
