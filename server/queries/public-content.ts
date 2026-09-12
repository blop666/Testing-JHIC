import { and, asc, desc, eq, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { guru, guruCategories, kerjasamaIndustri, postCategories, posts, saranaPrasarana, siteSettings } from "@/db/schema";

export async function getPublicPosts(type: "berita" | "pengumuman" | "prestasi" | "agenda", limit = 10) {
  return unstable_cache(async () => {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    excerpt: posts.excerpt,
    imageUrl: posts.imageUrl,
    publishedAt: posts.publishedAt,
    category: { name: postCategories.name, slug: postCategories.slug },
  }).from(posts).leftJoin(postCategories, eq(posts.categoryId, postCategories.id)).where(and(eq(posts.type, type), eq(posts.isPublished, true))).orderBy(desc(posts.publishedAt), desc(posts.createdAt)).limit(limit);
  }, ["public-posts", type, String(limit)], { tags: ["public-posts", `public-posts-${type}`] })();
}

export async function getPublicPostBySlug(slug: string) {
  if (!process.env.DATABASE_URL) return null;
  const { db } = await import("@/db");
  const [post] = await db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    excerpt: posts.excerpt,
    body: posts.body,
    imageUrl: posts.imageUrl,
    galleryUrls: posts.galleryUrls,
    publishedAt: posts.publishedAt,
    category: { name: postCategories.name, slug: postCategories.slug },
  }).from(posts).leftJoin(postCategories, eq(posts.categoryId, postCategories.id)).where(and(or(eq(posts.slug, slug), eq(posts.slug, slug.replace(/-\d+$/, ""))), eq(posts.type, "berita"), eq(posts.isPublished, true))).limit(1);
  return post ?? null;
}

export async function getPublicGuru() {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({
    id: guru.id,
    name: guru.name,
    position: guru.position,
    bio: guru.bio,
    imageUrl: guru.imageUrl,
    category: guruCategories.name,
  }).from(guru).leftJoin(guruCategories, eq(guru.categoryId, guruCategories.id)).where(eq(guru.isPublished, true)).orderBy(asc(guru.sortOrder), asc(guru.name));
}

export async function getPublicGuruCategories() {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({ id: guruCategories.id, name: guruCategories.name, slug: guruCategories.slug }).from(guruCategories).where(eq(guruCategories.isActive, true)).orderBy(asc(guruCategories.sortOrder), asc(guruCategories.name));
}

export async function getPublicFacilities() {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({ id: saranaPrasarana.id, title: saranaPrasarana.title, description: saranaPrasarana.description, imageUrl: saranaPrasarana.imageUrl, presentationSlot: saranaPrasarana.presentationSlot }).from(saranaPrasarana).where(eq(saranaPrasarana.isPublished, true)).orderBy(asc(saranaPrasarana.sortOrder), asc(saranaPrasarana.id));
}

export async function getPublicPartners() {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({ id: kerjasamaIndustri.id, name: kerjasamaIndustri.name, logoUrl: kerjasamaIndustri.logoUrl, description: kerjasamaIndustri.description, websiteUrl: kerjasamaIndustri.websiteUrl }).from(kerjasamaIndustri).where(eq(kerjasamaIndustri.isPublished, true)).orderBy(asc(kerjasamaIndustri.sortOrder), asc(kerjasamaIndustri.name));
}

export async function getPublicSetting(key: "school_vision_mission" | "school_accreditation") {
  if (!process.env.DATABASE_URL) return null;
  const { db } = await import("@/db");
  const [setting] = await db.select({ value: siteSettings.value, updatedAt: siteSettings.updatedAt }).from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return setting ?? null;
}
