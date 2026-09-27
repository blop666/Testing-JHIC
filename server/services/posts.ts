import { insertPost } from "@/server/repositories/posts";
import { assertPostCategoryScope } from "@/server/repositories/categories";
import type { SessionUser } from "@/lib/auth";
import { scopedJurusanId } from "@/lib/auth";
import { revalidatePublicResource } from "@/server/cache";

export async function createPost(user: SessionUser, input: { type: "berita" | "pengumuman" | "prestasi" | "agenda"; title: string; slug: string; excerpt?: string | null; body?: string | null; imageUrl?: string | null; galleryUrls?: string[]; categoryId?: number | null; jurusanId?: number | null; eventDate?: Date | null; isPublished: boolean; publishedAt?: Date | null; isFeatured: boolean; featuredOrder?: number | null; isHighlighted: boolean; highlightOrder?: number | null; isPopularOverride: boolean }) {
  const jurusanId = scopedJurusanId(user, input.jurusanId);
  await assertPostCategoryScope(input.categoryId, jurusanId);
  const post = await insertPost({ ...input, slug: input.slug || slugify(input.title), jurusanId, createdBy: user.id, galleryUrls: input.galleryUrls ?? [] });
  revalidatePublicResource("posts", input.type);
  return post;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-").slice(0, 240);
}
