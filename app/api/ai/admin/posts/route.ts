import { and, desc, eq, ilike, or } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { posts } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { assertResourceScope } from "@/lib/auth";
import { revalidatePublicResource } from "@/server/cache";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";

const searchSchema = z.object({ q: z.string().trim().min(2).max(240), type: z.enum(["berita", "pengumuman", "prestasi", "agenda"]).optional() });
const actionSchema = z.object({
  action: z.enum(["update", "draft", "delete"]),
  id: z.number().int().positive(),
  data: z.object({
    title: z.string().trim().min(1).max(240),
    slug: z.string().trim().min(1).max(240),
    excerpt: z.string().max(500).nullable(),
    body: z.string().max(50_000).nullable(),
    imageUrl: z.string().nullable(),
    eventDate: z.coerce.date().nullable(),
    eventEndDate: z.coerce.date().nullable(),
    eventLocation: z.string().max(240).nullable(),
    isHighlighted: z.boolean(),
    isPopularOverride: z.boolean(),
  }).optional(),
});

async function scopedPost(id: number) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  const { db } = await import("@/db");
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) throw new Error("NOT_FOUND");
  assertResourceScope(session, post.jurusanId);
  return { db, post };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const { q, type } = searchSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const { db } = await import("@/db");
    const terms = q.split(/\s+/).filter((term) => term.length >= 2).slice(0, 8);
    const filters = [and(...terms.map((term) => or(ilike(posts.title, `%${term}%`), ilike(posts.excerpt, `%${term}%`))))];
    if (type) filters.push(eq(posts.type, type));
    if (session.role === "jurusan_admin") {
      if (!session.jurusanId) throw new Error("FORBIDDEN_JURUSAN_SCOPE");
      filters.push(eq(posts.jurusanId, session.jurusanId));
    }
    const data = await db.select().from(posts).where(and(...filters)).orderBy(desc(posts.createdAt), desc(posts.id)).limit(5);
    return apiSuccess(data);
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, id, data } = actionSchema.parse(await request.json());
    const { db, post } = await scopedPost(id);
    if (action === "delete") {
      await db.delete(posts).where(eq(posts.id, id));
    } else {
      if (!data) return apiError({ code: "INVALID_INPUT", message: "Data berita wajib diisi." }, { status: 422 });
      await db.update(posts).set({ ...data, isPublished: action === "update", publishedAt: action === "update" ? (post.publishedAt ?? new Date()) : post.publishedAt, updatedAt: new Date() }).where(eq(posts.id, id));
    }
    revalidatePublicResource("posts", "berita");
    return apiSuccess({ id, action });
  } catch (error) {
    return routeError(error);
  }
}
