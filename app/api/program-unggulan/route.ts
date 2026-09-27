import { and, asc, count, eq, ilike } from "drizzle-orm";
import { NextRequest } from "next/server";

import { jurusan, programUnggulan } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { resolveListScope, scopedJurusanId } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { revalidatePublicResource } from "@/server/cache";
import { listQuerySchema, programUnggulanInputSchema } from "@/server/validators/content";

export async function GET(request: NextRequest) {
  try {
    const query = listQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    if (!process.env.DATABASE_URL) return apiSuccess([], undefined, { page: query.page, limit: query.limit, total: 0 });
    const { db } = await import("@/db");
    const session = await getSession();
    const { jurusanId, publicOnly } = resolveListScope(session, query.jurusan_id);
    const filters = [];
    if (publicOnly) filters.push(eq(programUnggulan.isPublished, true));
    if (jurusanId != null) filters.push(eq(programUnggulan.jurusanId, jurusanId));
    if (query.q) filters.push(ilike(programUnggulan.title, `%${query.q}%`));
    if (query.status) filters.push(eq(programUnggulan.isPublished, query.status === "published"));
    const where = filters.length ? and(...filters) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select({ id: programUnggulan.id, title: programUnggulan.title, description: programUnggulan.description, label: programUnggulan.label, imageUrl: programUnggulan.imageUrl, sortOrder: programUnggulan.sortOrder, isPublished: programUnggulan.isPublished, jurusan: { id: jurusan.id, name: jurusan.name, code: jurusan.code } }).from(programUnggulan).leftJoin(jurusan, eq(programUnggulan.jurusanId, jurusan.id)).where(where).orderBy(asc(programUnggulan.sortOrder), asc(programUnggulan.title)).limit(query.limit).offset((query.page - 1) * query.limit),
      db.select({ value: count() }).from(programUnggulan).where(where),
    ]);
    return apiSuccess(data, undefined, { page: query.page, limit: query.limit, total: totalResult[0]?.value ?? 0 });
  } catch (error) { return routeError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const input = programUnggulanInputSchema.parse(await request.json());
    const { db } = await import("@/db");
    const [created] = await db.insert(programUnggulan).values({ ...input, jurusanId: scopedJurusanId(session, input.jurusanId), createdBy: session.id }).returning();
    revalidatePublicResource("programs");
    return apiSuccess(created, { status: 201 });
  } catch (error) { return routeError(error); }
}
