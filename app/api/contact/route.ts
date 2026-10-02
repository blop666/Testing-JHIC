import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api-response";
import { checkRateLimit, requestIp } from "@/server/rate-limit";

// ponytail: formsubmit.co relay dipakai untuk pengiriman email tanpa SMTP.
// Ganti dengan nodemailer/SMTP atau Resend ketika kredensial email sekolah tersedia.
const contactSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(120),
  email: z.string().trim().email("Alamat email tidak valid.").max(160),
  subject: z.string().trim().min(1).max(160),
  message: z.string().trim().min(10, "Pesan minimal 10 karakter.").max(5000),
});

const CONTACT_EMAIL = process.env.CONTACT_EMAIL?.trim() || "blop.6672@gmail.com";
const FORM_SUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(`contact:${requestIp(request)}`, 5, 10 * 60 * 1000)) {
      return apiError({ code: "RATE_LIMITED", message: "Terlalu banyak pesan. Coba lagi beberapa menit lagi." }, { status: 429 });
    }

    const payload = contactSchema.parse(await request.json());

    const response = await fetch(FORM_SUBMIT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        _subject: `[Kontak Web] ${payload.subject}`,
        _template: "table",
        _captcha: "false",
        message: `${payload.message}\n\n—\nDari: ${payload.name} <${payload.email}>`,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const relayError = await response.text().catch(() => "");
      console.error("Contact relay error:", response.status, relayError);
      // Fallback: simpan pesan lokal agar tidak hilang saat relay belum aktif.
      await persistLocal(payload);
      return apiError({ code: "DELIVERY_FAILED", message: "Pesan belum terkirim ke email. Coba lagi nanti." }, { status: 502 });
    }

    return apiSuccess({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(
        {
          code: "VALIDATION_ERROR",
          message: "Data pesan tidak valid.",
          details: error.issues.map((issue) => ({ field: issue.path.join(".") || "(umum)", message: issue.message })),
        },
        { status: 422 },
      );
    }
    console.error("Contact error:", error);
    return apiError({ code: "INTERNAL_ERROR", message: "Terjadi kesalahan. Silakan coba lagi." }, { status: 500 });
  }
}

async function persistLocal(payload: z.infer<typeof contactSchema>) {
  const dir = path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await appendFile(
    path.join(dir, "contact-messages.jsonl"),
    `${JSON.stringify({ ...payload, receivedAt: new Date().toISOString() })}\n`,
    "utf8",
  );
}
