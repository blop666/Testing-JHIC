import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api-response";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { findKnowledgeScoped } from "@/server/repositories/knowledge";
import { chatJSON, aiConfigured } from "@/server/ai/provider";
import { buildChatContext, CHATBOT_SYSTEM_PROMPT } from "@/server/ai/prompts";
import { chatResponseSchema } from "@/server/ai/schemas";
import { chunkKnowledgeText } from "@/server/ai/knowledge-chunker";
import { knowledgeTestSchema } from "@/server/validators/knowledge";
import { idSchema } from "@/server/validators/content";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    const id = idSchema.parse((await context.params).id);
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const record = await findKnowledgeScoped(id, session);
    if (!record) return apiError({ code: "NOT_FOUND", message: "Knowledge tidak ditemukan." }, { status: 404 });
    if (!aiConfigured()) return apiError({ code: "AI_UNAVAILABLE", message: "Layanan AI belum dikonfigurasi." }, { status: 503 });

    const { prompt } = knowledgeTestSchema.parse(await request.json());
    const title = record.title?.trim() || "Informasi Sekolah";
    const entries = chunkKnowledgeText(record.contentText).slice(0, 5).map((chunk) => ({ title, url: "/", content: chunk.text }));
    const contextText = buildChatContext(entries);

    const result = await chatJSON(
      [
        { role: "system", content: CHATBOT_SYSTEM_PROMPT },
        { role: "user", content: `CONTEXT:\n${contextText}\n\nPertanyaan pengguna: ${prompt}` },
      ],
      chatResponseSchema,
    );

    return apiSuccess(result);
  } catch (error) {
    return routeError(error);
  }
}
