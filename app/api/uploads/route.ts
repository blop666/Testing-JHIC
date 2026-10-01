import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api-response";
import { getSession } from "@/server/auth/session";
import { MediaError, saveMedia, sanitizeCategory } from "@/server/media/storage";
import { checkRateLimit, requestIp } from "@/server/rate-limit";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!checkRateLimit(`upload:${session.id}:${requestIp(request)}`, 30, 60 * 60 * 1000)) return apiError({ code: "RATE_LIMITED", message: "Batas unggah tercapai. Coba lagi nanti." }, { status: 429 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > maxBytes) {
      return apiError({ code: "INVALID_FILE", message: "File harus gambar JPEG, PNG, WebP, atau AVIF maksimal 5 MB." }, { status: 422 });
    }
    const category = sanitizeCategory(form.get("category"));
    const result = await saveMedia(Buffer.from(await file.arrayBuffer()), { ownerId: session.id, category });
    return apiSuccess({ url: result.url, contentType: result.contentType, size: result.size }, { status: 201 });
  } catch (error) {
    if (error instanceof MediaError) {
      return apiError({ code: error.message, message: "File gambar tidak valid atau rusak." }, { status: 422 });
    }
    console.error("Upload error:", error);
    return apiError({ code: "INTERNAL_ERROR", message: "Gagal mengunggah gambar. Coba lagi." }, { status: 500 });
  }
}
