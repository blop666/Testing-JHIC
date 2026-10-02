import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { NextRequest } from "next/server";

import { jurusan } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { requireSuperAdmin, resolveListScope } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { revalidatePublicResource } from "@/server/cache";
import { jurusanInputSchema, listQuerySchema } from "@/server/validators/content";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-").slice(0, 240);
}

export async function GET(request: NextRequest) {
  try {
    const query = listQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const category = request.nextUrl.searchParams.get("category");
    const categoryFilter = category === "IT" || category === "Teknik" ? category : null;
    if (!process.env.DATABASE_URL) return apiSuccess([], undefined, { page: query.page, limit: query.limit, total: 0 });
    const { db } = await import("@/db");
    const session = await getSession();
    const { jurusanId, publicOnly } = resolveListScope(session, query.jurusan_id);
    const filters = [];
    if (publicOnly) {
      filters.push(eq(jurusan.isActive, true), eq(jurusan.isPublished, true));
    }
    if (jurusanId != null) filters.push(eq(jurusan.id, jurusanId));
    if (query.q) filters.push(or(ilike(jurusan.name, `%${query.q}%`), ilike(jurusan.code, `%${query.q}%`), ilike(jurusan.fullName, `%${query.q}%`)));
    if (query.status) filters.push(eq(jurusan.isPublished, query.status === "published"));
    if (categoryFilter) filters.push(eq(jurusan.category, categoryFilter));
    const where = filters.length ? and(...filters) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(jurusan).where(where).orderBy(asc(jurusan.sortOrder), asc(jurusan.name)).limit(query.limit).offset((query.page - 1) * query.limit),
      db.select({ value: count() }).from(jurusan).where(where),
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
    requireSuperAdmin(session);
    const input = jurusanInputSchema.parse(await request.json());
    const { db } = await import("@/db");
    const [created] = await db
      .insert(jurusan)
      .values({ ...input, slug: input.slug || slugify(input.fullName), logoUrl: input.logoUrl ?? "/hero-banner.jpeg" })
      .returning();
    revalidatePublicResource("jurusan");
    return apiSuccess(created, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
