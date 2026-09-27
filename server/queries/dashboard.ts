import { count, desc, eq } from "drizzle-orm";
import { posts, postCategories, guru, kerjasamaIndustri, saranaPrasarana, fasilitasVokasi, chatbotKnowledge } from "@/db/schema";
import type { SessionUser } from "@/lib/auth";

export async function getDashboardSummary(user: SessionUser) {
  const { db } = await import("@/db");
  const scope = user.role === "jurusan_admin" ? user.jurusanId : null;
  const [postCount, guruCount, partnerCount, facilityCount, vokasiCount, knowledgeCount] = await Promise.all([
    db.select({ value: count() }).from(posts).where(scope ? eq(posts.jurusanId, scope) : undefined),
    db.select({ value: count() }).from(guru).where(scope ? eq(guru.jurusanId, scope) : undefined),
    db.select({ value: count() }).from(kerjasamaIndustri).where(scope ? eq(kerjasamaIndustri.jurusanId, scope) : undefined),
    db.select({ value: count() }).from(saranaPrasarana).where(undefined),
    db.select({ value: count() }).from(fasilitasVokasi).where(scope ? eq(fasilitasVokasi.jurusanId, scope) : undefined),
    db.select({ value: count() }).from(chatbotKnowledge).where(scope ? eq(chatbotKnowledge.jurusanId, scope) : undefined),
  ]);
  return { posts: postCount[0]?.value ?? 0, guru: guruCount[0]?.value ?? 0, partners: partnerCount[0]?.value ?? 0, facilities: facilityCount[0]?.value ?? 0, vokasi: vokasiCount[0]?.value ?? 0, knowledge: knowledgeCount[0]?.value ?? 0 };
}

export async function getDashboardTopPosts(user: SessionUser) {
  const { db } = await import("@/db");
  const scope = user.role === "jurusan_admin" ? user.jurusanId : null;
  return db.select({ id: posts.id, title: posts.title, type: posts.type, imageUrl: posts.imageUrl, publishedAt: posts.publishedAt, viewCount: posts.viewCount, category: postCategories.name }).from(posts).leftJoin(postCategories, eq(posts.categoryId, postCategories.id)).where(scope ? eq(posts.jurusanId, scope) : undefined).orderBy(desc(posts.viewCount), desc(posts.publishedAt)).limit(5);
}
