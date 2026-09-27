import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { chatbotKnowledge } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { findKnowledgeScoped } from "@/server/repositories/knowledge";
import { knowledgeInputSchema } from "@/server/validators/knowledge";
import { idSchema } from "@/server/validators/content";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: Context) {
  try {
    const id = idSchema.parse((await context.params).id);
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const record = await findKnowledgeScoped(id, session);
    if (!record) return apiError({ code: "NOT_FOUND", message: "Knowledge tidak ditemukan." }, { status: 404 });
    return apiSuccess(record);
  } catch (error) {
    return routeError(error);
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const id = idSchema.parse((await context.params).id);
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const record = await findKnowledgeScoped(id, session);
    if (!record) return apiError({ code: "NOT_FOUND", message: "Knowledge tidak ditemukan." }, { status: 404 });
    const input = knowledgeInputSchema.parse(await request.json());
    const { db } = await import("@/db");
    const [updated] = await db
      .update(chatbotKnowledge)
      .set({
        title: input.title,
        contentText: input.contentText,
        sourceUrl: input.sourceUrl ?? null,
        sourceFileName: input.sourceFileName ?? null,
        sourceMimeType: input.sourceMimeType ?? null,
        sourceSizeBytes: input.sourceSizeBytes ?? null,
        sourceHash: input.sourceHash ?? null,
        effectiveFrom: input.effectiveFrom ?? null,
        effectiveUntil: input.effectiveUntil ?? null,
        verifiedAt: input.isPublished ? new Date() : record.verifiedAt,
        isActive: input.isActive,
        isPublished: input.isPublished,
        jurusanId: record.jurusanId,
        updatedBy: session.id,
        updatedAt: new Date(),
      })
      .where(eq(chatbotKnowledge.id, id))
      .returning();
    return apiSuccess(updated);
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(_: NextRequest, context: Context) {
  try {
    const id = idSchema.parse((await context.params).id);
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const record = await findKnowledgeScoped(id, session);
    if (!record) return apiError({ code: "NOT_FOUND", message: "Knowledge tidak ditemukan." }, { status: 404 });
    const { db } = await import("@/db");
    const [updated] = await db.update(chatbotKnowledge).set({ isActive: false, updatedBy: session.id, updatedAt: new Date() }).where(eq(chatbotKnowledge.id, id)).returning();
    return apiSuccess(updated);
  } catch (error) {
    return routeError(error);
  }
}
