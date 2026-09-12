import { eq } from "drizzle-orm";

import { client, db } from "@/db";
import { guru, guruCategories, kerjasamaIndustri, postCategories, posts, saranaPrasarana, siteSettings, users } from "@/db/schema";
import { hashPassword } from "@/server/auth/session";

const guruCategorySeeds = ["General", "Staff", "SIJA", "RPL", "TKJ", "DKV", "TKP", "DPIB", "TP", "TFLM", "TKR", "TOI"];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function seedSettings() {
  const settings = [
    {
      key: "school_vision_mission",
      value: {
        backgroundImageUrl: "/banner.jpeg",
        vision: { title: "Visi", subtitle: "Sekolah", description: "", points: [] },
        mission: { title: "Misi", subtitle: "Sekolah", description: "", points: [] },
      },
    },
    { key: "school_accreditation", value: { heading: "Akreditasi", description: "", cards: [] } },
  ];
  for (const setting of settings) {
    await db.insert(siteSettings).values(setting).onConflictDoNothing({ target: siteSettings.key });
  }
}

async function seedGuruCategories() {
  for (const [sortOrder, name] of guruCategorySeeds.entries()) {
    await db.insert(guruCategories).values({ name, slug: slugify(name), sortOrder }).onConflictDoNothing({ target: guruCategories.slug });
  }
}

async function seedContent() {
  const [category] = await db.insert(postCategories).values({ name: "Sekolah", slug: "sekolah", description: "Konten sekolah", isActive: true }).onConflictDoNothing({ target: postCategories.slug }).returning({ id: postCategories.id });
  const [selectedCategory] = category ? [category] : await db.select({ id: postCategories.id }).from(postCategories).where(eq(postCategories.slug, "sekolah")).limit(1);
  const [general] = await db.select({ id: guruCategories.id }).from(guruCategories).where(eq(guruCategories.slug, "general")).limit(1);
  const actor = (await db.select({ id: users.id }).from(users).where(eq(users.role, "super_admin")).limit(1))[0]?.id ?? null;
  if (!(await db.select({ id: guru.id }).from(guru).where(eq(guru.name, "Kepala Sekolah")).limit(1)).length) await db.insert(guru).values({ name: "Kepala Sekolah", position: "Kepala Sekolah", bio: "Pimpinan SMKN 1 Cibinong.", imageUrl: "/banner.jpeg", categoryId: general?.id ?? null, sortOrder: 0, isPublished: true, createdBy: actor });
  if (!(await db.select({ id: saranaPrasarana.id }).from(saranaPrasarana).where(eq(saranaPrasarana.title, "Ruang Kelas Utama")).limit(1)).length) await db.insert(saranaPrasarana).values({ title: "Ruang Kelas Utama", description: "Ruang belajar dengan fasilitas modern.", imageUrl: "/banner.jpeg", presentationSlot: "featured_large", sortOrder: 0, isPublished: true, createdBy: actor });
  if (!(await db.select({ id: kerjasamaIndustri.id }).from(kerjasamaIndustri).where(eq(kerjasamaIndustri.name, "Mitra Industri")).limit(1)).length) await db.insert(kerjasamaIndustri).values({ name: "Mitra Industri", logoUrl: "/banner.jpeg", description: "Mitra pembelajaran dan pengembangan kompetensi.", sortOrder: 0, isPublished: true, createdBy: actor });
  if (selectedCategory && !(await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, "selamat-datang-di-cibione-cms")).limit(1)).length) await db.insert(posts).values({ type: "berita", categoryId: selectedCategory.id, title: "Selamat Datang di CibiOne CMS", slug: "selamat-datang-di-cibione-cms", excerpt: "Informasi resmi SMKN 1 Cibinong.", body: "Konten awal CMS.", imageUrl: "/banner.jpeg", isPublished: true, publishedAt: new Date(), createdBy: actor });
}

async function seedInitialAdmin() {
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!email || !password) return;
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!existing) await db.insert(users).values({ name: "Administrator", email, passwordHash: await hashPassword(password), role: "super_admin" });
}

async function main() {
  await seedSettings();
  await seedGuruCategories();
  await seedInitialAdmin();
  await seedContent();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
