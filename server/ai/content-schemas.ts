import { z } from "zod";

export const aiContentTypes = ["berita", "pengumuman", "prestasi", "agenda"] as const;

export const aiContentTypeSchema = z.enum(aiContentTypes);

export const aiDraftSchema = z.object({
  contentType: aiContentTypeSchema,
  title: z.string().trim().min(1).max(240),
  excerpt: z.string().trim().max(500),
  body: z.string().max(50_000),
  eventDate: z.string().nullable(),
  eventEndDate: z.string().nullable(),
  eventLocation: z.string().trim().max(240).nullable(),
  categoryHint: z.string().trim().max(120).nullable(),
  jurusanHint: z.string().trim().max(120).nullable(),
  imageDescription: z.string().trim().max(500).nullable(),
  needsImage: z.boolean(),
  sourceUrls: z.array(z.string().url()),
  warnings: z.array(z.string().max(300)),
  missingFields: z.array(z.string().max(300)),
  confidence: z.number().min(0).max(1),
});

export type AiDraft = z.infer<typeof aiDraftSchema>;

export const aiContentChatSchema = z.object({
  kind: z.literal("chat"),
  answer: z.string().trim().min(1),
});

export const aiContentResultSchema = z.discriminatedUnion("kind", [
  aiDraftSchema.extend({ kind: z.literal("draft") }),
  aiContentChatSchema,
]);

export type AiContentResult = z.infer<typeof aiContentResultSchema>;

export const aiGenerateInputSchema = z.object({
  prompt: z.string().trim().min(2).max(2_000),
  contentType: aiContentTypeSchema.optional(),
  sourceUrls: z.array(z.string().url()).max(3).optional(),
  imageUrl: z.union([z.url(), z.string().startsWith("/")]).optional(),
  baseDraft: aiDraftSchema.partial().optional(),
  mode: z.enum(["create", "edit"]).default("create"),
});

export type AiGenerateInput = z.infer<typeof aiGenerateInputSchema>;
