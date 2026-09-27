import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { programUnggulan } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { assertResourceScope, requireSuperAdmin } from "@/lib/auth";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { revalidatePublicResource } from "@/server/cache";
import { idSchema, programUnggulanInputSchema } from "@/server/validators/content";

type Context = { params: Promise<{ id: string }> };
async function adminRecord(id: number) {
  const session = await getSession();
  if (!session) return { session: null, record: null };
  const { db } = await import("@/db");
  const [record] = await db.select().from(programUnggulan).where(eq(programUnggulan.id, id)).limit(1);
  if (!record) return { session, record: null };
  if (record.jurusanId == null) requireSuperAdmin(session);
  else assertResourceScope(session, record.jurusanId);
  return { session, record };
}
export async function GET(_: NextRequest, context: Context) {
  try { const { session, record } = await adminRecord(idSchema.parse((await context.params).id)); if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 }); if (!record) return apiError({ code: "NOT_FOUND", message: "Program tidak ditemukan." }, { status: 404 }); return apiSuccess(record); } catch (error) { return routeError(error); }
}
export async function PUT(request: NextRequest, context: Context) {
  try { const id = idSchema.parse((await context.params).id); const { session, record } = await adminRecord(id); if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 }); if (!record) return apiError({ code: "NOT_FOUND", message: "Program tidak ditemukan." }, { status: 404 }); const input = programUnggulanInputSchema.parse(await request.json()); const { db } = await import("@/db"); const [updated] = await db.update(programUnggulan).set({ ...input, jurusanId: record.jurusanId, updatedAt: new Date() }).where(eq(programUnggulan.id, id)).returning(); revalidatePublicResource("programs"); return apiSuccess(updated); } catch (error) { return routeError(error); }
}
export async function DELETE(_: NextRequest, context: Context) {
  try { const id = idSchema.parse((await context.params).id); const { session, record } = await adminRecord(id); if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 }); if (!record) return apiError({ code: "NOT_FOUND", message: "Program tidak ditemukan." }, { status: 404 }); const { db } = await import("@/db"); const [updated] = await db.update(programUnggulan).set({ isPublished: false, updatedAt: new Date() }).where(eq(programUnggulan.id, id)).returning(); revalidatePublicResource("programs"); return apiSuccess(updated); } catch (error) { return routeError(error); }
}
