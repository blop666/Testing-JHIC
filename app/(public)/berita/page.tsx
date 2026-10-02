import { BeritaSection } from "@/components/sections/berita/berita-section";
import { getPublicPostCategories, getPublicPosts } from "@/server/queries/public-content";

function toDate(value: Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function toNewsItem(post: { id: number; title: string; slug: string; excerpt: string | null; imageUrl: string | null; publishedAt: Date | null; createdAt: Date; eventDate?: Date | null; category: { name: string; slug: string } | null; isHighlighted?: boolean; isPopularOverride?: boolean; viewCount?: number }, rank: number, categoryOverride?: string) {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt ?? "",
    date: toDate(post.eventDate ?? post.publishedAt),
    category: categoryOverride ?? post.category?.name ?? "Berita",
    image: post.imageUrl ?? "/banner.webp",
    popularRank: rank,
    isHighlighted: post.isHighlighted,
    isPopularOverride: post.isPopularOverride,
    viewCount: post.viewCount,
    sortDate: new Date(post.eventDate ?? post.publishedAt ?? 0).getTime(),
    uploadDate: toDate(post.createdAt),
    content: [[post.excerpt ?? ""]],
  };
}

export default async function BeritaPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const [posts, achievements, announcements, agenda, postCategories] = await Promise.all([
    getPublicPosts("berita", 50),
    getPublicPosts("prestasi", 50),
    getPublicPosts("pengumuman", 50),
    getPublicPosts("agenda", 50),
    getPublicPostCategories(),
  ]);

  const beritaItems = posts.map((post, index) => toNewsItem(post, index + 1));
  const pengumumanItems = announcements.map((post, index) => toNewsItem(post, beritaItems.length + index + 1, "Pengumuman"));
  const agendaItems = agenda.map((post, index) => toNewsItem(post, beritaItems.length + pengumumanItems.length + index + 1, "Agenda"));
  const newsItems = [...beritaItems, ...pengumumanItems, ...agendaItems].sort((a, b) => (b.sortDate ?? 0) - (a.sortDate ?? 0));
  const categoryCounts = new Map(newsItems.map((item) => [item.category, (newsItems.filter((news) => news.category === item.category).length)]));
  const categoryOptions = postCategories.map((category) => ({ name: category.name, total: categoryCounts.get(category.name) ?? 0 }));
  if (!categoryOptions.some((category) => category.name === "Pengumuman") && pengumumanItems.length) categoryOptions.push({ name: "Pengumuman", total: pengumumanItems.length });
  if (!categoryOptions.some((category) => category.name === "Agenda") && agendaItems.length) categoryOptions.push({ name: "Agenda", total: agendaItems.length });

  const achievementItems = achievements.map((post, index) => ({
    id: post.id,
    title: post.title,
    recipient: post.excerpt ?? "SMKN 1 Cibinong",
    date: toDate(post.publishedAt),
    level: "Prestasi",
    image: post.imageUrl ?? "/banner.webp",
    ratio: (index % 3 === 0 ? "portrait" : index % 3 === 1 ? "landscape" : "square") as "portrait" | "landscape" | "square",
    description: post.excerpt ?? "",
  }));

  return (
    <main className="min-h-screen bg-[#f4f8fa]">
      <BeritaSection items={newsItems} achievements={achievementItems} categoryOptions={categoryOptions} initialCategory={kategori} />
    </main>
  );
}
