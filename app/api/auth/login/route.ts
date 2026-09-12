import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { users } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { createSession, previewSessionCookie, sessionCookie, verifyPassword } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { checkRateLimit, requestIp } from "@/server/rate-limit";

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(1024) });

export async function POST(request: NextRequest) {
  try {
    const { email, password } = loginSchema.parse(await request.json());
    if (!process.env.DATABASE_URL) {
      if (process.env.NODE_ENV !== "development" || email !== "preview@cibione.local" || password !== "preview-cms") return apiError({ code: "INTERNAL_ERROR", message: "Layanan login belum dikonfigurasi." }, { status: 500 });
      const cookie = previewSessionCookie();
      const response = apiSuccess({ user: { id: 0, name: "Preview Administrator", email, role: "super_admin", jurusanId: null }, preview: true });
      response.headers.append("Set-Cookie", `${cookie.name}=${cookie.value}; Path=/; HttpOnly; SameSite=Lax; Expires=${cookie.options.expires.toUTCString()}`);
      return response;
    }
    if (!checkRateLimit(`login:${requestIp(request)}:${email.toLowerCase()}`, 10, 15 * 60 * 1000)) return apiError({ code: "RATE_LIMITED", message: "Terlalu banyak percobaan masuk. Coba lagi nanti." }, { status: 429 });
    const { db } = await import("@/db");
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
      return apiError({ code: "INVALID_CREDENTIALS", message: "Email atau kata sandi salah." }, { status: 401 });
    }
    if (user.role === "jurusan_admin" && !user.jurusanId) return apiError({ code: "FORBIDDEN", message: "Akun tidak memiliki scope jurusan." }, { status: 403 });
    const session = await createSession(user);
    const response = apiSuccess({ user: { id: user.id, name: user.name, email: user.email, role: user.role, jurusanId: user.jurusanId }, expiresAt: session.expiresAt.toISOString() }, { status: 201 });
    const cookie = sessionCookie(session.token, session.expiresAt);
    response.headers.append("Set-Cookie", `${cookie.name}=${cookie.value}; Path=/; HttpOnly; SameSite=Lax; Expires=${cookie.options.expires.toUTCString()}${cookie.options.secure ? "; Secure" : ""}`);
    return response;
  } catch (error) {
    if (error instanceof Error && /(connect|tenant|database|postgres|ENOTFOUND)/i.test(error.message)) {
      return apiError({ code: "DATABASE_UNAVAILABLE", message: "Database sedang tidak dapat dihubungi. Periksa konfigurasi DATABASE_URL." }, { status: 503 });
    }
    return routeError(error);
  }
}
