import { z } from "zod";

export const chatStatusSchema = z.enum(["answered", "unknown", "refused", "email"]);

export const chatSourceSchema = z.object({
  title: z.string(),
  url: z.string().refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), { message: "Invalid URL" }),
});

export const chatResponseSchema = z.object({
  answer: z.string().catch("Maaf, saya belum dapat memproses pertanyaan ini. Silakan hubungi pihak sekolah melalui halaman Kontak."),
  status: chatStatusSchema.catch("unknown"),
  sources: z.array(chatSourceSchema).catch([]),
  confidence: z.coerce.number().min(0).max(1).catch(0.5),
  emailHandoff: z
    .object({
      userEmail: z.string().email().optional(),
      userName: z.string().optional(),
      subject: z.string().optional(),
      message: z.string().optional(),
    })
    .nullish()
    .catch(undefined),
});
