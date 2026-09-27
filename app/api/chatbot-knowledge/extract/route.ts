import { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api-response";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { checkRateLimit, requestIp } from "@/server/rate-limit";
import { extractDocument } from "@/server/ai/document-extractor";
import { normalizeKnowledgeText } from "@/server/ai/knowledge-chunker";
import { knowledgeExtractSchema } from "@/server/validators/knowledge";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError({ code: "UNAUTHENTICATED", message: "Silakan masuk terlebih dahulu." }, { status: 401 });
    if (!checkRateLimit(`knowledge-extract:${session.id}:${requestIp(request)}`, 30, 60 * 60 * 1000)) {
      return apiError({ code: "RATE_LIMITED", message: "Batas ekstraksi tercapai. Coba lagi nanti." }, { status: 429 });
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return apiError({ code: "INVALID_FILE", message: "File tidak ditemukan." }, { status: 422 });

    const metaInput = knowledgeExtractSchema.parse({
      sourceFileName: file.name || undefined,
      sourceUrl: (form.get("sourceUrl") as string | null) || undefined,
    });

    const extracted = await extractDocument(file);
    const normalized = normalizeKnowledgeText(extracted.text);

    return apiSuccess({
      title: metaInput.sourceFileName?.replace(/\.[^.]+$/, "") || "Dokumen",
      contentText: normalized,
      sourceUrl: metaInput.sourceUrl ?? null,
      sourceFileName: extracted.sourceFileName,
      sourceMimeType: extracted.sourceMimeType,
      sourceSizeBytes: extracted.sourceSizeBytes,
      sourceHash: extracted.sourceHash,
      pageCount: extracted.pageCount,
      truncated: extracted.truncated,
      charCount: normalized.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("SCANNED_PDF_UNSUPPORTED")) {
      return apiError({ code: "SCANNED_PDF_UNSUPPORTED", message: "PDF ini tampak hasil scan tanpa teks. Konversi dulu ke teks atau gunakan DOCX." }, { status: 422 });
    }
    if (error instanceof Error && error.message === "UNSUPPORTED_FILE_TYPE") {
      return apiError({ code: "UNSUPPORTED_FILE_TYPE", message: "Hanya file PDF text-based dan DOCX yang didukung." }, { status: 422 });
    }
    if (error instanceof Error && error.message === "FILE_TOO_LARGE") {
      return apiError({ code: "FILE_TOO_LARGE", message: "Ukuran file melebihi batas 10 MB." }, { status: 422 });
    }
    if (error instanceof Error && error.message === "EMPTY_DOCUMENT") {
      return apiError({ code: "EMPTY_DOCUMENT", message: "Tidak ada teks yang dapat diekstraksi dari dokumen." }, { status: 422 });
    }
    return routeError(error);
  }
}
