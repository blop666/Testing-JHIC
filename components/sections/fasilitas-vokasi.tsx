"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type FasilitasVokasiItem = {
  id: number;
  title: string;
  description: string;
  image: string;
  tefaName: string | null;
  jurusan: string | null;
};

const fallbackFasilitas: FasilitasVokasiItem[] = [
  { id: 1, title: "Laboratorium Komputer Enterprise", description: "Lab komputer berstandar industri untuk praktik pemrograman dan jaringan. Dilengkapi workstation modern dan koneksi berkecepatan tinggi.", image: "/smkn-hero-banner.webp", tefaName: "TeFa Software Development", jurusan: "RPL · SIJA" },
  { id: 2, title: "Bengkel Praktik Mesin", description: "Bengkel produksi riil dengan mesin CNC dan peralatan manufaktur modern untuk pembelajaran berbasis Teaching Factory.", image: "/hero-banner.webp", tefaName: "TeFa CNC Machining", jurusan: "TP · TFLM" },
  { id: 3, title: "LSP Sertifikasi Kompetensi", description: "Tempat uji kompetensi berlisensi untuk sertifikasi profesi siswa, bekerja sama dengan asosiasi dan industri.", image: "/hero-banner.webp", tefaName: "TeFa Jaringan & Mikrotik", jurusan: "TKJ · TOI" },
];

const AUTO_ADVANCE_MS = 5000;

export function FasilitasVokasi({ fasilitas = fallbackFasilitas }: { fasilitas?: FasilitasVokasiItem[] }) {
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<FasilitasVokasiItem | null>(null);
  const [paused, setPaused] = useState(false);

  const items = fasilitas.length ? fasilitas : fallbackFasilitas;

  useEffect(() => {
    if (paused || modalOpen || items.length <= 1) return;
    const interval = setInterval(() => setActive((prev) => (prev + 1) % items.length), AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [paused, modalOpen, items.length]);

  const openModal = (item: FasilitasVokasiItem) => {
    setModalItem(item);
    setModalOpen(true);
  };

  const current = items[active] ?? items[0];

  const move = (direction: -1 | 1) => {
    setActive((index) => (index + direction + items.length) % items.length);
  };

  return (
    <section className="bg-[#F9FAFB] py-16 md:py-20">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 lg:px-14">
        <div data-aos="fade-up" className="max-w-2xl">
          <h2 className="text-2xl font-bold text-[#101828] md:text-3xl">Fasilitas Praktik Vokasi</h2>
          <p className="mt-3 text-base text-[#364153]">Teaching Factory &amp; standarisasi industri untuk pembelajaran yang relevan dengan dunia kerja.</p>
        </div>

        <div className="group relative mt-10 h-[420px] md:h-[460px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <AnimatePresence mode="wait">
            <motion.button
              key={current.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={() => openModal(current)}
              className="group absolute inset-0 w-full cursor-pointer overflow-hidden rounded-xl border border-[#E5E7EB] text-left"
            >
              <Image
                src={current.image || "/hero-banner.webp"}
                alt={current.title}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                {current.tefaName && (
                  <span className="mb-3 inline-block rounded-full bg-[#155DFC] px-3 py-1 text-xs font-semibold text-white">{current.tefaName}</span>
                )}
                <h3 className="text-xl font-bold text-white md:text-2xl">{current.title}</h3>
                {current.jurusan && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-200">{current.jurusan}</p>}
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
                  {current.description}
                </p>
              </div>
            </motion.button>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-x-4 top-1/2 z-20 flex -translate-y-1/2 justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              aria-label="Fasilitas vokasi sebelumnya"
              onClick={() => move(-1)}
              className="pointer-events-auto grid size-11 place-items-center rounded-full border border-white/30 bg-black/25 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Fasilitas vokasi berikutnya"
              onClick={() => move(1)}
              className="pointer-events-auto grid size-11 place-items-center rounded-full border border-white/30 bg-black/25 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActive(index)}
              className={cn(
                "h-3 rounded-full transition-all duration-200",
                active === index ? "w-8 bg-[#155DFC]" : "w-3 bg-[#CBD5E1] hover:bg-[#94A3B8]"
              )}
              aria-label={`Tampilkan ${item.title}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && modalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-72 md:h-96">
                <Image src={modalItem.image || "/hero-banner.webp"} alt={modalItem.title} fill sizes="(max-width: 768px) 100vw, 896px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="Tutup"
                  className="absolute top-4 right-4 grid size-10 place-content-center rounded-full bg-white/90 text-gray-700 transition hover:bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
                <h3 className="absolute bottom-5 left-5 text-2xl font-bold text-white md:text-3xl">{modalItem.title}</h3>
              </div>
              <div className="p-6 md:p-10">
                {modalItem.tefaName && (
                  <span className="mb-4 inline-block rounded-full bg-[#EFF5FC] px-3 py-1 text-sm font-semibold text-[#1C4E97]">{modalItem.tefaName}</span>
                )}
                {modalItem.jurusan && <p className="mb-3 text-sm font-semibold text-[#364153]">{modalItem.jurusan}</p>}
                <p className="text-base leading-relaxed text-[#364153] md:text-lg">{modalItem.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
