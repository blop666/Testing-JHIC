import { ZodError } from "zod";

import { apiError } from "@/lib/api-response";

export function routeError(error: unknown) {
  if (error instanceof ZodError) return apiError({ code: "VALIDATION_ERROR", message: "Data tidak valid." }, { status: 422 });
  if (error instanceof Error && error.message.startsWith("FORBIDDEN")) return apiError({ code: "FORBIDDEN", message: "Anda tidak memiliki akses." }, { status: 403 });
  if (process.env.NODE_ENV !== "production") console.error("API route error:", error);
  return apiError({ code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." }, { status: 500 });
}
