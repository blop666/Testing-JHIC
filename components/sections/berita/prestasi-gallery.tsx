"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { LayoutGrid } from "@/components/ui/layout-grid";
import type { LayoutGridCard } from "@/components/ui/layout-grid";
import { cn } from "@/lib/utils";

export interface Achievement {
  id: number;
  title: string;
  recipient: string;
  date: string;
  level: string;
  image: string;
  ratio: "portrait" | "landscape" | "square";
  description: string;
  body?: string | null;
  jurusanCode?: string;
  jurusanName?: string;
  viewCount?: number;
  isHighlighted?: boolean;
  isPopularOverride?: boolean;
}

export interface AchievementJurusan {
  id: number;
  code: string;
  name: string;
  slug: string;
}

export const ACHIEVEMENTS: Achievement[] = [];

const PER_PAGE = 6;
const GRID_CLASSES = [
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-1",
];

function AchievementContent({ achievement }: { achievement: Achievement }) {
  return (
    <>
      <span className="inline-flex w-fit rounded-full bg-[#e8f1f6] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#1d4f98]">
        Highlight Prestasi
      </span>
      <h2 className="mt-6 pr-8 text-3xl font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
        {achievement.title}
      </h2>
      <p className="mt-4 text-base font-semibold leading-7 text-[#1d4f98]">
        {achievement.recipient}
      </p>
      <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
        <p>{achievement.description}</p>
        {achievement.body && achievement.body !== achievement.description && <p>{achievement.body}</p>}
      </div>
      <div className="mt-auto border-t border-slate-200 pt-5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
        {achievement.date || "Tanggal belum tersedia"}
      </div>
    </>
  );
}

function achievementCard(achievement: Achievement, index: number) {
  return {
    id: achievement.id,
    className: cn(
      GRID_CLASSES[index % GRID_CLASSES.length],
      "h-[190px] md:h-full",
    ),
    thumbnail: achievement.image,
    alt: achievement.title,
    title: achievement.title,
    category: achievement.level,
    content: <AchievementContent achievement={achievement} />,
  };
}

export function PrestasiGallery({
  achievements = [],
  jurusan = [],
}: {
  achievements?: Achievement[];
  jurusan?: AchievementJurusan[];
}) {
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState<"latest" | "popular">("latest");
  const searchParams = useSearchParams();
  const initialJurusan = searchParams.get("jurusan");
  const [activeJurusan, setActiveJurusan] = useState(
    initialJurusan && jurusan.some((item) => item.code === initialJurusan) ? initialJurusan : "Semua",
  );
  const [selectedCard, setSelectedCard] = useState<LayoutGridCard | null>(null);
  const filteredAchievements = useMemo(
    () => activeJurusan === "Semua"
      ? achievements
      : achievements.filter((item) => item.jurusanCode === activeJurusan),
    [achievements, activeJurusan],
  );
  const latest = filteredAchievements.slice(0, 3);
  const popular = [...filteredAchievements]
    .sort((a, b) => Number(b.isPopularOverride) - Number(a.isPopularOverride) || (b.viewCount ?? 0) - (a.viewCount ?? 0));
  const filtered = activeTab === "latest" ? filteredAchievements : popular;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(currentPage * PER_PAGE, currentPage * PER_PAGE + PER_PAGE);
  const sidebarItems = activeTab === "latest" ? latest : popular.slice(0, 3);
  const jurusanCounts = new Map(jurusan.map((item) => [item.code, achievements.filter((achievement) => achievement.jurusanCode === item.code).length]));

  return (
    <section className="bg-[#f4f8fa] pb-16 pt-8 sm:pb-20 sm:pt-10" aria-labelledby="prestasi-gallery-title">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 xl:px-10">
        <header className="mb-7" data-aos="fade-up">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#1d4f98]">Highlight Prestasi</span>
          <h1 id="prestasi-gallery-title" className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Pencapaian Siswa SMKN 1 Cibinong
          </h1>
        </header>

        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(280px,0.9fr)] xl:gap-8">
          <div className="min-w-0 w-full h-full" data-aos="fade-up" data-aos-delay="100">
            {pageItems.length ? (
              <motion.div
                key={`${activeJurusan}-${activeTab}-${currentPage}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="min-h-[600px] md:h-full"
              >
                <LayoutGrid cards={pageItems.map(achievementCard)} selectedCard={selectedCard} onSelectedCardChange={setSelectedCard} />
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Belum ada prestasi untuk jurusan ini.
              </div>
            )}

            {pageCount > 1 && (
              <div className="mt-7 flex items-center justify-center gap-3" role="group" aria-label="Pagination prestasi">
                <button
                  type="button"
                  aria-label="Halaman sebelumnya"
                  disabled={currentPage === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                ><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: pageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-current={currentPage === index ? "page" : undefined}
                    aria-label={`Halaman prestasi ${index + 1}`}
                    onClick={() => setPage(index)}
                    className={cn("h-2.5 rounded-full transition-all", currentPage === index ? "w-8 bg-[#1d4f98]" : "w-2.5 bg-slate-300")}
                  />
                ))}
                <button
                  type="button"
                  aria-label="Halaman berikutnya"
                  disabled={currentPage === pageCount - 1}
                  onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                ><ChevronRight className="h-4 w-4" /></button>
              </div>
            )}
          </div>

          <aside className="flex h-full flex-col space-y-5 lg:sticky lg:top-24" data-aos="fade-up" data-aos-delay="200">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.45)]">
              <div className="mb-4 grid grid-cols-2 border-b border-slate-200" role="tablist" aria-label="Urutkan prestasi">
                {(["latest", "popular"] as const).map((tab) => (
                  <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => { setActiveTab(tab); setPage(0); }} className={cn("border-b-2 px-4 py-3 text-sm font-semibold", activeTab === tab ? "border-[#1d4f98] text-[#1d4f98]" : "border-transparent text-slate-500")}>{tab === "latest" ? "Terbaru" : "Populer"}</button>
                ))}
              </div>
              <div className="space-y-3">
                {sidebarItems.map((item, index) => {
                  const card = achievementCard(item, index);
                  return <button key={item.id} type="button" onClick={() => setSelectedCard(card)} className={cn("grid w-full grid-cols-[112px_minmax(0,1fr)] gap-3 rounded-xl border p-2.5 text-left", index === 0 && "border-[#bfd3e6] bg-[#e8f1f6]")}><span className="relative h-[92px] overflow-hidden rounded-xl"><img src={item.image} alt="" className="h-full w-full object-cover" /></span><span className="flex min-w-0 flex-col justify-center"><span className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#1d4f98]">{item.level}</span><span className="line-clamp-2 text-sm font-bold leading-5 text-slate-950">{item.title}</span><span className="mt-1 text-[11px] font-semibold text-slate-700">{item.date}</span></span></button>;
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.45)]">
              <h2 className="mb-4 text-base font-bold text-slate-950">Kategori</h2>
              <div className="space-y-1.5">
                {[{ code: "Semua", name: "Semua", total: achievements.length }, ...jurusan.map((item) => ({ ...item, total: jurusanCounts.get(item.code) ?? 0 }))].map((item) => {
                  const active = activeJurusan === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      aria-pressed={active}
                      onClick={() => { setActiveJurusan(item.code); setPage(0); setSelectedCard(null); }}
                      className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors", active ? "bg-[#e8f1f6] text-[#1d4f98]" : "text-slate-600 hover:bg-slate-50")}
                    >
                      <span>{item.name}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{item.total}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
