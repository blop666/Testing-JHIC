import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { NextRequest } from "next/server";

import { chatbotKnowledge } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { scopedJurusanId } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { knowledgeInputSchema, knowledgeListQuerySchema } from "@/server/validators/knowledge";

export async function GET(request: NextRequest) {
  try {
    const query = knowledgeListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!process.env.DATABASE_URL) return apiSuccess([], undefined, { page: query.page, limit: query.limit, total: 0 });
    const { db } = await import("@/db");

    const filters = [];
    if (session.role === "jurusan_admin") filters.push(eq(chatbotKnowledge.jurusanId, session.jurusanId!));
    if (query.q) filters.push(or(ilike(chatbotKnowledge.title, `%${query.q}%`), ilike(chatbotKnowledge.contentText, `%${query.q}%`)));
    if (query.status === "draft") filters.push(eq(chatbotKnowledge.isActive, true), eq(chatbotKnowledge.isPublished, false));
    if (query.status === "published") filters.push(eq(chatbotKnowledge.isActive, true), eq(chatbotKnowledge.isPublished, true));
    if (query.status === "archived") filters.push(eq(chatbotKnowledge.isActive, false));
    const where = filters.length ? and(...filters) : undefined;

    const [data, totalResult] = await Promise.all([
      db.select().from(chatbotKnowledge).where(where).orderBy(asc(chatbotKnowledge.title), asc(chatbotKnowledge.id)).limit(query.limit).offset((query.page - 1) * query.limit),
      db.select({ value: count() }).from(chatbotKnowledge).where(where),
    ]);
    return apiSuccess(data, undefined, { page: query.page, limit: query.limit, total: totalResult[0]?.value ?? 0 });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const input = knowledgeInputSchema.parse(await request.json());
    const { db } = await import("@/db");
    const [created] = await db
      .insert(chatbotKnowledge)
      .values({
        title: input.title,
        contentText: input.contentText,
        sourceUrl: input.sourceUrl ?? null,
        sourceFileName: input.sourceFileName ?? null,
        sourceMimeType: input.sourceMimeType ?? null,
        sourceSizeBytes: input.sourceSizeBytes ?? null,
        sourceHash: input.sourceHash ?? null,
        effectiveFrom: input.effectiveFrom ?? null,
        effectiveUntil: input.effectiveUntil ?? null,
        verifiedAt: input.isPublished ? new Date() : null,
        isActive: input.isActive,
        isPublished: input.isPublished,
        jurusanId: scopedJurusanId(session, input.jurusanId),
        createdBy: session.id,
        updatedBy: session.id,
      })
      .returning();
    return apiSuccess(created, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
