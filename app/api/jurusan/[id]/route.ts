import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { jurusan } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { assertResourceScope, requireSuperAdmin } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { revalidatePublicResource } from "@/server/cache";
import { idSchema, jurusanInputSchema } from "@/server/validators/content";

const statusSchema = z.object({ isPublished: z.boolean() });

type Context = { params: Promise<{ id: string }> };

async function adminRecord(id: number) {
  const session = await getSession();
  if (!session) return { session: null, record: null };
  const { db } = await import("@/db");
  const [record] = await db.select().from(jurusan).where(eq(jurusan.id, id)).limit(1);
  if (!record) return { session, record: null };
  assertResourceScope(session, record.id);
  return { session, record };
}

export async function GET(_: NextRequest, context: Context) {
  const id = idSchema.parse((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return apiError({ code: "VALIDATION_ERROR", message: "ID jurusan tidak valid." }, { status: 422 });
  if (!process.env.DATABASE_URL) return apiError({ code: "NOT_FOUND", message: "Jurusan tidak ditemukan." }, { status: 404 });
  try {
    const session = await getSession();
    const { db } = await import("@/db");
    const [record] = await db.select().from(jurusan).where(eq(jurusan.id, id)).limit(1);
    if (!record) return apiError({ code: "NOT_FOUND", message: "Jurusan tidak ditemukan." }, { status: 404 });
    if (session?.role === "super_admin") return apiSuccess(record);
    if (session?.role === "jurusan_admin") {
      if (session.jurusanId !== record.id) return apiError({ code: "FORBIDDEN", message: "Anda tidak memiliki akses." }, { status: 403 });
      return apiSuccess(record);
    }
    if (!record.isPublished || !record.isActive) return apiError({ code: "NOT_FOUND", message: "Jurusan tidak ditemukan." }, { status: 404 });
    return apiSuccess(record);
  } catch (error) { return routeError(error); }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const id = idSchema.parse((await context.params).id);
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const { db } = await import("@/db");
    const [existing] = await db.select().from(jurusan).where(eq(jurusan.id, id)).limit(1);
    if (!existing) return apiError({ code: "NOT_FOUND", message: "Jurusan tidak ditemukan." }, { status: 404 });
    if (session.role === "jurusan_admin") {
      if (session.jurusanId !== existing.id) return apiError({ code: "FORBIDDEN", message: "Anda tidak memiliki akses." }, { status: 403 });
    } else {
      requireSuperAdmin(session);
    }
    const input = jurusanInputSchema.parse(await request.json());
    const [updated] = await db.update(jurusan).set({
      ...input,
      slug: input.slug || existing.slug,
      logoUrl: input.logoUrl ?? existing.logoUrl,
      updatedAt: new Date(),
    }).where(eq(jurusan.id, id)).returning();
    revalidatePublicResource("jurusan");
    return apiSuccess(updated);
  } catch (error) { return routeError(error); }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const id = idSchema.parse((await context.params).id);
    const { session, record } = await adminRecord(id);
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!record) return apiError({ code: "NOT_FOUND", message: "Jurusan tidak ditemukan." }, { status: 404 });
    requireSuperAdmin(session);
    const { isPublished } = statusSchema.parse(await request.json());
    const { db } = await import("@/db");
    const [updated] = await db.update(jurusan).set({ isPublished, updatedAt: new Date() }).where(eq(jurusan.id, id)).returning();
    revalidatePublicResource("jurusan");
    return apiSuccess(updated);
  } catch (error) { return routeError(error); }
}

export async function DELETE(_: NextRequest, context: Context) {
  try {
    const id = idSchema.parse((await context.params).id);
    const { session, record } = await adminRecord(id);
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!record) return apiError({ code: "NOT_FOUND", message: "Jurusan tidak ditemukan." }, { status: 404 });
    requireSuperAdmin(session);
    const { db } = await import("@/db");
    await db.delete(jurusan).where(eq(jurusan.id, id));
    revalidatePublicResource("jurusan");
    return apiSuccess({ id });
  } catch (error) { return routeError(error); }
}
