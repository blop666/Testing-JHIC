"use client";

import { TimelineAnimation } from "@/components/ui/timeline-animation";
import principalPhoto from "@/docs/image_reffrence/WhatsApp-Image-2025-02-04-at-14.30.04-1.jpeg";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const principalName = "Sugiyo, S.Pd, M.Pd";

export function PrincipalGreeting() {
  const timelineRef = useRef<HTMLElement | null>(null);

  return (
    <section ref={timelineRef} className="relative overflow-hidden bg-white px-4 pb-56 pt-28 md:px-8 lg:pb-60 lg:pt-28">
      <div className="absolute left-1/2 top-24 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/35 blur-3xl" />
      <div className="absolute bottom-16 right-10 -z-0 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" />

      <TimelineAnimation
        timelineRef={timelineRef}
        animationNum={0}
        className="relative mx-auto mb-8 max-w-2xl text-center"
      >
        <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900 md:text-5xl">
          Sambutan Kepala Sekolah
        </h2>
        <div className="mx-auto mt-5 h-[3px] w-28 rounded-full bg-gradient-to-r from-blue-700 to-blue-200" />
      </TimelineAnimation>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 md:flex-row md:items-stretch md:gap-10">
        <TimelineAnimation
          timelineRef={timelineRef}
          animationNum={1}
          className="relative shrink-0 overflow-hidden rounded-3xl shadow-[0_28px_80px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/5 md:h-[30rem] md:w-[24rem]"
        >
          <Image
            src={principalPhoto}
            alt="Kepala SMKN 1 Cibinong"
            width={560}
            height={560}
            quality={55}
            loading="lazy"
            decoding="async"
            sizes="(min-width: 768px) 384px, calc(100vw - 54px)"
            className="aspect-[4/5] w-full max-w-sm object-cover object-center md:h-full md:max-w-none"
          />
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white p-4 text-center shadow-xl md:right-auto md:min-w-72">
            <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
              {principalName}
            </p>
          </div>
        </TimelineAnimation>

        <TimelineAnimation
          timelineRef={timelineRef}
          animationNum={2}
          className="relative max-w-3xl rounded-3xl border border-slate-200/80 bg-white/80 p-6 text-sm leading-relaxed text-slate-600 shadow-xl shadow-slate-200/70 backdrop-blur md:h-[30rem] md:flex-1 md:px-8"
        >
          <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-4xl font-semibold leading-none text-white shadow-lg shadow-blue-700/25">
            “
          </div>
          <p className="mt-5">
            Assalamualaikum Wr. Wb.
          </p>
          <p className="mt-4">
            Puji syukur kami panjatkan kehadirat Allah SWT, atas segala limpahan
            Rahmat, Taufiq, Hidayah, serta Inayah-Nya kepada kita semua, sehingga
            kita masih diberi kesempatan untuk berpartisipasi secara aktif dalam
            dunia pendidikan.
          </p>
          <p className="mt-4">
            Dalam era industri 4.0 saat ini, kecepatan memperoleh informasi akan
            menjadi modal utama dalam rangka menentukan langkah kedepan. Untuk
            mewujudkan hal itu, telah kami upgrade laman SMK N 1 CIBINONG dengan
            harapan bisa lebih komunikatif dan lebih bisa memenuhi kebutuhan
            informasi tentang sekolah kami.
          </p>
          <p className="mt-4">
            Akhirnya, terima kasih kami atas dikunjunginya laman ini,
            mudah-mudahan membawa manfaat bagi kita semua.
          </p>
          <div className="mt-6 font-medium text-slate-800">
            <p>Kepala Sekolah</p>
            <p>{principalName}</p>
          </div>
          <p className="mt-4">
            Wassalamualaikum Wr. Wb.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/profil-sekolah"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-3 font-medium text-white transition hover:-translate-y-0.5"
            >
              Lihat profil sekolah
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </TimelineAnimation>
      </div>
    </section>
  );
}
