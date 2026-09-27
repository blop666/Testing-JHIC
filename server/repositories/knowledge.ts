import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
import { chatbotKnowledge } from "@/db/schema";
import { assertJurusanScope, type SessionUser } from "@/lib/auth";

export type KnowledgeRecord = typeof chatbotKnowledge.$inferSelect;

export async function findKnowledgeScoped(id: number, session: SessionUser) {
  const { db } = await import("@/db");
  const [record] = await db.select().from(chatbotKnowledge).where(eq(chatbotKnowledge.id, id)).limit(1);
  if (!record) return null;
  assertJurusanScope(session, record.jurusanId);
  return record;
}

export function publicKnowledgeFilter(now = new Date()) {
  return and(
    eq(chatbotKnowledge.isActive, true),
    eq(chatbotKnowledge.isPublished, true),
    or(isNull(chatbotKnowledge.effectiveFrom), lte(chatbotKnowledge.effectiveFrom, now)),
    or(isNull(chatbotKnowledge.effectiveUntil), gte(chatbotKnowledge.effectiveUntil, now)),
  );
}
