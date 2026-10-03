import { eq } from "drizzle-orm";

import { client, db } from "@/db";
import { chatbotKnowledge, fasilitasVokasi, guru, guruCategories, jurusan, kerjasamaIndustri, postCategories, posts, programUnggulan, saranaPrasarana, siteSettings, users } from "@/db/schema";
import { hashPassword } from "@/server/auth/session";

const guruCategorySeeds = ["General", "Staff", "SIJA", "RPL", "TKJ", "DKV", "TKP", "DPIB", "TP", "TFLM", "TKR", "TOI"];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const jurusanSeeds = [
  { code: "SIJA", name: "SIJA", fullName: "Sistem Informasi, Jaringan dan Aplikasi", category: "IT" as const, description: "Program keahlian 4 tahun yang mencetak generasi handal di bidang teknologi yang berakhlak dan berkarakter, dengan penekanan pada softskill seperti disiplin, etos kerja, dan kejujuran untuk bersaing di dunia teknologi.", kompetensi: ["Cybersecurity", "Cloud Computing", "Networking", "Web Development", "Database Management", "System Administration", "IoT (Internet of Things)", "Network Security"], fokusKeahlian: [{ title: "Jaringan", icon: "network" }, { title: "Cloud", icon: "cloud" }], prospek: "Network Administrator, System Administrator, Cybersecurity Specialist, Cloud Engineer, IT Support, Network Engineer, DevOps Engineer", durasi: "4 Tahun (Setara D1)", logoUrl: "/logo jurusan/sija.png", bgImageUrl: "/assets/jurusan/sija.webp", sortOrder: 1 },
  { code: "RPL", name: "RPL", fullName: "Rekayasa Perangkat Lunak", category: "IT" as const, description: "Program keahlian yang fokus pada perancangan, pembuatan, dan pengembangan aplikasi software dengan pembelajaran berbasis Teaching Factory yang link and match dengan industri untuk menghasilkan lulusan berkompeten dan berdaya saing global.", kompetensi: ["Algoritma dan Pemrograman", "Basis Data & SQL", "Pemrograman Berorientasi Objek", "Web Design & Development", "Aplikasi Berbasis Desktop", "Aplikasi Berbasis Mobile", "Software Testing", "Pemrograman Visual"], fokusKeahlian: [{ title: "Web", icon: "code" }, { title: "Mobile", icon: "smartphone" }], prospek: "Software Developer, Web Developer, Mobile Developer, Database Administrator, Software Tester, System Analyst, Full Stack Developer", logoUrl: "/logo jurusan/rpl.png", bgImageUrl: "/assets/jurusan/rpl.webp", sortOrder: 2 },
  { code: "DKV", name: "DKV", fullName: "Desain Komunikasi Visual", category: "IT" as const, description: "Program keahlian yang mengembangkan kreativitas dalam desain grafis, multimedia, dan komunikasi visual untuk kebutuhan cetak maupun digital dengan teknologi terkini.", kompetensi: ["Desain Grafis", "Ilustrasi Digital", "Fotografi", "Video Editing", "Animasi 2D/3D", "Multimedia", "Digital Imaging", "Typography", "UI/UX Design"], fokusKeahlian: [{ title: "Desain Grafis", icon: "palette" }, { title: "Multimedia", icon: "video" }], prospek: "Graphic Designer, Illustrator, Video Editor, Animator, Content Creator, Photographer, UI/UX Designer, Multimedia Designer", logoUrl: "/logo jurusan/logo-DKV_New-Revisi_Fix-1-e1731551656251.png", bgImageUrl: "/assets/jurusan/dkv.webp", sortOrder: 3 },
  { code: "TKJ", name: "TKJ", fullName: "Teknik Komputer dan Jaringan", category: "IT" as const, description: "Program keahlian unggulan yang menghasilkan lulusan kompeten dalam instalasi, konfigurasi, dan maintenance sistem komputer serta jaringan dengan standar nasional dan internasional, didukung sertifikasi dan prestasi tingkat nasional.", kompetensi: ["Instalasi dan Perakitan Komputer", "Sistem Operasi", "Jaringan Komputer", "Wide Area Network (WAN)", "Server Administration", "Network Security", "Database", "Troubleshooting", "Mikrotik"], fokusKeahlian: [{ title: "Jaringan", icon: "network" }, { title: "Mikrotik", icon: "router" }], prospek: "Network Technician, IT Support, Network Administrator, System Administrator, Server Administrator, Network Engineer, IT Infrastructure Specialist", logoUrl: "/logo jurusan/tkj.png", bgImageUrl: "/assets/jurusan/tkj.webp", sortOrder: 4 },
  { code: "TKP", name: "TKP", fullName: "Teknik Konstruksi dan Perumahan", category: "Teknik" as const, description: "Program keahlian yang mempelajari proses pembangunan dan pekerjaan konstruksi bangunan serta perumahan dengan keterampilan praktis dalam struktur, konstruksi kayu, dan penyelesaian bangunan.", kompetensi: ["Konstruksi Bangunan", "Pekerjaan Kayu", "Sambungan Kayu", "Struktur Bangunan", "Bekisting", "Pekerjaan Atap", "Pembuatan Pintu dan Jendela", "Finishing Bangunan", "Carpentry"], fokusKeahlian: [{ title: "Konstruksi", icon: "building" }, { title: "Carpentry", icon: "hammer" }], prospek: "Teknisi Konstruksi, Pelaksana Lapangan, Tukang Kayu Profesional, Supervisor Bangunan, Estimator Konstruksi, Drafter Konstruksi", logoUrl: "/logo jurusan/tkp baru.png", bgImageUrl: "/assets/jurusan/tkp.webp", sortOrder: 5 },
  { code: "TP", name: "TP", fullName: "Teknik Pemesinan", category: "Teknik" as const, description: "Program keahlian yang mempelajari proses pemesinan dan manufaktur modern dengan teknologi CNC untuk menghasilkan lulusan terampil dalam industri manufaktur.", kompetensi: ["Gambar Teknik", "Metrologi Industri", "Teknik Pemesinan", "CNC Operation", "Mesin Produksi", "Proses Manufaktur", "Quality Control", "Kerja Bangku", "NC/CNC Programming"], fokusKeahlian: [{ title: "CNC", icon: "settings" }, { title: "Manufaktur", icon: "factory" }], prospek: "Operator Mesin CNC, Operator Produksi, Teknisi Pemesinan, Quality Control Inspector, Teknisi Manufaktur, Machinist", logoUrl: "/logo jurusan/Logo-TP-1536x991.png", bgImageUrl: "/assets/jurusan/tp.webp", sortOrder: 6 },
  { code: "TOI", name: "TOI", fullName: "Teknik Otomasi Industri", category: "Teknik" as const, description: "Program keahlian yang mempelajari sistem otomasi, kendali, dan teknologi industri modern untuk menghasilkan teknisi yang mampu merancang, mengoperasikan, dan memelihara sistem otomasi industri.", kompetensi: ["PLC Programming", "SCADA System", "Industrial Automation", "Sensor dan Transducer", "Pneumatik & Elektropneumatik", "Motor Listrik", "Sistem Kendali Digital", "Electrical Control", "Aktuator"], fokusKeahlian: [{ title: "PLC", icon: "cpu" }, { title: "Otomasi", icon: "automation" }], prospek: "Teknisi Otomasi Industri, PLC Programmer, Teknisi Maintenance, Teknisi Electrical Control, Automation Engineer, Control System Technician", logoUrl: "/logo jurusan/toi.png", bgImageUrl: "/assets/jurusan/toi.webp", sortOrder: 7 },
  { code: "TKR", name: "TKR", fullName: "Teknik Kendaraan Ringan", category: "Teknik" as const, description: "Program keahlian yang fokus pada teknologi dan perawatan kendaraan ringan dengan pembelajaran sistem mesin, kelistrikan, chassis, dan sistem kendaraan modern.", kompetensi: ["Mesin Kendaraan", "Sistem Kelistrikan Otomotif", "Chassis & Powertrain", "Sistem Pemindah Tenaga", "Sistem Rem", "Sistem Kemudi", "Sistem Suspensi", "Sistem AC Kendaraan", "Troubleshooting", "Engine Tune-up"], fokusKeahlian: [{ title: "Otomotif", icon: "car" }, { title: "Kelistrikan", icon: "bolt" }], prospek: "Teknisi Otomotif, Mekanik Kendaraan Ringan, Service Advisor, Teknisi Kelistrikan Kendaraan, Workshop Supervisor, Automotive Engineer", logoUrl: "/logo jurusan/tkr.png", bgImageUrl: "/assets/jurusan/tkr.webp", sortOrder: 8 },
  { code: "TFLM", name: "TFLM", fullName: "Teknik Fabrikasi Logam dan Manufaktur", category: "Teknik" as const, description: "Program keahlian yang fokus pada proses fabrikasi, pengelasan, dan kegiatan manufaktur dengan teknologi modern untuk industri logam dan manufaktur.", kompetensi: ["Gambar Teknik", "Fabrikasi Logam", "Teknik Pengelasan", "Teknik Pemesinan", "Proses Manufaktur", "Metrologi", "Pengoperasian Mesin Produksi", "Pembuatan Komponen", "Welding Technology"], fokusKeahlian: [{ title: "Pengelasan", icon: "flame" }, { title: "Fabrikasi", icon: "factory" }], prospek: "Welder Profesional, Teknisi Fabrikasi, Operator Produksi, Quality Control, Teknisi Pengelasan, Supervisor Produksi, Fabrication Engineer", logoUrl: "/logo jurusan/tflm.png", bgImageUrl: "/assets/jurusan/tflm.webp", sortOrder: 9 },
  { code: "DPIB", name: "DPIB", fullName: "Desain Pemodelan dan Informasi Bangunan", category: "Teknik" as const, description: "Program keahlian yang mempelajari perencanaan, penggambaran, pemodelan, dan penyajian informasi bangunan dengan teknologi BIM (Building Information Modeling) dan software desain modern.", kompetensi: ["Gambar Teknik Bangunan", "BIM Modeling", "Gambar Konstruksi", "Konstruksi Kayu", "Desain Interior & Eksterior", "Pemodelan Bangunan", "CAD Software", "Konstruksi Beton", "Utilitas Bangunan"], fokusKeahlian: [{ title: "BIM", icon: "building" }, { title: "Desain", icon: "drafting" }], prospek: "Drafter Bangunan, BIM Modeler, Desainer Bangunan, Teknisi Konstruksi, CAD Operator, Building Designer, Estimator Proyek", logoUrl: "/logo jurusan/dpib.png", bgImageUrl: "/assets/jurusan/dpib.webp", sortOrder: 10 },
];

const chatbotKnowledgeSeeds = [
  "SMK Negeri 1 Cibinong adalah sekolah menengah kejuruan negeri di Kabupaten Bogor, Jawa Barat. Alamat: Jl. Raya Karadenan No.7, Karadenan, Kec. Cibinong, Kabupaten Bogor, Jawa Barat 16111.",
  "Nama resmi sekolah adalah SMK Negeri 1 Cibinong dengan NPSN 20231420, berstatus negeri (government/state). Luas area sekolah sekitar 24.440 m2.",
  "Kepala Sekolah SMK Negeri 1 Cibinong saat ini adalah Sugiyo, S.Pd, M.Pd dengan NIP 196604192000031002.",
  "Kontak SMK Negeri 1 Cibinong: telepon (+62) 251 8663 846, email smkn1cibinongbgr@gmail.com. Website resmi: www.smkn1cibinong.sch.id.",
  "SMK Negeri 1 Cibinong memiliki akreditasi A (Excellent/Institusi).",
  "Visi SMK Negeri 1 Cibinong: Terwujudnya SMK Negeri 1 Cibinong sebagai Sekolah Rujukan Pendidikan dan Pelatihan Kejuruan Berbasis Layanan Keunggulan, yang Berkarakter, Berintegritas, dan Berdaya Saing Global.",
  "Misi SMK Negeri 1 Cibinong: 1) Membina peserta didik taat beribadah, berbakti dan toleran. 2) Menjadi lembaga pendidikan dan pelatihan terpercaya, aman, tertib dan unggul. 3) Mampu menguasai, mengaplikasikan, mengembangkan ilmu pengetahuan dan teknologi maju. 4) Menjalin kerjasama bidang pendidikan, ketenagakerjaan tingkat nasional dan global.",
  "SMK Negeri 1 Cibinong berdiri pada 17 Juli 1998 dengan nama awal SMKN 2 Cibinong, kemudian berubah nama menjadi SMK Negeri 1 Cibinong berdasarkan SK Menteri Pendidikan Nasional No. 217/0/2000.",
  "Gedung SMK Negeri 1 Cibinong diresmikan pada 17 Februari 2000 oleh Bupati Bogor Bapak Agus Utara Efendi, berlokasi di Jalan Karadenan No. 7 Cibinong Bogor.",
  "SMK Negeri 1 Cibinong memiliki 10 konsentrasi/program keahlian: SIJA, RPL, DKV, TKJ, TKP, TP, TOI, TKR, TFLM, dan DPIB.",
  "Jurusan SIJA (Sistem Informasi, Jaringan dan Aplikasi) adalah program keahlian 4 tahun yang fokus pada cybersecurity, cloud computing, networking, web development, dan administrasi sistem.",
  "Jurusan RPL (Rekayasa Perangkat Lunak) fokus pada pengembangan aplikasi software, baik web, desktop, maupun mobile, dengan pembelajaran berbasis Teaching Factory.",
  "Jurusan DKV (Desain Komunikasi Visual) fokus pada desain grafis, ilustrasi digital, fotografi, video editing, dan animasi.",
  "Jurusan TKJ (Teknik Komputer dan Jaringan) fokus pada instalasi dan maintenance komputer, jaringan, administrasi server, dan keamanan jaringan dengan dukungan sertifikasi.",
  "Jurusan TKP (Teknik Konstruksi dan Perumahan) fokus pada pembangunan dan pekerjaan konstruksi bangunan serta perumahan.",
  "Jurusan TP (Teknik Pemesinan) fokus pada proses pemesinan dan manufaktur modern dengan teknologi CNC.",
  "Jurusan TOI (Teknik Otomasi Industri) fokus pada sistem otomasi, kendali, PLC, dan SCADA untuk industri modern.",
  "Jurusan TKR (Teknik Kendaraan Ringan) fokus pada teknologi dan perawatan kendaraan ringan seperti mesin, kelistrikan, dan chassis.",
  "Jurusan TFLM (Teknik Fabrikasi Logam dan Manufaktur) fokus pada fabrikasi logam, pengelasan, dan manufaktur.",
  "Jurusan DPIB (Desain Pemodelan dan Informasi Bangunan) fokus pada perencanaan, pemodelan, dan informasi bangunan dengan teknologi BIM.",
];

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
  if (!(await db.select({ id: saranaPrasarana.id }).from(saranaPrasarana).where(eq(saranaPrasarana.title, "Ruang Kelas Utama")).limit(1)).length) await db.insert(saranaPrasarana).values({ title: "Ruang Kelas Utama", description: "Ruang belajar dengan fasilitas modern.", imageUrl: "/assets/fasilitas/ruang-kelas-teori.webp", presentationSlot: "featured_large", sortOrder: 0, isPublished: true, createdBy: actor });
  if (!(await db.select({ id: kerjasamaIndustri.id }).from(kerjasamaIndustri).where(eq(kerjasamaIndustri.name, "Mitra Industri")).limit(1)).length) await db.insert(kerjasamaIndustri).values({ name: "Mitra Industri", logoUrl: "/banner.jpeg", description: "Mitra pembelajaran dan pengembangan kompetensi.", sortOrder: 0, isPublished: true, createdBy: actor });
  if (selectedCategory && !(await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, "selamat-datang-di-cibione-cms")).limit(1)).length) await db.insert(posts).values({ type: "berita", categoryId: selectedCategory.id, title: "Selamat Datang di CibiOne CMS", slug: "selamat-datang-di-cibione-cms", excerpt: "Informasi resmi SMKN 1 Cibinong.", body: "Konten awal CMS.", imageUrl: "/banner.jpeg", isPublished: false, publishedAt: new Date(), createdBy: actor });
  const agendaSeeds = [
    { title: "Pembukaan Tahun Ajaran Baru", slug: "pembukaan-tahun-ajaran-baru", excerpt: "Pembukaan kegiatan belajar dan pengarahan awal bagi seluruh siswa SMKN 1 Cibinong.", location: "Lapangan Utama", date: "2026-10-12T07:00:00", endDate: "2026-10-12T09:30:00" },
    { title: "Seminar Karier dan Industri", slug: "seminar-karier-industri", excerpt: "Sesi bersama mitra industri untuk mengenal kebutuhan kompetensi dan peluang karier lulusan.", location: "Aula Sekolah", date: "2026-10-20T09:00:00", endDate: "2026-10-20T12:00:00" },
    { title: "Pameran Karya Siswa", slug: "pameran-karya-siswa", excerpt: "Presentasi karya terbaik dari berbagai kompetensi keahlian untuk warga sekolah dan publik.", location: "Gedung Praktik", date: "2026-11-04T08:00:00", endDate: "2026-11-04T15:00:00" },
  ];
  for (const agendaItem of agendaSeeds) {
    await db.insert(posts).values({ type: "agenda", categoryId: selectedCategory?.id ?? null, title: agendaItem.title, slug: agendaItem.slug, excerpt: agendaItem.excerpt, body: agendaItem.excerpt, imageUrl: "/banner.jpeg", eventDate: new Date(agendaItem.date), eventEndDate: new Date(agendaItem.endDate), eventLocation: agendaItem.location, isPublished: true, publishedAt: new Date(), createdBy: actor }).onConflictDoUpdate({ target: posts.slug, set: { eventDate: new Date(agendaItem.date), eventEndDate: new Date(agendaItem.endDate), eventLocation: agendaItem.location, updatedAt: new Date() } });
  }
}

async function seedProgramUnggulan() {
  const actor = (await db.select({ id: users.id }).from(users).where(eq(users.role, "super_admin")).limit(1))[0]?.id ?? null;
  const seeds = [
    { title: "Portal Belajar Online", description: "Lingkungan belajar digital untuk mendukung pembelajaran jarak jauh sesuai kurikulum sekolah.", label: "Pembelajaran digital", imageUrl: "/hero-banner.jpeg", sortOrder: 0 },
    { title: "Academy Mikrotik", description: "Kelas Mikrotik bersertifikasi sebagai bagian dari kurikulum dan persiapan kompetensi siswa.", label: "Sertifikasi teknologi", imageUrl: "/smkn-hero-banner.webp", sortOrder: 1 },
    { title: "Sistem Informasi BK", description: "Layanan informasi bimbingan dan konseling yang lebih mudah dijangkau oleh siswa.", label: "Pendampingan siswa", imageUrl: "/hero-banner.webp", sortOrder: 2 },
    { title: "Sertifikasi LSP", description: "Layanan sertifikasi kompetensi untuk membuktikan kesiapan siswa memasuki dunia kerja.", label: "Kompetensi profesi", imageUrl: "/hero-banner.jpeg", sortOrder: 3 },
  ];
  for (const item of seeds) {
    if (!(await db.select({ id: programUnggulan.id }).from(programUnggulan).where(eq(programUnggulan.title, item.title)).limit(1)).length) {
      await db.insert(programUnggulan).values({ ...item, isPublished: true, createdBy: actor });
    }
  }
}

async function seedFasilitasVokasi() {
  const actor = (await db.select({ id: users.id }).from(users).where(eq(users.role, "super_admin")).limit(1))[0]?.id ?? null;
  const rpl = (await db.select({ id: jurusan.id }).from(jurusan).where(eq(jurusan.code, "RPL")).limit(1))[0];
  const tp = (await db.select({ id: jurusan.id }).from(jurusan).where(eq(jurusan.code, "TP")).limit(1))[0];
  const tkj = (await db.select({ id: jurusan.id }).from(jurusan).where(eq(jurusan.code, "TKJ")).limit(1))[0];
  const seeds = [
    { title: "Laboratorium Komputer Enterprise", description: "Lab komputer berstandar industri untuk praktik pemrograman dan jaringan. Dilengkapi workstation modern dan koneksi berkecepatan tinggi.", imageUrl: "/assets/fasilitas/lab-programming-rpl.webp", tefaName: "TeFa Software Development", jurusanId: rpl?.id ?? null, sortOrder: 0 },
    { title: "Bengkel Praktik Mesin", description: "Bengkel produksi riil dengan mesin CNC dan peralatan manufaktur modern untuk pembelajaran berbasis Teaching Factory.", imageUrl: "/assets/jurusan/tp.webp", tefaName: "TeFa CNC Machining", jurusanId: tp?.id ?? null, sortOrder: 1 },
    { title: "LSP Sertifikasi Kompetensi", description: "Tempat uji kompetensi berlisensi untuk sertifikasi profesi siswa, bekerja sama dengan asosiasi dan industri.", imageUrl: "/assets/jurusan/tkj.webp", tefaName: "TeFa Jaringan & Mikrotik", jurusanId: tkj?.id ?? null, sortOrder: 2 },
  ];
  for (const item of seeds) {
    await db.insert(fasilitasVokasi).values({ ...item, isPublished: true, createdBy: actor }).onConflictDoNothing();
    await db.update(fasilitasVokasi).set({ imageUrl: item.imageUrl, updatedAt: new Date() }).where(eq(fasilitasVokasi.title, item.title));
  }
}

async function seedJurusan() {
  for (const item of jurusanSeeds) {
    await db.insert(jurusan).values({ ...item, slug: slugify(item.fullName) }).onConflictDoNothing({ target: jurusan.code });
  }
}

async function seedChatbotKnowledge() {
  const actor = (await db.select({ id: users.id }).from(users).where(eq(users.role, "super_admin")).limit(1))[0]?.id ?? null;
  for (const contentText of chatbotKnowledgeSeeds) {
    const title = contentText.slice(0, 80);
    await db.insert(chatbotKnowledge).values({ title, contentText, isActive: true, isPublished: true, verifiedAt: new Date(), createdBy: actor }).onConflictDoNothing();
  }
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
  await seedJurusan();
  await seedChatbotKnowledge();
  await seedContent();
  await seedProgramUnggulan();
  await seedFasilitasVokasi();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
