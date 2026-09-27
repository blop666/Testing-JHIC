import { z } from "zod";

export const aiResourceTypes = ["mitra-industri", "sarana-prasarana", "guru", "kategori-konten", "kategori-guru", "program-unggulan", "fasilitas-vokasi"] as const;

export const aiResourceTypeSchema = z.enum(aiResourceTypes);

const nullableUrl = z.union([z.url(), z.string().startsWith("/")]).nullable();

export const aiResourceDraftSchema = z.object({
  resourceType: aiResourceTypeSchema,
  name: z.string().trim().min(1).max(240),
  description: z.string().trim().max(5_000).nullable(),
  imageUrl: nullableUrl,
  websiteUrl: nullableUrl,
  position: z.string().trim().max(160).nullable(),
  bio: z.string().trim().max(5_000).nullable(),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120).nullable(),
  label: z.string().trim().max(120).nullable(),
  tefaName: z.string().trim().max(160).nullable(),
  presentationSlot: z.enum(["featured_large", "standard", "tall", "wide"]).nullable(),
  jurusanHint: z.string().trim().max(120).nullable(),
  categoryHint: z.string().trim().max(120).nullable(),
  warnings: z.array(z.string().max(300)),
  missingFields: z.array(z.string().max(300)),
  confidence: z.number().min(0).max(1),
});

export type AiResourceDraft = z.infer<typeof aiResourceDraftSchema>;

export const aiResourceChatSchema = z.object({
  kind: z.literal("chat"),
  answer: z.string().trim().min(1),
});

export const aiResourceResultSchema = z.discriminatedUnion("kind", [
  aiResourceDraftSchema.extend({ kind: z.literal("draft") }),
  aiResourceChatSchema,
]);

export type AiResourceResult = z.infer<typeof aiResourceResultSchema>;

export const aiResourceGenerateInputSchema = z.object({
  prompt: z.string().trim().min(2).max(2_000),
  resourceType: aiResourceTypeSchema,
  imageUrl: z.union([z.url(), z.string().startsWith("/")]).optional(),
  baseDraft: aiResourceDraftSchema.partial().optional(),
  mode: z.enum(["create", "edit"]).default("create"),
});

export type AiResourceGenerateInput = z.infer<typeof aiResourceGenerateInputSchema>;
