import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { NextRequest } from "next/server";

import { guru, guruCategories } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { resolveListScope, scopedJurusanId } from "@/lib/auth";
import { assertGuruCategoryScope } from "@/server/repositories/categories";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { revalidatePublicResource } from "@/server/cache";
import { guruInputSchema, listQuerySchema } from "@/server/validators/content";

export async function GET(request: NextRequest) {
  try {
    const query = listQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    if (!process.env.DATABASE_URL) return apiSuccess([], undefined, { page: query.page, limit: query.limit, total: 0 });
    const { db } = await import("@/db");
    const session = await getSession();
    const { jurusanId, publicOnly } = resolveListScope(session, query.jurusan_id);
    const filters = [];
    if (publicOnly) filters.push(eq(guru.isPublished, true));
    if (jurusanId != null) filters.push(eq(guru.jurusanId, jurusanId));
    if (query.category) filters.push(eq(guru.categoryId, query.category));
    if (query.q) filters.push(or(ilike(guru.name, `%${query.q}%`), ilike(guru.position, `%${query.q}%`)));
    if (query.status) filters.push(eq(guru.isPublished, query.status === "published"));
    const where = filters.length ? and(...filters) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select({ id: guru.id, name: guru.name, position: guru.position, bio: guru.bio, imageUrl: guru.imageUrl, sortOrder: guru.sortOrder, isPublished: guru.isPublished, category: { id: guruCategories.id, name: guruCategories.name, slug: guruCategories.slug } }).from(guru).leftJoin(guruCategories, eq(guru.categoryId, guruCategories.id)).where(where).orderBy(asc(guru.sortOrder), asc(guru.name)).limit(query.limit).offset((query.page - 1) * query.limit),
      db.select({ value: count() }).from(guru).where(where),
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
    const input = guruInputSchema.parse(await request.json());
    const jurusanId = scopedJurusanId(session, input.jurusanId);
    await assertGuruCategoryScope(input.categoryId, jurusanId);
    const { db } = await import("@/db");
    const [created] = await db.insert(guru).values({ ...input, jurusanId, createdBy: session.id }).returning();
    revalidatePublicResource("guru");
    return apiSuccess(created, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
