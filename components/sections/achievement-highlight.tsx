"use client";

import { ChevronLeft, ChevronRight, MoveUpRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Dialog } from "@/components/ui/linear-dialog";

import type { Achievement } from "./berita/prestasi-gallery";

const loadAchievementModal = () => import("./berita/achievement-modal").then((module) => module.AchievementModal);

const AchievementModal = dynamic(loadAchievementModal, { ssr: false });

const fallbackAchievements: Achievement[] = [
  { id: 1, image: "/smkn-hero-banner.png", title: "Juara LKS Tingkat Nasional", level: "Nasional", recipient: "SMKN 1 Cibinong", date: "", ratio: "landscape", description: "" },
  { id: 2, image: "/hero-banner.jpeg", title: "Medali LKS Tingkat Provinsi", level: "Provinsi", recipient: "SMKN 1 Cibinong", date: "", ratio: "landscape", description: "" },
  { id: 3, image: "/hero-banner.png", title: "Juara Kompetensi Kabupaten", level: "Kabupaten", recipient: "SMKN 1 Cibinong", date: "", ratio: "landscape", description: "" },
  { id: 4, image: "/smkn-hero-banner.png", title: "Prestasi Siswa SMKN 1 Cibinong", level: "Sekolah", recipient: "SMKN 1 Cibinong", date: "", ratio: "landscape", description: "" },
];

const spans: Record<string, string> = {
  nasional: "sm:col-span-7",
  Nasional: "sm:col-span-7",
  provinsi: "sm:col-span-5",
  Provinsi: "sm:col-span-5",
  kabupaten: "sm:col-span-5",
  Kabupaten: "sm:col-span-5",
  sekolah: "sm:col-span-7",
  Sekolah: "sm:col-span-7",
};

export function AchievementHighlight({ achievements }: { achievements?: Achievement[] }) {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Achievement | null>(null);
  const list = achievements && achievements.length ? achievements : fallbackAchievements;

  const openAchievement = (achievement: Achievement) => {
    void loadAchievementModal();
    setSelected(achievement);
  };

  return (
    <section className="relative z-10 overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#2865c7_0%,#124ba3_38%,#082e70_100%)] px-4 pb-16 pt-64 sm:pt-44 md:px-8 md:pb-24 md:pt-48">
      <div className="absolute left-[8%] top-1/3 size-72 rounded-full bg-sky-300/10 blur-3xl" />
      <div className="absolute bottom-0 right-[5%] size-96 rounded-full bg-blue-950/25 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 text-white">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Prestasi</h2>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {list.map((achievement, index) => (
            <motion.button
              key={achievement.id}
              type="button"
              onClick={() => openAchievement(achievement)}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.06 }}
              viewport={{ once: true, amount: 0.2 }}
              className={`group relative col-span-12 aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl text-left ${index !== page ? "hidden sm:block" : ""} ${spans[achievement.level] ?? "sm:col-span-6"} sm:aspect-auto sm:min-h-72 md:min-h-96`}
            >
              <Image
                src={achievement.image}
                alt={achievement.title}
                fill
                sizes="(min-width: 640px) 60vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 md:p-5">
                <h3 className="max-w-[80%] rounded-xl bg-black px-4 py-2 text-sm font-medium text-white md:text-xl">
                  {achievement.title}
                </h3>
                <span
                  className="grid size-11 shrink-0 place-content-center rounded-full bg-white text-blue-800 shadow-sm transition group-hover:-translate-y-1 md:size-12"
                >
                  <MoveUpRight />
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between sm:hidden">
          <button
            type="button"
            aria-label="Prestasi sebelumnya"
            onClick={() => setPage((page - 1 + list.length) % list.length)}
            className="grid size-11 place-content-center rounded-full border border-white/25 text-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex gap-2" aria-label={`Halaman ${page + 1} dari ${list.length}`}>
            {list.map((achievement, index) => (
              <button
                key={achievement.id}
                type="button"
                aria-label={`Tampilkan prestasi ${index + 1}`}
                onClick={() => setPage(index)}
                className="grid size-6 place-content-center rounded-full"
              >
                <span className={`block h-2 rounded-full transition-all ${index === page ? "w-7 bg-white" : "w-2 bg-white/40"}`} />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Prestasi berikutnya"
            onClick={() => setPage((page + 1) % list.length)}
            className="grid size-11 place-content-center rounded-full border border-white/25 text-white"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {selected && (
        <Dialog open onOpenChange={(open) => !open && setSelected(null)}>
          <AchievementModal achievement={selected} />
        </Dialog>
      )}
    </section>
  );
}
