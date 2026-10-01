import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { posts } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { assertResourceScope } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { postIdSchema, postInputSchema } from "@/server/validators/posts";
import { assertPostCategoryScope } from "@/server/repositories/categories";
import { revalidatePublicResource } from "@/server/cache";

const statusSchema = z.object({ isPublished: z.boolean() });

type Context = { params: Promise<{ id: string }> };

async function findScopedPost(id: number) {
  const session = await getSession();
  if (!session) return { session: null, post: null };
  const { db } = await import("@/db");
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return { session, post: null };
  assertResourceScope(session, post.jurusanId);
  return { session, post };
}

export async function GET(_: NextRequest, context: Context) {
  try {
    const id = postIdSchema.parse((await context.params).id);
    const { session, post } = await findScopedPost(id);
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!post) return apiError({ code: "NOT_FOUND", message: "Post tidak ditemukan." }, { status: 404 });
    return apiSuccess(post);
  } catch (error) {
    return routeError(error);
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const id = postIdSchema.parse((await context.params).id);
    const { session, post } = await findScopedPost(id);
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!post) return apiError({ code: "NOT_FOUND", message: "Post tidak ditemukan." }, { status: 404 });
    const input = postInputSchema.parse(await request.json());
    await assertPostCategoryScope(input.categoryId, post.jurusanId);
    const { db } = await import("@/db");
    const [updated] = await db.update(posts).set({ ...input, jurusanId: post.jurusanId, galleryUrls: input.galleryUrls ?? [], updatedAt: new Date() }).where(eq(posts.id, id)).returning();
    revalidatePublicResource("posts", post.type);
    if (input.type !== post.type) revalidatePublicResource("posts", input.type);
    return apiSuccess(updated);
  } catch (error) {
    return routeError(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const id = postIdSchema.parse((await context.params).id);
    const { session, post } = await findScopedPost(id);
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!post) return apiError({ code: "NOT_FOUND", message: "Post tidak ditemukan." }, { status: 404 });
    const { isPublished } = statusSchema.parse(await request.json());
    const { db } = await import("@/db");
    const [updated] = await db.update(posts).set({ isPublished, publishedAt: isPublished ? (post.publishedAt ?? new Date()) : post.publishedAt, updatedAt: new Date() }).where(eq(posts.id, id)).returning();
    revalidatePublicResource("posts", post.type);
    return apiSuccess(updated);
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(_: NextRequest, context: Context) {
  try {
    const id = postIdSchema.parse((await context.params).id);
    const { session, post } = await findScopedPost(id);
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!post) return apiError({ code: "NOT_FOUND", message: "Post tidak ditemukan." }, { status: 404 });
    const { db } = await import("@/db");
    await db.delete(posts).where(eq(posts.id, id));
    revalidatePublicResource("posts", post.type);
    return apiSuccess({ id });
  } catch (error) {
    return routeError(error);
  }
}
