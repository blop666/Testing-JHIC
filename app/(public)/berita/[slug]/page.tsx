import { notFound } from "next/navigation";

import { BeritaDetailClient } from "@/components/sections/berita/berita-detail-client";
import { incrementPostViewCount } from "@/server/repositories/posts";
import { getPublicPostBySlug, getPublicPosts } from "@/server/queries/public-content";

function formatDate(value: Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) notFound();
  void incrementPostViewCount(post.id);
  const [related, popular] = await Promise.all([getPublicPosts("berita", 12), getPublicPosts("berita", 12, false, "popular")]);
  type NewsSource = { id: number; title: string; excerpt: string | null; body?: string | null; imageUrl: string | null; publishedAt: Date | null; createdAt: Date; eventDate?: Date | null; category: { name: string; slug: string } | null; isHighlighted?: boolean; isPopularOverride?: boolean; viewCount?: number };
  const toNewsItem = (item: NewsSource, rank: number) => ({ id: item.id, title: item.title, excerpt: item.excerpt ?? "", date: formatDate(item.eventDate ?? item.publishedAt), category: item.category?.name ?? "Berita", image: item.imageUrl ?? "/banner.jpeg", popularRank: rank, isPopularOverride: item.isPopularOverride, viewCount: item.viewCount, sortDate: new Date(item.createdAt).getTime(), uploadDate: formatDate(item.createdAt), content: [[item.body ?? item.excerpt ?? ""]] });
  const postCategory = (post as NewsSource).category?.name;
  const relatedNews = related
    .filter((item) => item.id !== post.id)
    .sort((a, b) => {
      const aMatch = a.category?.name === postCategory ? 1 : 0;
      const bMatch = b.category?.name === postCategory ? 1 : 0;
      return bMatch - aMatch || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .map((item, index) => toNewsItem(item as NewsSource, index + 2));
  const popularNews = popular.filter((item) => item.id !== post.id).map((item, index) => toNewsItem(item as NewsSource, index + 1));
  return <BeritaDetailClient news={toNewsItem(post as NewsSource, 1)} relatedNews={relatedNews} popularNews={popularNews} />;
}
