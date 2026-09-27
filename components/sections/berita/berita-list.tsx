"use client";

import { memo, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SearchX } from "lucide-react";

import { BeritaCard } from "./berita-card";
import { BeritaSidebar } from "./berita-sidebar";
import type { NewsItem } from "./berita-types";
import { Dialog } from "@/components/ui/linear-dialog";

const MOBILE_NEWS_PER_PAGE = 3;
const DESKTOP_NEWS_PER_PAGE = 6;
const MOBILE_AUTO_ADVANCE_DELAY = 5500;

interface CategoryItem {
  name: string;
  total: number;
}

const NewsDetailModal = dynamic(
  () => import("./news-detail-modal").then((module) => module.NewsDetailModal),
  { ssr: false },
);

const MONTHS: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

function newsDateKey(date: string) {
  const [day, month, year] = date.toLowerCase().split(" ");
  const monthIndex = MONTHS[month];
  if (monthIndex === undefined) return "";
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;
}

interface BeritaListProps {
  items: NewsItem[];
  categoryOptions?: CategoryItem[];
  initialCategory?: string;
  navigationRequest?: {
    newsId: number;
    requestId: number;
  } | null;
}

export const BeritaList = memo(function BeritaList({ items, categoryOptions, initialCategory, navigationRequest }: BeritaListProps) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory ?? "Semua");
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date(2026, 7, 1));
  const [page, setPage] = useState(0);
  const [newsPerPage, setNewsPerPage] = useState(MOBILE_NEWS_PER_PAGE);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [highlightedNewsId, setHighlightedNewsId] = useState<number | null>(null);
  const [transitionDirection, setTransitionDirection] = useState(1);

  const categories = useMemo(
    () => Array.from(new Set(items.map((news) => news.category))).map((name) => ({
      name,
      total: items.filter((news) => news.category === name).length,
    })),
    [items],
  );
  const visibleCategories = useMemo(() => {
    if (!categoryOptions?.length) return categories;
    const counts = new Map(categories.map((category) => [category.name, category.total]));
    return categoryOptions.map((category) => ({ name: category.name, total: counts.get(category.name) ?? 0 }));
  }, [categories, categoryOptions]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((news) => {
      const matchesQuery = !normalizedQuery || [news.title, news.excerpt, news.category]
        .some((field) => field.toLowerCase().includes(normalizedQuery));
      const matchesCategory = activeCategory === "Semua" || news.category === activeCategory;
      const matchesDate = !activeDate || newsDateKey(news.date) === activeDate;
      return matchesQuery && matchesCategory && matchesDate;
    });
  }, [activeCategory, activeDate, items, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / newsPerPage));
  const pagedItems = filteredItems.slice(page * newsPerPage, page * newsPerPage + newsPerPage);

  useEffect(() => setPage(0), [activeCategory, activeDate, query]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const updatePageSize = () => setNewsPerPage(media.matches ? DESKTOP_NEWS_PER_PAGE : MOBILE_NEWS_PER_PAGE);
    updatePageSize();
    media.addEventListener("change", updatePageSize);
    return () => media.removeEventListener("change", updatePageSize);
  }, []);
  useEffect(() => {
    if (newsPerPage !== MOBILE_NEWS_PER_PAGE || totalPages <= 1 || reduceMotion || selectedNews) return;
    const timer = window.setInterval(() => {
      setTransitionDirection(1);
      setPage((current) => (current + 1) % totalPages);
    }, MOBILE_AUTO_ADVANCE_DELAY);
    return () => window.clearInterval(timer);
  }, [newsPerPage, reduceMotion, selectedNews, totalPages]);
  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [page, totalPages]);

  useEffect(() => {
    if (!navigationRequest) return;
    const itemIndex = items.findIndex((news) => news.id === navigationRequest.newsId);
    if (itemIndex < 0) return;

    setQuery("");
    setActiveCategory("Semua");
    setActiveDate(null);
    setPage(Math.floor(itemIndex / newsPerPage));
    setHighlightedNewsId(navigationRequest.newsId);

    const scrollTimer = window.setTimeout(() => {
      document.getElementById("semua-berita")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        document.getElementById(`berita-card-${navigationRequest.newsId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 360);
    }, 40);
    const highlightTimer = window.setTimeout(() => setHighlightedNewsId(null), 2400);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(highlightTimer);
    };
  }, [items, navigationRequest, newsPerPage]);

  function updateCategory(category: string) {
    setTransitionDirection(1);
    setActiveCategory(category);
  }

  function updateDate(date: string | null) {
    setTransitionDirection(1);
    setActiveDate(date);
  }

  function clearFilters() {
    setQuery("");
    setActiveCategory("Semua");
    setActiveDate(null);
  }

  return (
    <>
      <div className="content-auto mt-12 scroll-mt-24 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] xl:mt-14 xl:grid-cols-[minmax(0,1fr)_400px]" id="semua-berita">
        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" data-aos="fade-up">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#1d4f98]">Semua Berita</span>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">Kabar terbaru dari sekolah</h2>
            </div>
          </div>

          <div data-aos="fade-up" data-aos-delay="150">
            <AnimatePresence initial={false} mode="popLayout">
              {pagedItems.length > 0 ? (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                  exit={{ opacity: 0, x: reduceMotion ? 0 : -10 * transitionDirection }}
                  initial={{ opacity: 0, x: reduceMotion ? 0 : 10 * transitionDirection }}
                  key={`${page}-${activeCategory}-${activeDate ?? "all"}-${query}`}
                  transition={{ duration: reduceMotion ? 0.08 : 0.24, ease: [0.23, 1, 0.32, 1] }}
                >
                  {pagedItems.map((news) => (
                    <BeritaCard highlighted={highlightedNewsId === news.id} key={news.id} news={news} onSelect={setSelectedNews} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="grid min-h-80 place-items-center rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center"
                  exit={{ opacity: 0, y: -6 }}
                  initial={{ opacity: 0, y: 8 }}
                  key="empty-news"
                  transition={{ duration: 0.2 }}
                >
                  <div>
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f1f6] text-[#1d4f98]"><SearchX className="h-5 w-5" /></span>
                    <h3 className="mt-4 font-bold text-slate-950">Berita tidak ditemukan</h3>
                    <p className="mt-2 text-sm text-slate-500">Ubah kata pencarian, kategori, atau tanggal kalender.</p>
                    <button className="mt-5 rounded-full bg-[#1d4f98] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#173f7a]" onClick={clearFilters} type="button">Reset filter</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2" role="group" aria-label="Pagination daftar berita">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  aria-current={index === page ? "true" : undefined}
                  aria-label={`Tampilkan halaman berita ${index + 1}`}
                  className="relative h-6 w-9 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d4f98]"
                  key={index}
                  onClick={() => {
                    setTransitionDirection(index > page ? 1 : -1);
                    setPage(index);
                  }}
                  type="button"
                >
                  <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200" />
                  {index === page && <motion.span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#1d4f98]" layoutId="news-page-dot" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                </button>
              ))}
            </div>
          )}
        </div>

          <div data-aos="fade-up" data-aos-delay="100">
            <BeritaSidebar
            activeCategory={activeCategory}
            activeDate={activeDate}
            categories={visibleCategories}
            month={month}
            onCategoryChange={updateCategory}
            onClearFilters={clearFilters}
            onDateChange={updateDate}
            onMonthChange={setMonth}
            onQueryChange={setQuery}
            query={query}
            />
          </div>
          {selectedNews && <Dialog open onOpenChange={(open) => !open && setSelectedNews(null)}><NewsDetailModal news={selectedNews} /></Dialog>}
      </div>
    </>
  );
});
