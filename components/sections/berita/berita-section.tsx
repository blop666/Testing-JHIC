"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays } from "lucide-react";

import {
  CutoutCard,
  CutoutCardContent,
  CutoutCardImage,
  CutoutCardMedia,
  CutoutCardOverlay,
  cutoutCardSurfaceClassName,
} from "@/components/ui/cutout-card";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/linear-dialog";
import { cn } from "@/lib/utils";

import { BeritaList } from "./berita-list";
import { HighlightPrestasi } from "./highlight-prestasi";
import type { NewsItem } from "./berita-types";
import { NewsDetailModal } from "./news-detail-modal";

type NewsFilter = "latest" | "popular";

const FALLBACK_NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    title: "Siswa SMKN 1 Cibinong Raih Prestasi di Tingkat Nasional",
    excerpt:
      "Karya inovatif siswa kembali membawa nama sekolah ke panggung nasional melalui kompetisi teknologi dan kreativitas.",
    date: "18 Agustus 2026",
    category: "Prestasi Siswa",
    image: "/banner.jpeg",
    popularRank: 2,
    content: [
      [
        "Prestasi ini lahir dari proses panjang yang dijalani siswa bersama guru pembimbing. Mereka mengembangkan gagasan, menguji prototipe, dan menyempurnakan presentasi sebelum tampil di tingkat nasional.",
        "Capaian tersebut menjadi bukti bahwa pembelajaran berbasis proyek mampu mendorong siswa untuk memecahkan persoalan secara kreatif sekaligus bekerja dalam tim.",
      ],
      [
        "Sekolah akan terus memperluas ruang kolaborasi agar lebih banyak siswa dapat mengikuti kompetisi sesuai bidang keahliannya. Pendampingan juga disiapkan sejak tahap perencanaan hingga evaluasi.",
        "Pengalaman kompetisi diharapkan tidak berhenti pada penghargaan, tetapi menjadi bekal kepercayaan diri dan kesiapan siswa menghadapi dunia profesional.",
      ],
    ],
  },
  {
    id: 2,
    title: "Kolaborasi Industri Buka Peluang Belajar Lebih Luas",
    excerpt:
      "Program pembelajaran bersama mitra industri memperkuat pengalaman praktik dan kesiapan kerja peserta didik.",
    date: "15 Agustus 2026",
    category: "Sekolah",
    image: "/banner.jpeg",
    popularRank: 1,
    content: [
      [
        "Kolaborasi bersama mitra industri menghadirkan pengalaman belajar yang lebih dekat dengan kebutuhan lapangan. Siswa mendapat kesempatan mengenal alur kerja, standar keselamatan, dan teknologi yang digunakan saat ini.",
        "Program ini melibatkan sesi praktisi mengajar, kunjungan industri, serta penyelarasan materi pembelajaran bersama guru produktif.",
      ],
      [
        "Melalui kerja sama yang berkelanjutan, sekolah menargetkan peningkatan kompetensi teknis sekaligus kemampuan komunikasi dan adaptasi peserta didik.",
        "Evaluasi program akan dilakukan secara berkala agar kegiatan berikutnya tetap relevan bagi siswa, sekolah, dan mitra industri.",
      ],
    ],
  },
  {
    id: 3,
    title: "Semangat Baru Menyambut Tahun Ajaran 2026/2027",
    excerpt:
      "Rangkaian kegiatan awal tahun membantu siswa mengenal budaya sekolah yang aman, kreatif, dan kolaboratif.",
    date: "12 Agustus 2026",
    category: "Kesiswaan",
    image: "/banner.jpeg",
    popularRank: 3,
    content: [
      [
        "Tahun ajaran baru dibuka dengan rangkaian kegiatan pengenalan lingkungan sekolah yang aman dan ramah. Siswa baru diajak memahami budaya belajar, fasilitas, serta layanan pendampingan yang tersedia.",
        "Kegiatan disusun secara kolaboratif oleh guru dan pengurus siswa dengan menempatkan interaksi positif sebagai fokus utama.",
      ],
      [
        "Setelah masa pengenalan selesai, siswa akan mengikuti agenda penguatan karakter dan pemetaan minat agar proses adaptasi berjalan lebih terarah.",
        "Sekolah berharap setiap siswa dapat bertumbuh dalam lingkungan yang menghargai kreativitas, kedisiplinan, dan kerja sama.",
      ],
    ],
  },
  {
    id: 4,
    title: "Pembukaan MPLS Ramah Dorong Adaptasi Siswa Baru",
    excerpt:
      "Kegiatan pengenalan lingkungan sekolah disusun lebih interaktif agar siswa baru nyaman mengenal budaya belajar.",
    date: "10 Agustus 2026",
    category: "Berita Sekolah",
    image: "/banner.jpeg",
    popularRank: 6,
    content: [
      [
        "MPLS tahun ini menekankan suasana ramah dan kolaboratif. Siswa baru diajak mengenal ruang belajar, layanan sekolah, serta kegiatan ekstrakurikuler melalui sesi singkat yang mudah diikuti.",
        "Panitia juga menghadirkan mentor dari kakak kelas untuk membantu proses adaptasi berjalan lebih dekat dan menyenangkan.",
      ],
      [
        "Sekolah berharap kegiatan awal ini menjadi fondasi yang baik bagi siswa untuk membangun relasi positif dan motivasi belajar sejak hari pertama.",
      ],
    ],
  },
  {
    id: 5,
    title: "Workshop Guru Perkuat Pembelajaran Berbasis Proyek",
    excerpt:
      "Guru produktif dan normatif mengikuti lokakarya untuk menyusun proyek lintas mata pelajaran yang relevan.",
    date: "8 Agustus 2026",
    category: "Sekolah",
    image: "/banner.jpeg",
    popularRank: 5,
    content: [
      [
        "Workshop difokuskan pada penyusunan aktivitas belajar yang menghubungkan kompetensi akademik dengan tantangan nyata di sekitar siswa.",
        "Setiap kelompok guru merancang rubrik, alur asesmen, dan rencana publikasi karya agar proses belajar lebih terukur.",
      ],
      [
        "Hasil lokakarya akan diujicobakan secara bertahap pada beberapa kelas sebelum diterapkan lebih luas pada semester berjalan.",
      ],
    ],
  },
  {
    id: 6,
    title: "Tim Ekstrakurikuler Siapkan Agenda Prestasi Semester Baru",
    excerpt:
      "Pembina dan pengurus ekstrakurikuler menyusun kalender kegiatan untuk memperluas ruang minat siswa.",
    date: "5 Agustus 2026",
    category: "Kesiswaan",
    image: "/banner.jpeg",
    popularRank: 4,
    content: [
      [
        "Agenda ekstrakurikuler dirancang agar siswa memiliki ruang eksplorasi yang seimbang antara akademik, seni, olahraga, dan kepemimpinan.",
        "Setiap kegiatan akan didampingi pembina agar latihan dan target lomba berjalan aman serta terarah.",
      ],
      [
        "Sekolah juga membuka sesi pengenalan bagi siswa baru agar mereka dapat memilih kegiatan sesuai minat dan potensi masing-masing.",
      ],
    ],
  },
  {
    id: 7,
    title: "Program Literasi Digital Ajak Siswa Bijak Bermedia",
    excerpt:
      "Siswa mengikuti sesi literasi digital mengenai keamanan akun, etika komunikasi, dan jejak digital.",
    date: "2 Agustus 2026",
    category: "Kesiswaan",
    image: "/banner.jpeg",
    popularRank: 7,
    content: [
      [
        "Literasi digital menjadi bagian penting dari pembinaan karakter siswa. Materi mencakup cara mengelola identitas digital, mengenali informasi palsu, dan menjaga keamanan data pribadi.",
        "Kegiatan dikemas dengan studi kasus agar siswa dapat memahami dampak keputusan mereka di ruang digital.",
      ],
      [
        "Sekolah akan melanjutkan program ini melalui kampanye kelas dan pendampingan wali kelas secara berkala.",
      ],
    ],
  },
  {
    id: 8,
    title: "Kunjungan Industri Bantu Siswa Mengenal Standar Kerja",
    excerpt:
      "Peserta didik memperoleh gambaran langsung mengenai proses produksi, budaya kerja, dan kebutuhan kompetensi industri.",
    date: "29 Juli 2026",
    category: "Kerjasama",
    image: "/banner.jpeg",
    popularRank: 8,
    content: [
      [
        "Kunjungan industri memberikan pengalaman nyata tentang alur kerja profesional. Siswa melihat bagaimana standar kualitas, keselamatan, dan komunikasi diterapkan setiap hari.",
        "Guru pendamping mengaitkan temuan lapangan dengan materi pembelajaran agar siswa memahami hubungan teori dan praktik.",
      ],
      [
        "Hasil kunjungan akan menjadi bahan refleksi kelas sekaligus masukan bagi penguatan program keahlian.",
      ],
    ],
  },
  {
    id: 9,
    title: "Alumni Berbagi Strategi Karier di Dunia Profesional",
    excerpt:
      "Sesi alumni mengangkat pengalaman transisi dari sekolah ke dunia kerja dan pendidikan lanjutan.",
    date: "26 Juli 2026",
    category: "Alumni",
    image: "/banner.jpeg",
    popularRank: 9,
    content: [
      [
        "Alumni hadir untuk berbagi pengalaman membangun portofolio, mengikuti seleksi kerja, dan menjaga konsistensi belajar setelah lulus.",
        "Siswa diberi kesempatan bertanya langsung tentang tantangan awal memasuki lingkungan profesional.",
      ],
      [
        "Kegiatan ini diharapkan memperkuat jejaring alumni sekaligus memberi inspirasi praktis bagi siswa tingkat akhir.",
      ],
    ],
  },
];

const AUTO_PLAY_DELAY = 5500;

export function BeritaSection({ items = FALLBACK_NEWS_ITEMS, achievements, initialCategory, categoryOptions }: { items?: NewsItem[]; achievements?: import("./prestasi-gallery").Achievement[]; initialCategory?: string; categoryOptions?: { name: string; total: number }[] }) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<NewsFilter>("latest");
  const [isPaused, setIsPaused] = useState(false);

  const newsItems = items.length ? items : FALLBACK_NEWS_ITEMS;
  const sideNews =
    activeFilter === "popular"
      ? [...newsItems.slice(0, 3)].sort((first, second) => first.popularRank - second.popularRank)
      : newsItems.slice(0, 3);
  const carouselNews = newsItems.slice(0, 3);
  const activeNews = carouselNews[activeIndex] ?? carouselNews[0];
  useEffect(() => {
    if (isPaused || reduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % carouselNews.length);
    }, AUTO_PLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [carouselNews.length, isPaused, reduceMotion]);

  return (
    <section
      aria-label="Konten berita"
      className="relative overflow-hidden bg-[#f4f8fa] pb-16 sm:pb-20 lg:pb-24"
    >
      <div
        className="relative mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 xl:px-10"
      >
        <div
          className="grid items-stretch gap-6 lg:h-[650px] lg:grid-cols-[minmax(0,3fr)_minmax(390px,1fr)] xl:gap-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Dialog
            onOpenChange={setIsPaused}
          >
            <div className="relative min-h-[520px] lg:h-full" data-aos="fade-up">
              <AnimatePresence initial={false} mode="wait">
                <DialogTrigger
                  className="h-full rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d4f98]"
                >
                <CutoutCard
                aria-label={`Berita utama: ${activeNews.title}`}
                className={cn(
                  cutoutCardSurfaceClassName,
                  "h-full min-h-[520px] w-full rounded-[20px] border-slate-200/80 bg-slate-950 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.75)] ring-1 ring-slate-200/70 lg:min-h-0",
                )}
                key={activeNews.id}
                role="article"
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                initial={{ opacity: 0, scale: 1.005 }}
                transition={{ duration: reduceMotion ? 0.18 : 0.42, ease: [0.23, 1, 0.32, 1] }}
              >
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute inset-0"
                  exit={{ opacity: 0, x: -34 }}
                  initial={{ opacity: 0, x: 34 }}
                  key={`media-${activeNews.id}`}
                  transition={{ duration: reduceMotion ? 0.18 : 0.58, ease: [0.23, 1, 0.32, 1] }}
                >
                  <CutoutCardMedia className="absolute inset-0">
                    <CutoutCardImage
                      alt="Gedung SMKN 1 Cibinong"
                      className="brightness-[0.84]"
                      fetchPriority="high"
                      priority
                      quality={60}
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      src={activeNews.image}
                    />
                    <CutoutCardOverlay className="bg-linear-to-t from-[#021723]/75 via-[#021723]/35 to-transparent" />
                  </CutoutCardMedia>
                </motion.div>

                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute inset-x-0 bottom-0 z-10"
                  exit={{ opacity: 0, x: -24 }}
                  initial={{ opacity: 0, x: 24 }}
                  key={`content-${activeNews.id}`}
                  transition={{ duration: reduceMotion ? 0.18 : 0.54, ease: [0.23, 1, 0.32, 1], delay: reduceMotion ? 0 : 0.06 }}
                >
                  <CutoutCardContent className="p-6 text-white sm:p-8 lg:p-10">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                      <span className="border-l-2 border-cyan-300 pl-3 text-cyan-200">
                        {activeNews.category}
                      </span>
                    </div>
                    <h2 className="max-w-3xl text-2xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl lg:text-[2.7rem]">
                      {activeNews.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
                      {activeNews.excerpt}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-white/75 sm:text-sm">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-cyan-300" aria-hidden />
                        {activeNews.date}
                      </span>
                    </div>
                  </CutoutCardContent>
                </motion.div>
                </CutoutCard>
                </DialogTrigger>
              </AnimatePresence>
              <div className="absolute right-5 top-5 z-20 flex items-center gap-1 rounded-full bg-slate-950/30 p-1.5" role="group" aria-label="Pagination banner berita">
                {carouselNews.map((news, index) => (
                  <button
                    aria-label={`Tampilkan banner ${index + 1}: ${news.title}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                    className={cn(
                      "relative grid h-7 w-7 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white after:h-2.5 after:rounded-full after:bg-white/45 after:transition-all after:duration-300 hover:after:bg-white",
                      index === activeIndex ? "after:w-5 after:bg-white" : "after:w-2.5",
                    )}
                    key={news.id}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <NewsDetailModal news={activeNews} />
          </Dialog>

          <aside className="flex min-h-[520px] flex-col gap-5 lg:h-full" data-aos="fade-up" data-aos-delay="100">
            <div className="flex min-h-0 flex-1 flex-col rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.4)] ring-1 ring-slate-100">
              <div
                aria-label="Urutkan berita"
                className="mb-4 grid grid-cols-2 border-b border-slate-200"
                role="tablist"
              >
                {(["latest", "popular"] as const).map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      aria-selected={isActive}
                      className={cn(
                        "border-b-2 px-4 py-3 text-sm font-semibold transition-colors duration-200",
                        isActive
                          ? "border-[#1d4f98] text-[#1d4f98]"
                          : "border-transparent text-slate-500 hover:text-slate-800",
                      )}
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      role="tab"
                      type="button"
                    >
                      {filter === "latest" ? "Terbaru" : "Populer"}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="grid min-h-0 flex-1 gap-3 sm:grid-cols-1"
                  exit={{ opacity: 0, x: -10 }}
                  initial={{ opacity: 0, x: 10 }}
                  key={activeFilter}
                  transition={{ duration: reduceMotion ? 0.08 : 0.24, ease: [0.23, 1, 0.32, 1] }}
                >
                  {sideNews.map((news) => {
                    const isActive = news.id === activeNews.id;
                    const carouselIndex = carouselNews.findIndex((item) => item.id === news.id);
                    return (
                      <CutoutCard
                        aria-label={`Pilih berita: ${news.title}`}
                        aria-pressed={isActive}
                        className={cn(
                          cutoutCardSurfaceClassName,
                          "grid min-h-0 grid-cols-[112px_minmax(0,1fr)] rounded-xl border-slate-200/80 bg-white p-2.5 text-left shadow-none ring-1 ring-slate-100 hover:border-slate-300 hover:shadow-none",
                          isActive && "border-[#d7e6f0] bg-[#e8f1f6] shadow-none ring-[#d7e6f0]",
                        )}
                        key={news.id}
                        onClick={() => setActiveIndex(carouselIndex)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setActiveIndex(carouselIndex);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <CutoutCardMedia className="h-full min-h-[92px] rounded-xl">
                          <CutoutCardImage alt={news.title} sizes="112px" src={news.image} />
                        </CutoutCardMedia>
                        <CutoutCardContent className="flex min-w-0 flex-col justify-center px-3.5 py-2">
                          <span className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#1d4f98]">{news.category}</span>
                          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-950 sm:text-[15px]">{news.title}</h3>
                          <span className="mt-2 text-[11px] font-semibold text-slate-700">{news.date}</span>
                        </CutoutCardContent>
                      </CutoutCard>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </aside>
        </div>

      </div>
      <HighlightPrestasi achievements={achievements} />
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <BeritaList items={newsItems} categoryOptions={categoryOptions} initialCategory={initialCategory} />
      </div>
    </section>
  );
}
