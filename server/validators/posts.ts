import { z } from "zod";
import { sanitizeHtml } from "@/server/content/markdown";

const nullableUrl = z.union([z.url(), z.string().startsWith("/")]).nullable().optional();

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 240);
}

export const postQuerySchema = z.object({
  type: z.enum(["berita", "pengumuman", "prestasi", "agenda"]).optional(),
  category: z.string().trim().min(1).optional(),
  jurusan_id: z.coerce.number().int().positive().optional(),
  q: z.string().trim().max(200).optional(),
  status: z.enum(["draft", "published"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  highlighted: z.enum(["true", "false"]).optional(),
  sort: z.enum(["latest", "popular"]).default("latest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
});

export const postInputSchema = z.object({
  type: z.enum(["berita", "pengumuman", "prestasi", "agenda"]),
  title: z.string().trim().min(1).max(240),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(240).optional().or(z.literal("")),
  excerpt: z.string().trim().max(500).nullable().optional(),
  body: z.string().max(50_000).transform(sanitizeHtml).nullable().optional(),
  imageUrl: nullableUrl,
  galleryUrls: z.array(z.union([z.url(), z.string().startsWith("/")])).max(20).optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  jurusanId: z.number().int().positive().nullable().optional(),
  eventDate: z.coerce.date().nullable().optional(),
  eventEndDate: z.coerce.date().nullable().optional(),
  eventLocation: z.string().trim().max(240).nullable().optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.coerce.date().nullable().optional(),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().int().min(0).nullable().optional(),
  isHighlighted: z.boolean().default(false),
  highlightOrder: z.number().int().min(0).nullable().optional(),
  isPopularOverride: z.boolean().default(false),
}).superRefine((value, ctx) => {
  if (value.type === "agenda" && !value.eventDate) ctx.addIssue({ code: "custom", message: "Tanggal agenda wajib diisi.", path: ["eventDate"] });
  if (value.isPublished && !value.publishedAt) value.publishedAt = new Date();
  if (!value.isFeatured) value.featuredOrder = null;
  if (!value.isHighlighted) value.highlightOrder = null;
}).transform((value) => {
  if (!value.slug) value.slug = slugify(value.title);
  return { ...value, slug: value.slug as string };
});

export const postIdSchema = z.coerce.number().int().positive();
