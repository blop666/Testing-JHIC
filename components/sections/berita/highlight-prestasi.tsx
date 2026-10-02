"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/linear-dialog";

import { ACHIEVEMENTS, type Achievement } from "./prestasi-gallery";

const loadAchievementModal = () => import("./achievement-modal").then((module) => module.AchievementModal);

const AchievementModal = dynamic(
  loadAchievementModal,
  { ssr: false },
);

const AUTO_ADVANCE_DELAY = 5200;
const ITEMS_PER_PAGE = 3;
const ratioClassName = { portrait: "aspect-[16/10]", landscape: "aspect-[16/10]", square: "aspect-[16/10]" } as const;

function HighlightCard({ achievement, onSelect }: { achievement: Achievement; onSelect: (achievement: Achievement) => Promise<void> }) {
  return (
    <button className="group block w-full cursor-pointer overflow-hidden rounded-[22px] bg-slate-200 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d4f98]" onClick={() => void onSelect(achievement)} onFocus={() => void loadAchievementModal()} onMouseEnter={() => void loadAchievementModal()} onPointerDown={() => void loadAchievementModal()} type="button">
      <div className={cn("relative", ratioClassName[achievement.ratio])}>
        <Image alt={achievement.title} className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" fill loading="lazy" sizes="(max-width: 768px) 92vw, 33vw" src={achievement.image} />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm"><Trophy className="h-3 w-3 text-yellow-300" />{achievement.level}</span>
          <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-tight tracking-[-0.025em]">{achievement.title}</h3>
          <p className="mt-2 text-xs font-medium text-white/75">{achievement.recipient}</p>
        </div>
      </div>
    </button>
  );
}

export function HighlightPrestasi({ achievements = ACHIEVEMENTS }: { achievements?: Achievement[] }) {
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState(0);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const highlights = achievements.slice(0, 6);
  const pages = Math.max(1, Math.ceil(highlights.length / ITEMS_PER_PAGE));
  const activeItems = highlights.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE);
  const isEmpty = highlights.length === 0;

  useEffect(() => {
    if (reduceMotion || pages <= 1) return;
    const timer = window.setInterval(() => setPage((current) => (current + 1) % pages), AUTO_ADVANCE_DELAY);
    return () => window.clearInterval(timer);
  }, [pages, reduceMotion]);

  const openAchievement = async (achievement: Achievement) => {
    await loadAchievementModal();
    setSelectedAchievement(achievement);
  };

  return (
    <section aria-labelledby="highlight-prestasi-title" className="content-auto mt-12 border-y border-slate-200 bg-white py-8 sm:mt-14 sm:py-10">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 xl:px-10" data-aos="fade-up">
        <div className="mb-6 flex items-end justify-between gap-5" data-aos="fade-up" data-aos-delay="100">
          <div>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#1d4f98]">Highlight Prestasi</span>
            <h2 id="highlight-prestasi-title" className="mt-2 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">Pencapaian populer sekolah</h2>
          </div>
          <Link className="shrink-0 rounded-full border border-[#bfd3e6] px-4 py-2 text-sm font-bold text-[#1d4f98] transition-colors hover:bg-[#1d4f98] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d4f98]" href="/berita/prestasi">Detail</Link>
        </div>
        <div data-aos="fade-up" data-aos-delay="200">
          {isEmpty ? (
            <div className="mx-auto max-w-xl rounded-3xl border-2 border-dashed border-blue-200 bg-white/70 px-8 py-16 text-center shadow-sm">
              <p className="text-lg font-semibold text-blue-900">Data Belum Ada</p>
              <p className="mt-2 text-sm text-slate-500">Belum ada pencapaian populer untuk saat ini.</p>
            </div>
          ) : (
          <AnimatePresence initial={false} mode="wait">
            <motion.div animate={{ opacity: 1, x: 0 }} className="grid gap-4 md:grid-cols-3" exit={{ opacity: 0, x: -10 }} initial={{ opacity: 0, x: 10 }} key={page} transition={{ duration: reduceMotion ? 0.08 : 0.28, ease: [0.23, 1, 0.32, 1] }}>
              {activeItems.map((achievement) => <HighlightCard achievement={achievement} key={achievement.id} onSelect={openAchievement} />)}
            </motion.div>
          </AnimatePresence>
          )}
        </div>
        {pages > 1 && <div className="mt-6 flex justify-center gap-2" data-aos="fade-up" data-aos-delay="300" role="group" aria-label="Pagination highlight prestasi">{Array.from({ length: pages }, (_, index) => <button aria-current={page === index ? "true" : undefined} aria-label={`Tampilkan highlight prestasi ${index + 1}`} className="relative h-4 w-9 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d4f98]" key={index} onClick={() => setPage(index)} type="button"><span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200" />{page === index && <motion.span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#1d4f98]" layoutId="highlight-prestasi-dot" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}</button>)}</div>}
        {selectedAchievement && <Dialog open onOpenChange={(open) => !open && setSelectedAchievement(null)}><AchievementModal achievement={selectedAchievement} /></Dialog>}
      </div>
    </section>
  );
}
