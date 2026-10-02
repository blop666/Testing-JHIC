import { SejarahSection } from "@/components/sections/profil-sekolah/sejarah-section";
import { ProfileSections } from "@/components/sections/profil-sekolah/profile-sections";
import { getPublicFacilities, getPublicGuru, getPublicGuruCategories, getPublicPartners } from "@/server/queries/public-content";

export default async function ProfilSekolahPage() {
  const [facilitiesResult, guruResult, guruCategoriesResult, partnersResult] = await Promise.allSettled([getPublicFacilities(), getPublicGuru(), getPublicGuruCategories(), getPublicPartners()]);
  if (process.env.NODE_ENV !== "production") {
    for (const result of [facilitiesResult, guruResult, guruCategoriesResult, partnersResult]) {
      if (result.status === "rejected") console.error("Profil data query failed:", result.reason);
    }
  }
  const facilities = facilitiesResult.status === "fulfilled" ? facilitiesResult.value : [];
  const guru = guruResult.status === "fulfilled" ? guruResult.value : [];
  const guruCategories = guruCategoriesResult.status === "fulfilled" ? guruCategoriesResult.value : [];
  const partners = partnersResult.status === "fulfilled" ? partnersResult.value : [];
  const guruItems = guru.map((item) => ({ id: item.id, name: item.name, position: item.position ?? "", bio: item.bio ?? "", image: item.imageUrl ?? "/banner.webp", category: item.category ?? "General" }));
  return (
    <main className="min-h-screen bg-gray-50">
      <SejarahSection />
      <ProfileSections facilities={facilities} guru={guruItems} guruCategories={guruCategories} partners={partners} />
    </main>
  );
}
