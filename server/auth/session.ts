import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";

import { and, eq, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";

import { jurusan, sessions, users } from "@/db/schema";
import type { SessionUser } from "@/lib/auth";

export const SESSION_COOKIE = "cibione_session";
const UI_PREVIEW_TOKEN = "local-ui-preview";
const SESSION_DAYS = 7;

export type AuthSession = SessionUser & { sessionId: number; expiresAt: Date; name: string; email: string; jurusanName: string | null };

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, stored: string) {
  return bcrypt.compare(password, stored);
}

export async function createSession(user: SessionUser) {
  const { db } = await import("@/db");
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const [session] = await db.insert(sessions).values({ userId: user.id, tokenHash: tokenHash(token), expiresAt }).returning({ id: sessions.id });
  return { id: session!.id, token, expiresAt };
}

export async function getSession(): Promise<AuthSession | null> {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "development" && (await cookies()).get(SESSION_COOKIE)?.value === UI_PREVIEW_TOKEN) {
      return { id: 0, sessionId: 0, role: "super_admin", jurusanId: null, name: "Preview Administrator", email: "preview@cibione.local", jurusanName: null, expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000) };
    }
    return null;
  }
  const { db } = await import("@/db");
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db.select({
    sessionId: sessions.id,
    expiresAt: sessions.expiresAt,
    id: users.id,
    role: users.role,
    jurusanId: users.jurusanId,
    name: users.name,
    email: users.email,
    jurusanName: jurusan.name,
  }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).leftJoin(jurusan, and(eq(users.jurusanId, jurusan.id), eq(jurusan.isActive, true))).where(and(
    eq(sessions.tokenHash, tokenHash(token)),
    isNull(sessions.revokedAt),
    gt(sessions.expiresAt, new Date()),
    eq(users.isActive, true),
  )).limit(1);
  if (!row) return null;
  if (row.role === "jurusan_admin" && !row.jurusanId) return null;
  return row;
}

export function previewSessionCookie() {
  return sessionCookie(UI_PREVIEW_TOKEN, new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000));
}

export async function revokeSession() {
  if (!process.env.DATABASE_URL) return;
  const { db } = await import("@/db");
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.tokenHash, tokenHash(token)));
}

export function sessionCookie(token: string, expiresAt: Date) {
  return { name: SESSION_COOKIE, value: token, options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", expires: expiresAt } };
}

export function clearedSessionCookie() {
  return { name: SESSION_COOKIE, value: "", options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", expires: new Date(0) } };
}
