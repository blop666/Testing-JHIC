import { AchievementHighlight } from "@/components/sections/achievement-highlight";
import { HeroBanner } from "@/components/sections/hero-banner";
import { PrincipalGreeting } from "@/components/sections/principal-greeting";
import { SchoolQuote } from "@/components/sections/school-quote";
import { NewsShowcase } from "@/components/sections/news-showcase";
import { AnnouncementBoard } from "@/components/sections/announcement-board";
import { SchoolEvents } from "@/components/sections/school-events";
import { SchoolProfileVideo } from "@/components/sections/school-profile-video";
import { IndustryPartners } from "@/components/sections/industry-partners";
import { FeaturedPrograms } from "@/components/sections/featured-programs";
import { getPublicPosts, getPublicPartners, getPublicPrograms } from "@/server/queries/public-content";
import { generateSlugWithId } from "@/lib/slug";

function toDate(value: Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default async function HomePage() {
  const [berita, prestasi, announcements, agenda, partners, programs] = await Promise.all([
    getPublicPosts("berita", 6),
    getPublicPosts("prestasi", 6),
    getPublicPosts("pengumuman", 4),
    getPublicPosts("agenda", 10),
    getPublicPartners(),
    getPublicPrograms(),
  ]);

  const programItems = programs.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    label: item.label,
    image: item.imageUrl ?? "/hero-banner.jpeg",
  }));

  const newsItems = berita.map((post, index) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt ?? "",
    date: toDate(post.publishedAt),
    sortDate: new Date(post.createdAt).getTime(),
    category: post.category?.name ?? "Berita",
    image: post.imageUrl ?? "/banner.jpeg",
    slug: generateSlugWithId(post.title, post.id),
    isNew: index === 0,
  }));

  const achievementItems = prestasi.map((post, index) => ({
    id: post.id,
    title: post.title,
    recipient: post.excerpt ?? "SMKN 1 Cibinong",
    date: toDate(post.publishedAt),
    level: index % 4 === 0 ? "Nasional" : index % 4 === 1 ? "Provinsi" : index % 4 === 2 ? "Kabupaten" : "Sekolah",
    image: post.imageUrl ?? "/banner.jpeg",
    ratio: (index % 3 === 0 ? "portrait" : index % 3 === 1 ? "landscape" : "square") as "portrait" | "landscape" | "square",
    description: post.excerpt ?? "",
  }));

  const announcementItems = announcements.map((item) => ({
    title: item.title,
    excerpt: item.excerpt ?? "",
    date: item.publishedAt ? new Date(item.publishedAt) : null,
    image: item.imageUrl ?? "",
    label: item.category?.name ?? "Pengumuman",
    slug: generateSlugWithId(item.title, item.id),
  }));

  const partnerItems = partners.map((item) => ({
    id: item.id,
    name: item.name,
    logoUrl: item.logoUrl ?? "",
    websiteUrl: item.websiteUrl ?? "",
  }));

  const agendaItems = agenda
    .filter((item) => item.eventDate && new Date(item.eventDate).getTime() >= Date.now() - 86_400_000)
    .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime())
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt ?? "",
      date: item.eventDate ?? null,
      endDate: item.eventEndDate ?? null,
      location: item.eventLocation ?? "",
      image: item.imageUrl ?? "/banner.jpeg",
      slug: generateSlugWithId(item.title, item.id),
    }));

  return (
    <main className="min-h-screen">
      <HeroBanner />
      <PrincipalGreeting />
      <SchoolQuote />
      <AchievementHighlight achievements={achievementItems} />
      <IndustryPartners partners={partnerItems} />
      <FeaturedPrograms programs={programItems} />
      <NewsShowcase items={newsItems} />
      <AnnouncementBoard items={announcementItems} />
      <SchoolEvents items={agendaItems} />
      <SchoolProfileVideo />
    </main>
  );
}
