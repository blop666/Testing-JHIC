import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fasilitasVokasi } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { assertResourceScope } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { revalidatePublicResource } from "@/server/cache";
import { fasilitasVokasiInputSchema, idSchema } from "@/server/validators/content";

const statusSchema = z.object({ isPublished: z.boolean() });

type Context = { params: Promise<{ id: string }> };
async function adminRecord(id: number) {
  const session = await getSession();
  if (!session) return { session: null, record: null };
  const { db } = await import("@/db");
  const [record] = await db.select().from(fasilitasVokasi).where(eq(fasilitasVokasi.id, id)).limit(1);
  if (!record) return { session, record: null };
  assertResourceScope(session, record.jurusanId);
  return { session, record };
}
export async function GET(_: NextRequest, context: Context) {
  try { const { session, record } = await adminRecord(idSchema.parse((await context.params).id)); if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 }); if (!record) return apiError({ code: "NOT_FOUND", message: "Fasilitas tidak ditemukan." }, { status: 404 }); return apiSuccess(record); } catch (error) { return routeError(error); }
}
export async function PUT(request: NextRequest, context: Context) {
  try { const id = idSchema.parse((await context.params).id); const { session, record } = await adminRecord(id); if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 }); if (!record) return apiError({ code: "NOT_FOUND", message: "Fasilitas tidak ditemukan." }, { status: 404 }); const input = fasilitasVokasiInputSchema.parse(await request.json()); const { db } = await import("@/db"); const [updated] = await db.update(fasilitasVokasi).set({ ...input, jurusanId: record.jurusanId, updatedAt: new Date() }).where(eq(fasilitasVokasi.id, id)).returning(); revalidatePublicResource("vokasi"); return apiSuccess(updated); } catch (error) { return routeError(error); }
}
export async function PATCH(request: NextRequest, context: Context) {
  try { const id = idSchema.parse((await context.params).id); const { session, record } = await adminRecord(id); if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 }); if (!record) return apiError({ code: "NOT_FOUND", message: "Fasilitas tidak ditemukan." }, { status: 404 }); const { isPublished } = statusSchema.parse(await request.json()); const { db } = await import("@/db"); const [updated] = await db.update(fasilitasVokasi).set({ isPublished, updatedAt: new Date() }).where(eq(fasilitasVokasi.id, id)).returning(); revalidatePublicResource("vokasi"); return apiSuccess(updated); } catch (error) { return routeError(error); }
}
export async function DELETE(_: NextRequest, context: Context) {
  try { const id = idSchema.parse((await context.params).id); const { session, record } = await adminRecord(id); if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 }); if (!record) return apiError({ code: "NOT_FOUND", message: "Fasilitas tidak ditemukan." }, { status: 404 }); const { db } = await import("@/db"); await db.delete(fasilitasVokasi).where(eq(fasilitasVokasi.id, id)); revalidatePublicResource("vokasi"); return apiSuccess({ id }); } catch (error) { return routeError(error); }
}
