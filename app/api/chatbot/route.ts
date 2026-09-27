import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api-response";
import { chat, chatJSON, aiConfigured } from "@/server/ai/provider";
import { buildChatContext, CHATBOT_SYSTEM_PROMPT } from "@/server/ai/prompts";
import { chatResponseSchema } from "@/server/ai/schemas";
import { retrieveChatbotContext } from "@/server/ai/retrieval";
import { routeError } from "@/server/http";
import { checkRateLimit, requestIp } from "@/server/rate-limit";

const bodySchema = z.object({ prompt: z.string().trim().min(2).max(1_000) });

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(`chatbot:${requestIp(request)}`, 20, 60 * 60 * 1000)) return apiError({ code: "RATE_LIMITED", message: "Batas pertanyaan tercapai. Coba lagi nanti." }, { status: 429 });
    const { prompt } = bodySchema.parse(await request.json());
    if (!aiConfigured()) return apiError({ code: "CHATBOT_UNAVAILABLE", message: "Layanan chatbot belum tersedia." }, { status: 503 });

    const entries = await retrieveChatbotContext(prompt);
    const contextText = buildChatContext(entries);

    let result: z.infer<typeof chatResponseSchema>;
    try {
      result = await chatJSON(
        [
          { role: "system", content: CHATBOT_SYSTEM_PROMPT },
          { role: "user", content: `CONTEXT:\n${contextText}\n\nPertanyaan pengguna: ${prompt}` },
        ],
        chatResponseSchema,
      );
    } catch {
      const fallback = await chat([
        { role: "system", content: CHATBOT_SYSTEM_PROMPT },
        { role: "user", content: `CONTEXT:\n${contextText}\n\nPertanyaan pengguna: ${prompt}\n\nJawab hanya JSON sesuai bentuk yang diminta.` },
      ]);
      let raw: unknown;
      try {
        raw = JSON.parse(fallback.text);
      } catch {
        return apiError({ code: "CHATBOT_UNAVAILABLE", message: "Layanan chatbot sedang tidak dapat memproses permintaan." }, { status: 503 });
      }
      result = chatResponseSchema.parse(raw);
    }

    return apiSuccess(result);
  } catch (error) {
    return routeError(error);
  }
}
