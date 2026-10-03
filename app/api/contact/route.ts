import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api-response";
import { checkRateLimit, requestIp } from "@/server/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(120),
  email: z.string().trim().email("Alamat email tidak valid.").max(160),
  subject: z.string().trim().min(1).max(160),
  message: z.string().trim().min(10, "Pesan minimal 10 karakter.").max(5000),
});

const CONTACT_EMAIL = process.env.CONTACT_EMAIL?.trim() || "blop.6672@gmail.com";
const SMTP_HOST = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER?.trim() || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD?.trim() || "";

async function sendViaSmtp(payload: z.infer<typeof contactSchema>) {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  await transporter.sendMail({
    from: `"${payload.name}" <${SMTP_USER}>`,
    to: CONTACT_EMAIL,
    replyTo: payload.email,
    subject: `[Kontak Web] ${payload.subject}`,
    text: `${payload.message}\n\n—\nDari: ${payload.name} <${payload.email}>`,
    html: `<p><strong>${payload.name}</strong> (&lt;${payload.email}&gt;)</p><p><strong>${payload.subject}</strong></p><p>${payload.message.replace(/\n/g, "<br>")}</p>`,
  });
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

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(`contact:${requestIp(request)}`, 5, 10 * 60 * 1000)) {
      return apiError({ code: "RATE_LIMITED", message: "Terlalu banyak pesan. Coba lagi beberapa menit lagi." }, { status: 429 });
    }

    const payload = contactSchema.parse(await request.json());

    if (SMTP_USER && SMTP_PASSWORD) {
      await sendViaSmtp(payload);
      return apiSuccess({ ok: true }, { status: 200 });
    }

    // SMTP belum dikonfigurasi: simpan lokal agar pesan tidak hilang.
    await persistLocal(payload);
    return apiSuccess({ ok: true, stored: true }, { status: 200 });
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
