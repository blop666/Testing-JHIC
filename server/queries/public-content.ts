import { and, asc, desc, eq, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { fasilitasVokasi, guru, guruCategories, jurusan, kerjasamaIndustri, postCategories, posts, programUnggulan, saranaPrasarana, siteSettings } from "@/db/schema";

export async function getPublicPosts(type: "berita" | "pengumuman" | "prestasi" | "agenda", limit = 10) {
  return unstable_cache(async () => {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    excerpt: posts.excerpt,
    body: posts.body,
    imageUrl: posts.imageUrl,
    publishedAt: posts.publishedAt,
    eventDate: posts.eventDate,
    eventEndDate: posts.eventEndDate,
    eventLocation: posts.eventLocation,
    isHighlighted: posts.isHighlighted,
    isPopularOverride: posts.isPopularOverride,
    viewCount: posts.viewCount,
    category: { name: postCategories.name, slug: postCategories.slug },
    jurusan: { id: jurusan.id, name: jurusan.name, code: jurusan.code, slug: jurusan.slug },
  }).from(posts).leftJoin(postCategories, eq(posts.categoryId, postCategories.id)).leftJoin(jurusan, eq(posts.jurusanId, jurusan.id)).where(and(eq(posts.type, type), eq(posts.isPublished, true))).orderBy(desc(posts.publishedAt), desc(posts.createdAt)).limit(limit);
  }, ["public-posts", type, String(limit)], { tags: ["public-posts", `public-posts-${type}`] })();
}

export async function getPublicPostBySlug(slug: string) {
  if (!process.env.DATABASE_URL) return null;
  return unstable_cache(async () => {
    const { db } = await import("@/db");
    const normalized = slug.replace(/-\d+$/, "");
    const idMatch = slug.match(/(\d+)$/);
    const id = idMatch ? Number(idMatch[1]) : null;
    const conditions = [eq(posts.slug, slug), eq(posts.slug, normalized)];
    if (id !== null && Number.isInteger(id) && id > 0) conditions.push(eq(posts.id, id));
    const [post] = await db.select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      body: posts.body,
      imageUrl: posts.imageUrl,
      galleryUrls: posts.galleryUrls,
      publishedAt: posts.publishedAt,
      eventDate: posts.eventDate,
      eventEndDate: posts.eventEndDate,
      eventLocation: posts.eventLocation,
      category: { name: postCategories.name, slug: postCategories.slug },
    }).from(posts).leftJoin(postCategories, eq(posts.categoryId, postCategories.id)).where(and(or(...conditions), eq(posts.isPublished, true))).limit(1);
    return post ?? null;
  }, [`public-post-${slug}`], { tags: ["public-posts", "public-post-detail"] })();
}

export async function getPublicJurusan() {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({ id: jurusan.id, name: jurusan.name, code: jurusan.code, slug: jurusan.slug }).from(jurusan).where(and(eq(jurusan.isActive, true), eq(jurusan.isPublished, true))).orderBy(asc(jurusan.sortOrder), asc(jurusan.name));
}

export async function getPublicPostCategories() {
  return unstable_cache(async () => {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({ id: postCategories.id, name: postCategories.name, slug: postCategories.slug }).from(postCategories).where(eq(postCategories.isActive, true)).orderBy(asc(postCategories.name));
  }, ["public-post-categories"], { tags: ["public-post-categories", "public-posts"] })();
}

export async function getPublicGuru() {
  return unstable_cache(async () => {
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
  }, ["public-guru"], { tags: ["public-guru"] })();
}

export async function getPublicGuruCategories() {
  return unstable_cache(async () => {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({ id: guruCategories.id, name: guruCategories.name, slug: guruCategories.slug }).from(guruCategories).where(eq(guruCategories.isActive, true)).orderBy(asc(guruCategories.sortOrder), asc(guruCategories.name));
  }, ["public-guru-categories"], { tags: ["public-guru", "public-guru-categories"] })();
}

export async function getPublicFacilities() {
  return unstable_cache(async () => {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({ id: saranaPrasarana.id, title: saranaPrasarana.title, description: saranaPrasarana.description, imageUrl: saranaPrasarana.imageUrl, presentationSlot: saranaPrasarana.presentationSlot }).from(saranaPrasarana).where(eq(saranaPrasarana.isPublished, true)).orderBy(asc(saranaPrasarana.sortOrder), asc(saranaPrasarana.id));
  }, ["public-facilities"], { tags: ["public-facilities"] })();
}

export async function getPublicPrograms() {
  return unstable_cache(async () => {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({ id: programUnggulan.id, title: programUnggulan.title, description: programUnggulan.description, label: programUnggulan.label, imageUrl: programUnggulan.imageUrl }).from(programUnggulan).where(eq(programUnggulan.isPublished, true)).orderBy(asc(programUnggulan.sortOrder), asc(programUnggulan.id));
  }, ["public-programs"], { tags: ["public-programs"] })();
}

export async function getPublicFasilitasVokasi() {
  return unstable_cache(async () => {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({ id: fasilitasVokasi.id, title: fasilitasVokasi.title, description: fasilitasVokasi.description, imageUrl: fasilitasVokasi.imageUrl, tefaName: fasilitasVokasi.tefaName, jurusan: { id: jurusan.id, name: jurusan.name, code: jurusan.code } }).from(fasilitasVokasi).leftJoin(jurusan, eq(fasilitasVokasi.jurusanId, jurusan.id)).where(eq(fasilitasVokasi.isPublished, true)).orderBy(asc(fasilitasVokasi.sortOrder), asc(fasilitasVokasi.id));
  }, ["public-vokasi"], { tags: ["public-vokasi"] })();
}

export async function getPublicPartners() {
  return unstable_cache(async () => {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  return db.select({ id: kerjasamaIndustri.id, name: kerjasamaIndustri.name, logoUrl: kerjasamaIndustri.logoUrl, description: kerjasamaIndustri.description, websiteUrl: kerjasamaIndustri.websiteUrl }).from(kerjasamaIndustri).where(eq(kerjasamaIndustri.isPublished, true)).orderBy(asc(kerjasamaIndustri.sortOrder), asc(kerjasamaIndustri.name));
  }, ["public-partners"], { tags: ["public-partners"] })();
}

export async function getPublicSetting(key: "school_vision_mission" | "school_accreditation") {
  return unstable_cache(async () => {
  if (!process.env.DATABASE_URL) return null;
  const { db } = await import("@/db");
  const [setting] = await db.select({ value: siteSettings.value, updatedAt: siteSettings.updatedAt }).from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return setting ?? null;
  }, [`public-setting-${key}`], { tags: [`public-setting-${key}`] })();
}
