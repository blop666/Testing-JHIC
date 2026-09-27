import { and, asc, count, eq, ilike } from "drizzle-orm";
import { NextRequest } from "next/server";

import { saranaPrasarana } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { requireSuperAdmin } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { revalidatePublicResource } from "@/server/cache";
import { facilityInputSchema, listQuerySchema } from "@/server/validators/content";

export async function GET(request: NextRequest) {
  try {
    const query = listQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    if (!process.env.DATABASE_URL) return apiSuccess([], undefined, { page: query.page, limit: query.limit, total: 0 });
    const { db } = await import("@/db");
    const session = await getSession();
    const filters = [];
    if (session?.role !== "super_admin") filters.push(eq(saranaPrasarana.isPublished, true));
    if (query.q) filters.push(ilike(saranaPrasarana.title, `%${query.q}%`));
    if (query.status) filters.push(eq(saranaPrasarana.isPublished, query.status === "published"));
    const where = filters.length ? and(...filters) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select({ id: saranaPrasarana.id, title: saranaPrasarana.title, description: saranaPrasarana.description, imageUrl: saranaPrasarana.imageUrl, presentationSlot: saranaPrasarana.presentationSlot, sortOrder: saranaPrasarana.sortOrder, isPublished: saranaPrasarana.isPublished }).from(saranaPrasarana).where(where).orderBy(asc(saranaPrasarana.sortOrder), asc(saranaPrasarana.title)).limit(query.limit).offset((query.page - 1) * query.limit),
      db.select({ value: count() }).from(saranaPrasarana).where(where),
    ]);
    return apiSuccess(data, undefined, { page: query.page, limit: query.limit, total: totalResult[0]?.value ?? 0 });
  } catch (error) { return routeError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    requireSuperAdmin(session);
    const input = facilityInputSchema.parse(await request.json());
    const { db } = await import("@/db");
    const [created] = await db.insert(saranaPrasarana).values({ ...input, createdBy: session.id }).returning();
    revalidatePublicResource("facilities");
    return apiSuccess(created, { status: 201 });
  } catch (error) { return routeError(error); }
}
