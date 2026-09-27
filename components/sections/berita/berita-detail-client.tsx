"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Tag } from "lucide-react";

import { cn } from "@/lib/utils";
import { generateSlugWithId } from "@/lib/slug";

import type { NewsItem } from "./berita-types";

interface BeritaDetailClientProps {
  news: NewsItem;
  relatedNews: NewsItem[];
}

export function BeritaDetailClient({ news, relatedNews }: BeritaDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"latest" | "popular">("latest");

  const displayedNews =
    activeTab === "popular"
      ? [...relatedNews].sort((a, b) => a.popularRank - b.popularRank)
      : relatedNews;

  const rawContent = news.content.flat().join("\n\n");
  const isHtml = /<\/?(h1|h2|h3|h4|p|ul|ol|li|strong|em|blockquote|figure|pre|code)\b/i.test(rawContent);

  return (
    <main className="min-h-screen bg-[#f4f8fa]">
      <section className="relative -mt-[72px] h-[480px] w-full overflow-hidden bg-slate-900 sm:h-[560px] md:-mt-[80px] lg:h-[640px]">
        <Image src={news.image} alt={news.title} fill priority quality={75} className="object-cover brightness-[0.65]" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1720px] px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8 lg:pb-16 xl:px-10">
          <div className="max-w-5xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#1d4f98] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white">{news.category}</span>
              <span className="flex items-center gap-2 text-sm font-medium text-white/90"><CalendarDays className="h-4 w-4" />{news.date}</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl xl:text-6xl">{news.title}</h1>
            <p className="mt-4 text-base leading-7 text-white/85 sm:text-lg sm:leading-8">{news.excerpt}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1720px] px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_450px] lg:gap-12">
          <div data-aos="fade-up" data-aos-delay="100">
            <Link href="/berita" className="group mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1d4f98] transition-colors hover:text-[#173f7a]"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />Kembali ke Berita</Link>
            <article className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              {isHtml ? (
                <div className="rich-text max-w-none" dangerouslySetInnerHTML={{ __html: rawContent }} />
              ) : (
                <div className="max-w-none">
                  {news.content.flat().map((paragraph, index) => (
                    <p key={index} className="mb-5 text-base leading-8 text-slate-700 text-justify">{paragraph}</p>
                  ))}
                </div>
              )}
              <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6"><span className="flex items-center gap-2 text-sm text-slate-500"><Tag className="h-4 w-4" /><span className="font-semibold">{news.category}</span></span><span className="h-1 w-1 rounded-full bg-slate-300" /><span className="text-sm text-slate-500">{news.date}</span></div>
            </article>
          </div>

          <aside data-aos="fade-up" data-aos-delay="200" className="h-full">
            <div className="sticky top-6 h-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold tracking-[-0.025em] text-slate-950">Berita Terkait</h2>
              <div className="mb-6 grid grid-cols-2 border-b border-slate-200" role="tablist">
                <button role="tab" aria-selected={activeTab === "latest"} onClick={() => setActiveTab("latest")} className={cn("border-b-2 px-4 py-3 text-sm font-semibold transition-colors", activeTab === "latest" ? "border-[#1d4f98] text-[#1d4f98]" : "border-transparent text-slate-500 hover:text-slate-700")}>Terbaru</button>
                <button role="tab" aria-selected={activeTab === "popular"} onClick={() => setActiveTab("popular")} className={cn("border-b-2 px-4 py-3 text-sm font-semibold transition-colors", activeTab === "popular" ? "border-[#1d4f98] text-[#1d4f98]" : "border-transparent text-slate-500 hover:text-slate-700")}>Populer</button>
              </div>
              <div className="space-y-4">
                {displayedNews.slice(0, 4).map((item) => (
                  <Link key={item.id} href={`/berita/${generateSlugWithId(item.title, item.id)}`} className="group flex gap-4 overflow-hidden rounded-2xl border border-slate-200/50 bg-slate-50/50 p-3 transition-all hover:border-[#bfd3e6] hover:bg-white hover:shadow-sm">
                    <div className="relative h-[110px] w-[110px] flex-shrink-0 overflow-hidden rounded-xl bg-slate-200"><Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="110px" /></div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center"><span className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1d4f98]">{item.category}</span><h3 className="mb-2 line-clamp-2 text-sm font-bold leading-tight tracking-[-0.015em] text-slate-950 transition-colors group-hover:text-[#1d4f98]">{item.title}</h3><p className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="h-3 w-3" />{item.date}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
