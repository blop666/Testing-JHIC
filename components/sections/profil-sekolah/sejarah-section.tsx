"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Timeline } from "@/components/ui/timeline";

const timelineData = [
  {
    title: "1998",
    content: (
      <div className="group relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-lg border border-white/30 rounded-3xl p-8 md:p-10 lg:p-12 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-[1.02] hover:border-white/40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-5 tracking-tight">
            Awal Mula Berdiri
          </h4>
          <p className="text-base md:text-lg text-white/95 leading-relaxed mb-8 font-light">
            SMK Negeri 1 Cibinong berdiri pada 17 Juli 1998 dengan nama awal SMK Negeri 2 Cibinong. Berlokasi di Jalan Raya Karadenan No. 7, Kecamatan Cibinong, Kabupaten Bogor.
          </p>
          <div className="flex items-start gap-4 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-5 border border-white/10 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed">
              Berdiri sejak 17 Juli 1998 dengan nama awal SMKN 2 Cibinong.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "2000",
    content: (
      <div className="group relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-lg border border-white/30 rounded-3xl p-8 md:p-10 lg:p-12 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.5)] transition-all duration-300 hover:scale-[1.02] hover:border-white/40">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-5 tracking-tight">
            Perubahan Nama Resmi
          </h4>
          <p className="text-base md:text-lg text-white/95 leading-relaxed mb-8 font-light">
            Berdasarkan SK Menteri Pendidikan Nasional No. 217/O/2000, sekolah resmi berganti nama menjadi SMK Negeri 1 Cibinong. Gedung sekolah diresmikan pada 17 Februari 2000 oleh Bupati Bogor Bapak Agus Utara Efendi.
          </p>
          <div className="flex items-start gap-4 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-5 border border-white/10 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed">
              Ganti nama resmi via SK Mendiknas No. 217/O/2000, gedung diresmikan 17 Februari 2000.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Perkembangan",
    content: (
      <div className="group relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-lg border border-white/30 rounded-3xl p-8 md:p-10 lg:p-12 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(96,165,250,0.5)] transition-all duration-300 hover:scale-[1.02] hover:border-white/40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-5 tracking-tight">
            Akreditasi &amp; Program Keahlian
          </h4>
          <p className="text-base md:text-lg text-white/95 leading-relaxed mb-8 font-light">
            Sekolah terakreditasi A dan mengembangkan 10 konsentrasi keahlian: SIJA, RPL, DKV, TKJ, TKP, TP, TOI, TKR, TFLM, dan DPIB dengan fasilitas pembelajaran modern.
          </p>
          <div className="flex items-start gap-4 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-5 border border-white/10 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-400/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/>
                <circle cx="12" cy="8" r="6"/>
              </svg>
            </div>
            <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed">
              Terakreditasi A dengan 10 konsentrasi keahlian.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Sekarang",
    content: (
      <div className="group relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-lg border border-white/30 rounded-3xl p-8 md:p-10 lg:p-12 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(103,232,249,0.5)] transition-all duration-300 hover:scale-[1.02] hover:border-white/40">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-5 tracking-tight">
            Era Digital &amp; Inovasi
          </h4>
          <p className="text-base md:text-lg text-white/95 leading-relaxed mb-8 font-light">
            Memasuki era digital dengan berbagai inovasi pembelajaran dan kerjasama industri 4.0. SMKN 1 Cibinong terus beradaptasi dengan perkembangan teknologi untuk mencetak lulusan yang siap kerja.
          </p>
          <div className="flex items-start gap-4 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-5 border border-white/10 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-300 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-400/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <rect width="16" height="16" x="4" y="4" rx="2"/>
                <rect width="6" height="6" x="9" y="9" rx="1"/>
                <path d="M15 2v2M15 20v2M2 15h2M20 15h2M2 9h2M20 9h2M9 2v2M9 20v2"/>
              </svg>
            </div>
            <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed">
              Transformasi digital dengan teaching factory dan laboratorium berbasis industri 4.0.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

export function SejarahSection() {
  return (
    <section className="relative isolate overflow-clip bg-[#1b4d96]">
      {/* Hero Section */}
      <div className="sticky top-0 z-0 flex h-[100svh] min-h-[38rem] w-full items-center justify-center">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1b4d96]">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.035 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/banner.webp"
              alt="SMKN 1 Cibinong"
              fill
              className="object-cover opacity-40"
              priority
              quality={60}
              sizes="100vw"
            />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <motion.p
                className="mb-2 text-xl font-medium text-white/90 drop-shadow-lg md:text-3xl"
              >
                Sejarah Singkat
              </motion.p>
              <motion.h2
                className="text-5xl font-bold leading-tight text-white drop-shadow-lg md:text-8xl"
              >
                SMKN 1 Cibinong
              </motion.h2>
            </motion.div>

          </motion.div>

          <motion.div
            className="absolute bottom-12 left-0 right-0 flex flex-col items-center justify-center z-10"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white animate-bounce mb-2">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
            <p className="text-base md:text-lg text-white font-medium">
              Scroll untuk melihat lebih lanjut
            </p>
          </motion.div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative z-10 min-h-screen bg-[#1b4d96]">
        <Timeline data={timelineData} />
      </div>
    </section>
  );
}
