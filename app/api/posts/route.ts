import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { NextRequest } from "next/server";

import { postCategories, posts } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { resolveListScope } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { postInputSchema, postQuerySchema } from "@/server/validators/posts";
import { createPost } from "@/server/services/posts";

export async function GET(request: NextRequest) {
  try {
    const query = postQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    if (!process.env.DATABASE_URL) return apiSuccess([], undefined, { page: query.page, limit: query.limit, total: 0 });
    const { db } = await import("@/db");
    const session = await getSession();
    const { jurusanId, publicOnly } = resolveListScope(session, query.jurusan_id);
    const filters = [];
    if (publicOnly) filters.push(eq(posts.isPublished, true));
    if (jurusanId != null) filters.push(eq(posts.jurusanId, jurusanId));
    if (query.type) filters.push(eq(posts.type, query.type));
    if (query.status) filters.push(eq(posts.isPublished, query.status === "published"));
    if (query.q) filters.push(or(ilike(posts.title, `%${query.q}%`), ilike(posts.excerpt, `%${query.q}%`)));
    if (query.featured) filters.push(eq(posts.isFeatured, query.featured === "true"));
    if (query.highlighted) filters.push(eq(posts.isHighlighted, query.highlighted === "true"));
    if (query.category) filters.push(eq(postCategories.slug, query.category));
    const where = filters.length ? and(...filters) : undefined;
    const order = query.sort === "popular"
      ? [desc(posts.isPopularOverride), desc(posts.viewCount), desc(posts.publishedAt)]
      : [desc(posts.publishedAt), desc(posts.createdAt)];
    const [data, totalResult] = await Promise.all([
      db.select({ id: posts.id, type: posts.type, title: posts.title, slug: posts.slug, excerpt: posts.excerpt, imageUrl: posts.imageUrl, publishedAt: posts.publishedAt, isPublished: posts.isPublished, isFeatured: posts.isFeatured, featuredOrder: posts.featuredOrder, isHighlighted: posts.isHighlighted, highlightOrder: posts.highlightOrder, category: { name: postCategories.name, slug: postCategories.slug } }).from(posts).leftJoin(postCategories, eq(posts.categoryId, postCategories.id)).where(where).orderBy(...order).limit(query.limit).offset((query.page - 1) * query.limit),
      db.select({ value: count() }).from(posts).leftJoin(postCategories, eq(posts.categoryId, postCategories.id)).where(where),
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
    const input = postInputSchema.parse(await request.json());
    const post = await createPost(session, input);
    return apiSuccess(post, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
