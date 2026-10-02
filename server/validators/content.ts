import { z } from "zod";

export const listQuerySchema = z.object({
  jurusan_id: z.coerce.number().int().positive().optional(),
  category: z.coerce.number().int().positive().optional(),
  q: z.string().trim().max(200).optional(),
  status: z.enum(["draft", "published"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

const nullableUrl = z.union([z.url(), z.string().startsWith("/")]).nullable().optional();

export const guruInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  position: z.string().trim().max(160).nullable().optional(),
  bio: z.string().trim().max(5_000).nullable().optional(),
  imageUrl: nullableUrl,
  categoryId: z.number().int().positive().nullable().optional(),
  jurusanId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});

export const facilityInputSchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(5_000).nullable().optional(),
  imageUrl: nullableUrl,
  presentationSlot: z.enum(["featured_large", "standard", "tall", "wide"]).default("standard"),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});

export const programUnggulanInputSchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(5_000),
  label: z.string().trim().min(1).max(120),
  imageUrl: nullableUrl,
  jurusanId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});

export const fasilitasVokasiInputSchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(5_000).nullable().optional(),
  imageUrl: nullableUrl,
  jurusanId: z.number().int().positive().nullable().optional(),
  tefaName: z.string().trim().max(160).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});

export const jurusanInputSchema = z.object({
  code: z.string().trim().min(1).max(20),
  name: z.string().trim().min(1).max(120),
  fullName: z.string().trim().min(1).max(240),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(240).optional().or(z.literal("")),
  category: z.enum(["IT", "Teknik"]),
  description: z.string().trim().min(1).max(5_000),
  kompetensi: z.array(z.string().trim().min(1).max(200)).max(30),
  fokusKeahlian: z.array(z.object({ title: z.string().trim().min(1).max(120), icon: z.string().trim().max(60) })).max(20),
  prospek: z.string().trim().min(1).max(2_000),
  durasi: z.string().trim().min(1).max(60).optional(),
  logoUrl: nullableUrl,
  bgImageUrl: nullableUrl,
  websiteUrl: nullableUrl,
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});

export const partnerInputSchema = z.object({
  name: z.string().trim().min(1).max(240),
  logoUrl: nullableUrl,
  description: z.string().trim().max(5_000).nullable().optional(),
  websiteUrl: nullableUrl,
  jurusanId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  jurusanId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const idSchema = z.coerce.number().int().positive();
