import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api-response";
import { getSession } from "@/server/auth/session";
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
    const extension = file.type.split("/")[1]?.toLowerCase() ?? "jpeg";
    const filename = `${randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "uploads", String(session.id));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    return apiSuccess({ url: `/uploads/${session.id}/${filename}`, contentType: file.type, size: file.size }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return apiError({ code: "INTERNAL_ERROR", message: "Gagal mengunggah gambar. Coba lagi." }, { status: 500 });
  }
}
