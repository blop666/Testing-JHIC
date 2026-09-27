import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { chatbotKnowledge } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { findKnowledgeScoped } from "@/server/repositories/knowledge";
import { idSchema } from "@/server/validators/content";

type Context = { params: Promise<{ id: string }> };

async function setPublish(id: number, isPublished: boolean) {
  const session = await getSession();
  if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  const record = await findKnowledgeScoped(id, session);
  if (!record) return apiError({ code: "NOT_FOUND", message: "Knowledge tidak ditemukan." }, { status: 404 });
  if (isPublished && !record.title?.trim()) return apiError({ code: "VALIDATION_ERROR", message: "Judul wajib diisi sebelum publish." }, { status: 422 });
  const { db } = await import("@/db");
  const [updated] = await db
    .update(chatbotKnowledge)
    .set({ isPublished, verifiedAt: isPublished ? new Date() : null, updatedBy: session.id, updatedAt: new Date() })
    .where(eq(chatbotKnowledge.id, id))
    .returning();
  return apiSuccess(updated);
}

export async function POST(request: NextRequest, context: Context) {
  try {
    const id = idSchema.parse((await context.params).id);
    const body = (await request.json().catch(() => ({}))) as { action?: string };
    return await setPublish(id, body.action !== "unpublish");
  } catch (error) {
    return routeError(error);
  }
}
