"use client";

import {
  CutoutCard,
  CutoutCardAction,
  CutoutCardContent,
  CutoutCardFooter,
  CutoutCardImage,
  CutoutCardInsetLabel,
  CutoutCardMedia,
  CutoutCardOverlay,
  CutoutCardPin,
  cutoutCardSurfaceClassName,
  useCutoutContentStaggerVariants,
} from "@/components/ui/cutout-card";
import { SharedLayout, SharedLayoutDialog } from "@/components/ui/shared-layout-dialog";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

export interface NewsShowcaseItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  slug: string;
  isNew: boolean;
}

const fallbackNews: NewsShowcaseItem[] = [
  {
    id: 1,
    image: "/smkn-hero-banner.png",
    category: "Kegiatan Sekolah",
    title: "Membangun Generasi Unggul dan Siap Berkarya",
    excerpt: "Kegiatan pembelajaran dan pengembangan karakter siswa SMKN 1 Cibinong.",
    date: "12 Agustus 2026",
    slug: "membangun-generasi-unggul",
    isNew: true,
  },
  {
    id: 2,
    image: "/hero-banner.jpeg",
    category: "Kompetensi",
    title: "Kolaborasi Industri untuk Pembelajaran Relevan",
    excerpt: "Sinergi sekolah dan industri memperkuat kesiapan lulusan menghadapi dunia kerja.",
    date: "8 Agustus 2026",
    slug: "kolaborasi-industri",
    isNew: false,
  },
  {
    id: 3,
    image: "/hero-banner.png",
    category: "Teknologi",
    title: "Inovasi Digital di Lingkungan Sekolah",
    excerpt: "Pemanfaatan teknologi untuk pengalaman belajar yang efektif dan adaptif.",
    date: "4 Agustus 2026",
    slug: "inovasi-digital-sekolah",
    isNew: false,
  },
  {
    id: 4,
    image: "/smkn-hero-banner.png",
    category: "Pengumuman",
    title: "Agenda Sekolah Semester Baru",
    excerpt: "Informasi kegiatan akademik dan nonakademik untuk seluruh warga sekolah.",
    date: "1 Agustus 2026",
    slug: "agenda-sekolah-semester-baru",
    isNew: false,
  },
  {
    id: 5,
    image: "/hero-banner.jpeg",
    category: "Profil",
    title: "Lingkungan Belajar yang Aman dan Inspiratif",
    excerpt: "Ruang tumbuh siswa untuk mengembangkan kompetensi, kreativitas, dan karakter.",
    date: "28 Juli 2026",
    slug: "lingkungan-belajar-inspiratif",
    isNew: false,
  },
  {
    id: 6,
    image: "/hero-banner.png",
    category: "Kesiswaan",
    title: "Kreativitas Siswa dalam Kegiatan Sekolah",
    excerpt: "Beragam karya dan kegiatan menjadi wadah aktualisasi potensi siswa.",
    date: "24 Juli 2026",
    slug: "kreativitas-siswa",
    isNew: false,
  },
];

export function NewsShowcase({ items }: { items?: NewsShowcaseItem[] }) {
  const news = items && items.length ? items : fallbackNews;
  return (
    <section className="relative z-10 bg-white px-4 py-20 text-slate-950 md:px-8 md:py-28">
      <div className="relative mx-auto max-w-7xl border-t border-blue-950/10 pt-10">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Berita Terbaru</h2>
          </div>
          <Link href="/berita" className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-blue-700">
            Lihat semua <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:block sm:columns-2 lg:columns-3">
          {news.map((item, index) => <NewsCard key={item.id} item={item} ratio={index % 3 === 1 ? "aspect-[4/3]" : "aspect-[16/9]"} />)}
        </div>
      </div>
    </section>
  );
}

function NewsCard({ item, ratio }: { item: NewsShowcaseItem; ratio: string }) {
  const variants = useCutoutContentStaggerVariants();

  return (
    <article className="break-inside-avoid sm:mb-5">
      <SharedLayoutDialog
        content={({ layoutId }) => (
          <>
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
              <Image src={item.image} alt={item.title} fill sizes="48rem" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/15" />
              <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-950">{item.category}</span>
            </div>
            <div className="p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 text-xs text-slate-500"><CalendarDays className="size-4" />{item.date}</span>
              <h2 id={`dialog-title-${layoutId}`} className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{item.title}</h2>
              <p className="mt-4 leading-relaxed text-slate-600">{item.excerpt}</p>
              <Link href={`/berita/${item.slug}`} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-600">
                Baca berita lengkap <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </>
        )}
      >
        {({ layoutId }) => (
          <SharedLayout layoutId={`dialog-${layoutId}`}>
            <CutoutCard className={cutoutCardSurfaceClassName}>
              <CutoutCardMedia className={`aspect-[16/9] ${ratio === "aspect-[4/3]" ? "sm:aspect-[4/3]" : "sm:aspect-[16/9]"}`}>
                <CutoutCardImage src={item.image} alt={item.title} />
                <CutoutCardOverlay />
                {item.isNew && <CutoutCardPin className="right-3 top-3 rounded-full bg-card/95 px-4 py-2 text-xs font-semibold text-card-foreground shadow-sm backdrop-blur-sm">Terbaru</CutoutCardPin>}
                <CutoutCardInsetLabel className="bottom-3 left-3 rounded-full bg-card/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-card-foreground shadow-sm backdrop-blur-sm">{item.category}</CutoutCardInsetLabel>
              </CutoutCardMedia>

              <CutoutCardContent className="p-5 sm:p-6">
                <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={variants.container}>
                  <motion.h3 variants={variants.item} className="text-xl font-semibold tracking-tight">{item.title}</motion.h3>
                  <motion.p variants={variants.item} className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</motion.p>
                  <motion.div variants={variants.item}>
                    <CutoutCardFooter className="mt-5 border-t border-border pt-4 pr-14 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" />{item.date}</span>
                    </CutoutCardFooter>
                  </motion.div>
                </motion.div>
              </CutoutCardContent>

              <CutoutCardAction className="bottom-4 right-5 sm:bottom-5" revealOnHover={false}>
                <span className="grid size-10 place-content-center rounded-full bg-blue-600 text-white shadow-lg"><ArrowUpRight className="size-4" /></span>
              </CutoutCardAction>
            </CutoutCard>
          </SharedLayout>
        )}
      </SharedLayoutDialog>
    </article>
  );
}
