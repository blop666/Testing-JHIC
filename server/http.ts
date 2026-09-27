import { ZodError } from "zod";

import { apiError } from "@/lib/api-response";

export function routeError(error: unknown) {
  if (error instanceof ZodError) return apiError({ code: "VALIDATION_ERROR", message: "Data tidak valid." }, { status: 422 });
  if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") return apiError({ code: "VALIDATION_ERROR", message: "Kategori tidak ditemukan." }, { status: 422 });
  if (error instanceof Error && error.message === "FORBIDDEN_CATEGORY_SCOPE") return apiError({ code: "FORBIDDEN", message: "Kategori tidak dapat digunakan untuk jurusan ini." }, { status: 403 });
  if (error instanceof Error && error.message.startsWith("FORBIDDEN")) return apiError({ code: "FORBIDDEN", message: "Anda tidak memiliki akses." }, { status: 403 });
  if (error instanceof Error && error.message.startsWith("AI_")) return apiError({ code: "AI_UNAVAILABLE", message: "Layanan AI gagal memproses permintaan. Coba lagi nanti." }, { status: 503 });
  if (process.env.NODE_ENV !== "production") console.error("API route error:", error);
  return apiError({ code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." }, { status: 500 });
}
