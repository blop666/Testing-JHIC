import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { NextRequest } from "next/server";

import { fasilitasVokasi, jurusan } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { resolveListScope, scopedJurusanId } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { revalidatePublicResource } from "@/server/cache";
import { fasilitasVokasiInputSchema, listQuerySchema } from "@/server/validators/content";

export async function GET(request: NextRequest) {
  try {
    const query = listQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    if (!process.env.DATABASE_URL) return apiSuccess([], undefined, { page: query.page, limit: query.limit, total: 0 });
    const { db } = await import("@/db");
    const session = await getSession();
    const { jurusanId, publicOnly } = resolveListScope(session, query.jurusan_id);
    const filters = [];
    if (publicOnly) filters.push(eq(fasilitasVokasi.isPublished, true));
    if (jurusanId != null) filters.push(eq(fasilitasVokasi.jurusanId, jurusanId));
    if (query.q) filters.push(or(ilike(fasilitasVokasi.title, `%${query.q}%`), ilike(fasilitasVokasi.tefaName, `%${query.q}%`)));
    if (query.status) filters.push(eq(fasilitasVokasi.isPublished, query.status === "published"));
    const where = filters.length ? and(...filters) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select({ id: fasilitasVokasi.id, title: fasilitasVokasi.title, description: fasilitasVokasi.description, imageUrl: fasilitasVokasi.imageUrl, tefaName: fasilitasVokasi.tefaName, sortOrder: fasilitasVokasi.sortOrder, isPublished: fasilitasVokasi.isPublished, jurusan: { id: jurusan.id, name: jurusan.name, code: jurusan.code } }).from(fasilitasVokasi).leftJoin(jurusan, eq(fasilitasVokasi.jurusanId, jurusan.id)).where(where).orderBy(asc(fasilitasVokasi.sortOrder), asc(fasilitasVokasi.title)).limit(query.limit).offset((query.page - 1) * query.limit),
      db.select({ value: count() }).from(fasilitasVokasi).where(where),
    ]);
    return apiSuccess(data, undefined, { page: query.page, limit: query.limit, total: totalResult[0]?.value ?? 0 });
  } catch (error) { return routeError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const input = fasilitasVokasiInputSchema.parse(await request.json());
    const { db } = await import("@/db");
    const [created] = await db.insert(fasilitasVokasi).values({ ...input, jurusanId: scopedJurusanId(session, input.jurusanId), createdBy: session.id }).returning();
    revalidatePublicResource("vokasi");
    return apiSuccess(created, { status: 201 });
  } catch (error) { return routeError(error); }
}
