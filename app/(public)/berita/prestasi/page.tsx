import { PrestasiGallery } from "@/components/sections/berita/prestasi-gallery";
import { getPublicJurusan, getPublicPosts } from "@/server/queries/public-content";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default async function PrestasiPage() {
  const [posts, jurusan] = await Promise.all([getPublicPosts("prestasi", 50), getPublicJurusan()]);
  const achievements = posts.map((post, index) => {
    const description = post.excerpt ?? "Prestasi siswa SMKN 1 Cibinong.";
    return {
      id: post.id,
      title: post.title,
      recipient: post.jurusan?.name ?? "SMKN 1 Cibinong",
      date: formatDate(post.publishedAt),
      level: "Prestasi",
      image: post.imageUrl ?? "/banner.jpeg",
      ratio: (index % 3 === 0 ? "portrait" : index % 3 === 1 ? "landscape" : "square") as "portrait" | "landscape" | "square",
      description,
      body: post.body,
      jurusanCode: post.jurusan?.code,
      jurusanName: post.jurusan?.name,
      viewCount: post.viewCount,
      isHighlighted: post.isHighlighted,
      isPopularOverride: post.isPopularOverride,
    };
  });
  return (
    <main className="min-h-screen bg-[#f4f8fa]">
      <PrestasiGallery achievements={achievements} jurusan={jurusan} />
    </main>
  );
}
