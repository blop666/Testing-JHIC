import { z } from "zod";

const nullableUrl = z.union([z.url(), z.string().startsWith("/")]).nullable().optional();

export const knowledgeInputSchema = z.object({
  title: z.string().trim().min(1).max(240),
  contentText: z.string().trim().min(10).max(50_000),
  sourceUrl: nullableUrl,
  sourceFileName: z.string().trim().max(240).nullable().optional(),
  sourceMimeType: z.string().trim().max(120).nullable().optional(),
  sourceSizeBytes: z.number().int().min(0).max(20 * 1024 * 1024).nullable().optional(),
  sourceHash: z.string().trim().regex(/^[a-f0-9]{64}$/).nullable().optional(),
  effectiveFrom: z.coerce.date().nullable().optional(),
  effectiveUntil: z.coerce.date().nullable().optional(),
  jurusanId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
}).superRefine((value, ctx) => {
  if (value.effectiveFrom && value.effectiveUntil && value.effectiveFrom > value.effectiveUntil) {
    ctx.addIssue({ code: "custom", message: "Masa berlaku awal tidak boleh setelah masa berlaku akhir.", path: ["effectiveUntil"] });
  }
  if (value.isPublished && !value.title.trim()) {
    ctx.addIssue({ code: "custom", message: "Judul wajib diisi untuk publish.", path: ["title"] });
  }
});

export const knowledgeListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(["draft", "published", "archived", "expired"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

export const knowledgeExtractSchema = z.object({
  sourceFileName: z.string().trim().min(1).max(240).optional(),
  sourceUrl: nullableUrl,
});

export const knowledgeTestSchema = z.object({ prompt: z.string().trim().min(2).max(1_000) });
