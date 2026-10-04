import { and, desc, eq, sql } from "drizzle-orm";

import { posts } from "@/db/schema";

export async function insertPost(values: typeof posts.$inferInsert) {
  const { db } = await import("@/db");
  const [record] = await db.insert(posts).values(values).returning();
  return record;
}

export async function findPublishedPostBySlug(slug: string) {
  const { db } = await import("@/db");
  const [record] = await db.select().from(posts).where(and(eq(posts.slug, slug), eq(posts.isPublished, true))).orderBy(desc(posts.publishedAt)).limit(1);
  return record ?? null;
}

export async function incrementPostViewCount(id: number) {
  if (!process.env.DATABASE_URL) return;
  const { db } = await import("@/db");
  await db.update(posts).set({ viewCount: sql`${posts.viewCount} + 1` }).where(eq(posts.id, id));
}
