import { and, eq } from "drizzle-orm";

import { jurusan } from "@/db/schema";

export type UserRole = "super_admin" | "jurusan_admin";

export type SessionUser = {
  id: number;
  role: UserRole;
  jurusanId: number | null;
};

export type JurusanContext = { code: string; name: string; fullName: string };

export function requireSuperAdmin(user: SessionUser) {
  if (user.role !== "super_admin") throw new Error("FORBIDDEN");
}

export function scopedJurusanId(user: SessionUser, requestedJurusanId: number | null | undefined) {
  if (user.role === "jurusan_admin") {
    if (!user.jurusanId) throw new Error("FORBIDDEN_JURUSAN_SCOPE");
    return user.jurusanId;
  }
  return requestedJurusanId ?? null;
}

export function assertResourceScope(user: SessionUser, jurusanId: number | null) {
  if (user.role !== "jurusan_admin") return;
  if (!user.jurusanId) throw new Error("FORBIDDEN_JURUSAN_SCOPE");
  if (jurusanId !== user.jurusanId) throw new Error("FORBIDDEN_JURUSAN_SCOPE");
}

// Legacy alias kept for existing imports.
export const assertJurusanScope = assertResourceScope;

export function assertCategoryScope(contentJurusanId: number | null, categoryJurusanId: number | null) {
  if (categoryJurusanId != null && categoryJurusanId !== contentJurusanId) {
    throw new Error("FORBIDDEN_CATEGORY_SCOPE");
  }
}

// Resolve the jurusan filter for admin list queries. Public (no session) returns
// null + publicOnly so routes apply isPublished=true. Cross-scope query params
// for jurusan_admin are rejected (403), not silently emptied.
export function resolveListScope(user: SessionUser | null, requestedJurusanId?: number | null) {
  if (!user) return { jurusanId: null as number | null, publicOnly: true };
  if (user.role === "jurusan_admin") {
    if (!user.jurusanId) throw new Error("FORBIDDEN_JURUSAN_SCOPE");
    if (requestedJurusanId != null && requestedJurusanId !== user.jurusanId) throw new Error("FORBIDDEN_JURUSAN_SCOPE");
    return { jurusanId: user.jurusanId, publicOnly: false };
  }
  return { jurusanId: requestedJurusanId ?? null, publicOnly: false };
}

export async function jurusanContextFor(user: SessionUser): Promise<JurusanContext | null> {
  if (user.role !== "jurusan_admin" || !user.jurusanId) return null;
  const { db } = await import("@/db");
  const [row] = await db
    .select({ code: jurusan.code, name: jurusan.name, fullName: jurusan.fullName })
    .from(jurusan)
    .where(and(eq(jurusan.id, user.jurusanId), eq(jurusan.isActive, true), eq(jurusan.isPublished, true)))
    .limit(1);
  if (!row) throw new Error("FORBIDDEN_JURUSAN_SCOPE");
  return row;
}
