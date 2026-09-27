"use client";

import { Expandable, ExpandableCard, ExpandableContent, ExpandableTrigger } from "@/components/ui/expandable";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type SchoolEvent = {
  id: number;
  title: string;
  excerpt: string;
  date: Date | null;
  endDate: Date | null;
  location: string;
  image: string;
  slug: string;
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function dayDistance(target: Date) {
  const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  return Math.round((startOfDay(target) - startOfDay(new Date())) / 86_400_000);
}

function countdownLabel(target: Date) {
  const days = dayDistance(target);
  if (days < 0) return "Selesai";
  if (days === 0) return "Hari ini";
  return `${days} hari lagi`;
}

const cardColors = ["bg-blue-700", "bg-slate-900", "bg-sky-700"];

export function SchoolEvents({ items }: { items?: SchoolEvent[] }) {
  const events = items ?? [];
  const [page, setPage] = useState(0);

  if (!events.length) return null;

  return (
    <section className="relative z-10 bg-white px-4 py-20 text-slate-950 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl border-t border-slate-200 pt-10">
        <div className="mb-8 flex items-end justify-between gap-5 md:mb-10">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Event Sekolah</h2>
          </div>
          <Link href="/berita?kategori=Agenda" className="hidden items-center gap-2 text-sm text-slate-600 transition hover:text-blue-700 sm:inline-flex">Semua event <ArrowUpRight className="size-4" /></Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:items-start">
          {events.map((event, index) => (
            <div key={event.id} className={index === page ? "block" : "hidden md:block"}>
              <EventCard event={event} color={cardColors[index % cardColors.length]} />
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between md:hidden">
          <button type="button" aria-label="Event sebelumnya" onClick={() => setPage((page - 1 + events.length) % events.length)} className="grid size-11 place-content-center rounded-full border border-slate-200"><ChevronLeft className="size-5" /></button>
          <span className="text-sm text-slate-500">{page + 1} / {events.length}</span>
          <button type="button" aria-label="Event berikutnya" onClick={() => setPage((page + 1) % events.length)} className="grid size-11 place-content-center rounded-full border border-slate-200"><ChevronRight className="size-5" /></button>
        </div>
      </div>
    </section>
  );
}

function EventCard({ event, color }: { event: SchoolEvent; color: string }) {
  const eventDate = event.date ? new Date(event.date) : null;
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const badge = eventDate ? countdownLabel(eventDate) : "Segera";
  const dateLabel = eventDate ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(eventDate) : "";
  const timeFmt = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" });
  const startTime = eventDate ? timeFmt.format(eventDate) : "";
  const endTime = endDate ? timeFmt.format(endDate) : "";
  const timeLabel = startTime && endTime ? `${startTime} - ${endTime} WIB` : startTime ? `${startTime} WIB` : "";

  return (
    <Expandable>
      <ExpandableCard className={`${color} group rounded-[2rem] p-6 text-white shadow-xl shadow-slate-950/10`}>
        <ExpandableTrigger className="block w-full">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold">{badge}</span>
            <span className="grid size-11 place-content-center rounded-xl border border-white/15 bg-white/10"><CalendarDays className="size-5" /></span>
          </div>
          <p className="mt-8 text-sm text-white/85">{dateLabel}</p>
          <h3 className="mt-2 min-h-16 text-2xl font-semibold leading-tight">{event.title}</h3>
          <div className="mt-6 flex items-center justify-between gap-4">
            {timeLabel && <span className="inline-flex items-center gap-2 text-sm"><Clock3 className="size-4" />{timeLabel}</span>}
            <Plus className="size-5 transition-transform group-data-[expanded=true]:rotate-45" />
          </div>
        </ExpandableTrigger>
        <ExpandableContent className="border-t border-white/15 pt-5 mt-5">
          {event.location && <p className="flex items-center gap-2 text-sm font-medium"><MapPin className="size-4" />{event.location}</p>}
          <p className="mt-3 text-sm leading-relaxed text-white/70">{event.excerpt}</p>
          <Link href={`/berita/${event.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Lihat detail <ArrowUpRight className="size-4" /></Link>
        </ExpandableContent>
      </ExpandableCard>
    </Expandable>
  );
}
