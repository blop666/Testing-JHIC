import { PrestasiGallery } from "@/components/sections/berita/prestasi-gallery";
import { getPublicPosts } from "@/server/queries/public-content";

export default async function PrestasiPage() {
  const posts = await getPublicPosts("prestasi", 50);
  const achievements = posts.map((post, index) => {
    const date = post.publishedAt ? new Date(post.publishedAt) : null;
    return { id: post.id, title: post.title, recipient: post.excerpt ?? "SMKN 1 Cibinong", date: date && !Number.isNaN(date.getTime()) ? date.toISOString() : "", level: "Prestasi", image: post.imageUrl ?? "/banner.jpeg", ratio: (index % 3 === 0 ? "portrait" : index % 3 === 1 ? "landscape" : "square") as "portrait" | "landscape" | "square", description: post.excerpt ?? "" };
  });
  return (
    <main className="min-h-screen bg-[#f4f8fa]">
      <PrestasiGallery achievements={achievements} />
    </main>
  );
}
