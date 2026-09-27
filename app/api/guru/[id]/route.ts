import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { guru } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { assertResourceScope } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { revalidatePublicResource } from "@/server/cache";
import { assertGuruCategoryScope } from "@/server/repositories/categories";
import { guruInputSchema, idSchema } from "@/server/validators/content";

type Context = { params: Promise<{ id: string }> };

async function findScopedGuru(id: number) {
  const session = await getSession();
  if (!session) return { session: null, record: null };
  const { db } = await import("@/db");
  const [record] = await db.select().from(guru).where(eq(guru.id, id)).limit(1);
  if (!record) return { session, record: null };
  assertResourceScope(session, record.jurusanId);
  return { session, record };
}

export async function GET(_: NextRequest, context: Context) {
  try {
    const { session, record } = await findScopedGuru(idSchema.parse((await context.params).id));
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!record) return apiError({ code: "NOT_FOUND", message: "Data guru tidak ditemukan." }, { status: 404 });
    return apiSuccess(record);
  } catch (error) { return routeError(error); }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const id = idSchema.parse((await context.params).id);
    const { session, record } = await findScopedGuru(id);
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!record) return apiError({ code: "NOT_FOUND", message: "Data guru tidak ditemukan." }, { status: 404 });
    const input = guruInputSchema.parse(await request.json());
    await assertGuruCategoryScope(input.categoryId, record.jurusanId);
    const { db } = await import("@/db");
    const [updated] = await db.update(guru).set({ ...input, jurusanId: record.jurusanId, updatedAt: new Date() }).where(eq(guru.id, id)).returning();
    revalidatePublicResource("guru");
    return apiSuccess(updated);
  } catch (error) { return routeError(error); }
}

export async function DELETE(_: NextRequest, context: Context) {
  try {
    const id = idSchema.parse((await context.params).id);
    const { session, record } = await findScopedGuru(id);
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!record) return apiError({ code: "NOT_FOUND", message: "Data guru tidak ditemukan." }, { status: 404 });
    const { db } = await import("@/db");
    const [updated] = await db.update(guru).set({ isPublished: false, updatedAt: new Date() }).where(eq(guru.id, id)).returning();
    revalidatePublicResource("guru");
    return apiSuccess(updated);
  } catch (error) { return routeError(error); }
}
