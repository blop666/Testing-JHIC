import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { NextRequest } from "next/server";

import { guruCategories } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { resolveListScope, scopedJurusanId } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { categoryInputSchema, listQuerySchema } from "@/server/validators/content";

export async function GET(request: NextRequest) {
  try {
    const query = listQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    if (!process.env.DATABASE_URL) return apiSuccess([], undefined, { page: query.page, limit: query.limit, total: 0 });
    const { db } = await import("@/db");
    const session = await getSession();
    const { jurusanId, publicOnly } = resolveListScope(session, query.jurusan_id);
    const filters = [];
    if (publicOnly) filters.push(eq(guruCategories.isActive, true));
    if (jurusanId != null) filters.push(eq(guruCategories.jurusanId, jurusanId));
    if (query.q) filters.push(or(ilike(guruCategories.name, `%${query.q}%`), ilike(guruCategories.slug, `%${query.q}%`)));
    if (query.status) filters.push(eq(guruCategories.isActive, query.status === "published"));
    const where = filters.length ? and(...filters) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(guruCategories).where(where).orderBy(asc(guruCategories.sortOrder), asc(guruCategories.name)).limit(query.limit).offset((query.page - 1) * query.limit),
      db.select({ value: count() }).from(guruCategories).where(where),
    ]);
    return apiSuccess(data, undefined, { page: query.page, limit: query.limit, total: totalResult[0]?.value ?? 0 });
  } catch (error) { return routeError(error); }
}
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const input = categoryInputSchema.parse(await request.json());
    const { db } = await import("@/db");
    const [created] = await db.insert(guruCategories).values({ name: input.name, slug: input.slug, sortOrder: input.sortOrder, isActive: input.isActive, jurusanId: scopedJurusanId(session, input.jurusanId), createdBy: session.id }).returning();
    return apiSuccess(created, { status: 201 });
  } catch (error) { return routeError(error); }
}
