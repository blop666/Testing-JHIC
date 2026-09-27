"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type JurusanCategory = "All" | "IT" | "Teknik";

interface Jurusan {
  code: string;
  name: string;
  fullName: string;
  description: string;
  logoUrl: string;
  category: "IT" | "Teknik";
  durasi: string;
  bgImage?: string;
  kompetensi: string[];
  prospek: string;
}

interface JurusanApiItem {
  code: string;
  name: string;
  fullName: string;
  description: string;
  logoUrl: string;
  category: "IT" | "Teknik";
  durasi: string;
  bgImageUrl: string | null;
  kompetensi: string[];
  prospek: string;
}

const JURUSAN_DATA: Jurusan[] = [
  {
    code: "SIJA",
    name: "SIJA",
    fullName: "Sistem Informasi, Jaringan dan Aplikasi",
    description: "Program keahlian 4 tahun yang mencetak generasi handal di bidang teknologi yang berakhlak dan berkarakter, dengan penekanan pada softskill seperti disiplin, etos kerja, dan kejujuran untuk bersaing di dunia teknologi.",
    logoUrl: "/logo jurusan/sija.png",
    category: "IT",
    durasi: "4 Tahun (Setara D1)",
    bgImage: "/img_ref/banner.jpg",
    kompetensi: ["Cybersecurity", "Cloud Computing", "Networking", "Web Development", "Database Management", "System Administration", "IoT (Internet of Things)", "Network Security"],
    prospek: "Network Administrator, System Administrator, Cybersecurity Specialist, Cloud Engineer, IT Support, Network Engineer, DevOps Engineer",
  },
  {
    code: "RPL",
    name: "RPL",
    fullName: "Rekayasa Perangkat Lunak",
    description: "Program keahlian yang fokus pada perancangan, pembuatan, dan pengembangan aplikasi software dengan pembelajaran berbasis Teaching Factory yang link and match dengan industri untuk menghasilkan lulusan berkompeten dan berdaya saing global.",
    logoUrl: "/logo jurusan/rpl.png",
    category: "IT",
    durasi: "3 Tahun",
    bgImage: "/img_ref/banner.jpg",
    kompetensi: ["Algoritma dan Pemrograman", "Basis Data & SQL", "Pemrograman Berorientasi Objek", "Web Design & Development", "Aplikasi Berbasis Desktop", "Aplikasi Berbasis Mobile", "Software Testing", "Pemrograman Visual"],
    prospek: "Software Developer, Web Developer, Mobile Developer, Database Administrator, Software Tester, System Analyst, Full Stack Developer",
  },
  {
    code: "DKV",
    name: "DKV",
    fullName: "Desain Komunikasi Visual",
    description: "Program keahlian yang mengembangkan kreativitas dalam desain grafis, multimedia, dan komunikasi visual untuk kebutuhan cetak maupun digital dengan teknologi terkini.",
    logoUrl: "/logo jurusan/logo-DKV_New-Revisi_Fix-1-e1731551656251.png",
    category: "IT",
    durasi: "3 Tahun",
    bgImage: "/img_ref/banner.jpg",
    kompetensi: ["Desain Grafis", "Ilustrasi Digital", "Fotografi", "Video Editing", "Animasi 2D/3D", "Multimedia", "Digital Imaging", "Typography", "UI/UX Design"],
    prospek: "Graphic Designer, Illustrator, Video Editor, Animator, Content Creator, Photographer, UI/UX Designer, Multimedia Designer",
  },
  {
    code: "TKJ",
    name: "TKJ",
    fullName: "Teknik Komputer dan Jaringan",
    description: "Program keahlian unggulan yang menghasilkan lulusan kompeten dalam instalasi, konfigurasi, dan maintenance sistem komputer serta jaringan dengan standar nasional dan internasional, didukung sertifikasi dan prestasi tingkat nasional.",
    logoUrl: "/logo jurusan/tkj.png",
    category: "IT",
    durasi: "3 Tahun",
    bgImage: "/img_ref/banner.jpg",
    kompetensi: ["Instalasi dan Perakitan Komputer", "Sistem Operasi", "Jaringan Komputer", "Wide Area Network (WAN)", "Server Administration", "Network Security", "Database", "Troubleshooting", "Mikrotik"],
    prospek: "Network Technician, IT Support, Network Administrator, System Administrator, Server Administrator, Network Engineer, IT Infrastructure Specialist",
  },
  {
    code: "TKP",
    name: "TKP",
    fullName: "Teknik Konstruksi dan Perumahan",
    description: "Program keahlian yang mempelajari proses pembangunan dan pekerjaan konstruksi bangunan serta perumahan dengan keterampilan praktis dalam struktur, konstruksi kayu, dan penyelesaian bangunan.",
    logoUrl: "/logo jurusan/tkp baru.png",
    category: "Teknik",
    durasi: "3 Tahun",
    bgImage: "/img_ref/banner.jpg",
    kompetensi: ["Konstruksi Bangunan", "Pekerjaan Kayu", "Sambungan Kayu", "Struktur Bangunan", "Bekisting", "Pekerjaan Atap", "Pembuatan Pintu dan Jendela", "Finishing Bangunan", "Carpentry"],
    prospek: "Teknisi Konstruksi, Pelaksana Lapangan, Tukang Kayu Profesional, Supervisor Bangunan, Estimator Konstruksi, Drafter Konstruksi",
  },
  {
    code: "TP",
    name: "TP",
    fullName: "Teknik Pemesinan",
    description: "Program keahlian yang mempelajari proses pemesinan dan manufaktur modern dengan teknologi CNC untuk menghasilkan lulusan terampil dalam industri manufaktur.",
    logoUrl: "/logo jurusan/Logo-TP-1536x991.png",
    category: "Teknik",
    durasi: "3 Tahun",
    bgImage: "/img_ref/banner.jpg",
    kompetensi: ["Gambar Teknik", "Metrologi Industri", "Teknik Pemesinan", "CNC Operation", "Mesin Produksi", "Proses Manufaktur", "Quality Control", "Kerja Bangku", "NC/CNC Programming"],
    prospek: "Operator Mesin CNC, Operator Produksi, Teknisi Pemesinan, Quality Control Inspector, Teknisi Manufaktur, Machinist",
  },
  {
    code: "TOI",
    name: "TOI",
    fullName: "Teknik Otomasi Industri",
    description: "Program keahlian yang mempelajari sistem otomasi, kendali, dan teknologi industri modern untuk menghasilkan teknisi yang mampu merancang, mengoperasikan, dan memelihara sistem otomasi industri.",
    logoUrl: "/logo jurusan/toi.png",
    category: "Teknik",
    durasi: "3 Tahun",
    bgImage: "/img_ref/banner.jpg",
    kompetensi: ["PLC Programming", "SCADA System", "Industrial Automation", "Sensor dan Transducer", "Pneumatik & Elektropneumatik", "Motor Listrik", "Sistem Kendali Digital", "Electrical Control", "Aktuator"],
    prospek: "Teknisi Otomasi Industri, PLC Programmer, Teknisi Maintenance, Teknisi Electrical Control, Automation Engineer, Control System Technician",
  },
  {
    code: "TKR",
    name: "TKR",
    fullName: "Teknik Kendaraan Ringan",
    description: "Program keahlian yang fokus pada teknologi dan perawatan kendaraan ringan dengan pembelajaran sistem mesin, kelistrikan, chassis, dan sistem kendaraan modern.",
    logoUrl: "/logo jurusan/tkr.png",
    category: "Teknik",
    durasi: "3 Tahun",
    bgImage: "/img_ref/banner.jpg",
    kompetensi: ["Mesin Kendaraan", "Sistem Kelistrikan Otomotif", "Chassis & Powertrain", "Sistem Pemindah Tenaga", "Sistem Rem", "Sistem Kemudi", "Sistem Suspensi", "Sistem AC Kendaraan", "Troubleshooting", "Engine Tune-up"],
    prospek: "Teknisi Otomotif, Mekanik Kendaraan Ringan, Service Advisor, Teknisi Kelistrikan Kendaraan, Workshop Supervisor, Automotive Engineer",
  },
  {
    code: "TFLM",
    name: "TFLM",
    fullName: "Teknik Fabrikasi Logam dan Manufaktur",
    description: "Program keahlian yang fokus pada proses fabrikasi, pengelasan, dan kegiatan manufaktur dengan teknologi modern untuk industri logam dan manufaktur.",
    logoUrl: "/logo jurusan/tflm.png",
    category: "Teknik",
    durasi: "3 Tahun",
    bgImage: "/img_ref/banner.jpg",
    kompetensi: ["Gambar Teknik", "Fabrikasi Logam", "Teknik Pengelasan", "Teknik Pemesinan", "Proses Manufaktur", "Metrologi", "Pengoperasian Mesin Produksi", "Pembuatan Komponen", "Welding Technology"],
    prospek: "Welder Profesional, Teknisi Fabrikasi, Operator Produksi, Quality Control, Teknisi Pengelasan, Supervisor Produksi, Fabrication Engineer",
  },
  {
    code: "DPIB",
    name: "DPIB",
    fullName: "Desain Pemodelan dan Informasi Bangunan",
    description: "Program keahlian yang mempelajari perencanaan, penggambaran, pemodelan, dan penyajian informasi bangunan dengan teknologi BIM (Building Information Modeling) dan software desain modern.",
    logoUrl: "/logo jurusan/dpib.png",
    category: "Teknik",
    durasi: "3 Tahun",
    bgImage: "/img_ref/banner.jpg",
    kompetensi: ["Gambar Teknik Bangunan", "BIM Modeling", "Gambar Konstruksi", "Konstruksi Kayu", "Desain Interior & Eksterior", "Pemodelan Bangunan", "CAD Software", "Konstruksi Beton", "Utilitas Bangunan"],
    prospek: "Drafter Bangunan, BIM Modeler, Desainer Bangunan, Teknisi Konstruksi, CAD Operator, Building Designer, Estimator Proyek",
  },
];

interface KompetensiSectionProps {
  className?: string;
}

const ITEMS_PER_PAGE = 6;

export function KompetensiSection({ className }: KompetensiSectionProps) {
  // Keep the verified preview data visible until the CMS database is populated.
  const [jurusanData, setJurusanData] = useState<Jurusan[]>(JURUSAN_DATA);
  const [activeCategory, setActiveCategory] = useState<JurusanCategory>("All");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [direction, setDirection] = useState(1);

  // Memoize filtered data untuk performa
  const filteredJurusan = useMemo(() => 
    jurusanData.filter((j) => activeCategory === "All" || j.category === activeCategory),
    [activeCategory, jurusanData]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadJurusan() {
      try {
        const response = await fetch("/api/jurusan?limit=100");
        const payload = await response.json() as { success: boolean; data?: JurusanApiItem[] };
        if (!response.ok || !payload.success || !payload.data) {
          throw new Error("Gagal memuat jurusan");
        }

        if (isMounted && payload.data.length > 0) {
          setJurusanData(payload.data.map((item) => ({
            ...item,
            bgImage: item.bgImageUrl ?? undefined,
          })));
        }
      } catch {
        // The local seed remains the preview source when the CMS API is unavailable.
      }
    }

    loadJurusan();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = useMemo(() => 
    Math.ceil(filteredJurusan.length / ITEMS_PER_PAGE),
    [filteredJurusan.length]
  );

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = useMemo(() => 
    filteredJurusan.slice(startIndex, endIndex),
    [filteredJurusan, startIndex, endIndex]
  );

  const focusedJurusan = filteredJurusan[focusedIndex];

  // Auto-rotate
  useEffect(() => {
    if (!isAutoRotating || isModalOpen) return;

    const interval = setInterval(() => {
      setFocusedIndex((prev) => {
        if (filteredJurusan.length === 0) return 0;
        const nextIndex = (prev + 1) % filteredJurusan.length;
        setDirection(1);
        const nextPage = Math.floor(nextIndex / ITEMS_PER_PAGE);
        if (nextPage !== currentPage) {
          setCurrentPage(nextPage);
        }
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoRotating, isModalOpen, filteredJurusan.length, currentPage]);

  // Reset on category change
  useEffect(() => {
    setFocusedIndex(0);
    setCurrentPage(0);
    setDirection(1);
  }, [activeCategory]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleCardClick = (index: number) => {
    const globalIndex = startIndex + index;
    setDirection(globalIndex > focusedIndex ? 1 : -1);
    setFocusedIndex(globalIndex);
  };

  const handlePageChange = (page: number) => {
    setDirection(page > currentPage ? 1 : -1);
    setCurrentPage(page);
    setFocusedIndex(page * ITEMS_PER_PAGE);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    setIsAutoRotating(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsAutoRotating(true);
  };

  // Framer Motion Variants
  const focusCardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className={cn("relative bg-white pb-16", className)}>
      <div className="container mx-auto w-full px-4">
        {/* Filter Buttons */}
        <div data-aos="fade-up" className="mb-8 flex flex-wrap gap-3">
          {(["All", "IT", "Teknik"] as JurusanCategory[]).map((category) => (
            <Button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "h-11 rounded-full px-6 text-sm font-semibold transition-colors",
                activeCategory === category
                  ? "bg-[#155DFC] text-white hover:bg-[#155DFC]/90"
                  : "border border-[#E5E7EB] bg-white text-[#364153] hover:bg-[#F9FAFB]"
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {filteredJurusan.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-gray-700">Belum ada jurusan yang dipublikasikan pada kategori ini.</p>
        ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.65fr] lg:gap-8">
          {/* Focus Card - Kiri */}
          <motion.div 
            className="relative h-[500px] md:h-[600px] lg:h-[560px]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={focusedIndex}
                custom={direction}
                variants={focusCardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", duration: 0.3, ease: "easeInOut" },
                  opacity: { duration: 0.2 },
                }}
                className="absolute inset-0 group cursor-pointer rounded-2xl overflow-hidden border border-[#E5E7EB]"
                onClick={handleModalOpen}
                style={{
                  backgroundImage: `url(${focusedJurusan?.bgImage || "/img_ref/banner.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b2a63]/95 via-[#0b2a63]/55 to-transparent" />

                <div className="absolute top-5 left-5 flex items-center gap-3">
                  <div className="grid size-16 place-content-center rounded-xl bg-white p-2 shadow-sm md:size-20">
                    <img
                      src={focusedJurusan?.logoUrl}
                      alt={focusedJurusan?.name}
                      className="size-12 object-contain md:size-14"
                    />
                  </div>
                  <span className="rounded-full bg-[#EFF5FC] px-3 py-1 text-xs font-semibold text-[#1C4E97]">
                    {focusedJurusan?.code} • {focusedJurusan?.durasi}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium text-white backdrop-blur-sm">
                    {focusedJurusan?.category}
                  </span>
                  <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                    {focusedJurusan?.code}
                  </h2>
                  <p className="mt-1 text-lg font-semibold text-white/90 md:text-xl">
                    {focusedJurusan?.fullName}
                  </p>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                    {focusedJurusan?.description}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white">
                    <span>Lihat detail lengkap</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Grid Cards - Kanan */}
          <div className="flex h-[500px] flex-col md:h-[600px] lg:h-[560px]">
            <motion.div 
              variants={gridVariants}
              initial="hidden"
              animate="show"
              key={`page-${currentPage}`}
              className="grid grid-cols-3 grid-rows-2 gap-3 md:gap-4 flex-1"
            >
              {currentPageData.map((jurusan, index) => {
                const globalIndex = startIndex + index;
                const isFocused = focusedIndex === globalIndex;
                
                return (
                  <motion.div
                    key={`${jurusan.code}-${globalIndex}`}
                    variants={cardVariants}
                    onClick={() => handleCardClick(index)}
                    className={cn(
                      "group relative rounded-xl overflow-hidden cursor-pointer border transition-colors",
                      isFocused ? "border-[#1C4E97] ring-2 ring-[#1C4E97]" : "border-[#E5E7EB]"
                    )}
                    style={{
                      backgroundImage: `url(/img_ref/banner.jpg)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Overlay */}
                    <div
                      className={cn(
                        "absolute inset-0 transition-colors duration-200",
                        isFocused
                          ? "bg-[#1C4E97]/85"
                          : "bg-gradient-to-t from-black/85 via-black/55 to-black/30 group-hover:bg-[#1C4E97]/70"
                      )}
                    />

                    {/* Logo */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                      <img
                        src={jurusan.logoUrl}
                        alt={jurusan.code}
                        className="w-20 h-20 md:w-24 md:h-24 object-contain"
                      />
                    </div>

                    {/* Duration badge */}
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
                      <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#1C4E97] md:text-xs">
                        {jurusan.durasi}
                      </span>
                    </div>

                    {/* Jurusan Code */}
                    <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3 z-10">
                      <h3 className="text-base font-bold text-white md:text-lg lg:text-xl">
                        {jurusan.code}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Pagination Dots */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 py-4">
                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                  <button
                    key={pageIndex}
                    onClick={() => handlePageChange(pageIndex)}
                    className={cn(
                      "rounded-full transition-all duration-200",
                      currentPage === pageIndex
                        ? "h-3 w-8 bg-[#155DFC]"
                        : "h-3 w-3 bg-[#E5E7EB] hover:bg-[#CBD5E1]"
                    )}
                    aria-label={`Halaman ${pageIndex + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        )}

      </div>

      {/* Modal Detail */}
      <AnimatePresence>
        {isModalOpen && focusedJurusan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={handleModalClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="relative h-56 overflow-hidden md:h-72"
                style={{
                  backgroundImage: `url(${focusedJurusan.bgImage || "/img_ref/banner.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b2a63]/95 via-[#0b2a63]/55 to-transparent" />

                <button
                  onClick={handleModalClose}
                  aria-label="Tutup"
                  className="absolute top-4 right-4 grid size-10 place-content-center rounded-full bg-white/90 text-gray-700 transition hover:bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>

                <div className="absolute bottom-5 left-5 flex items-end gap-4 md:bottom-6 md:left-6">
                  <div className="grid size-16 place-content-center rounded-xl bg-white p-2 md:size-20">
                    <img src={focusedJurusan.logoUrl} alt={focusedJurusan.name} className="size-12 object-contain md:size-14" />
                  </div>
                  <div>
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                      {focusedJurusan.category}
                    </span>
                    <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">{focusedJurusan.code}</h2>
                    <p className="text-base font-semibold text-white/90 md:text-lg">{focusedJurusan.fullName}</p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="max-h-[calc(90vh-14rem)] overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {/* Tentang Program - plain paragraph */}
                <div>
                  <h3 className="text-xl font-bold text-[#101828]">Tentang Program</h3>
                  <p className="mt-3 text-base leading-relaxed text-[#364153]">
                    {focusedJurusan.description}
                  </p>
                </div>

                {/* Kompetensi yang Dipelajari - plain two-column list */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-[#101828]">Kompetensi yang Dipelajari</h3>
                  <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
                    {focusedJurusan.kompetensi.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-[#1C4E97]" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span className="text-[#364153]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prospek Karier - single highlight box */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-[#101828]">Prospek Karier</h3>
                  <p className="mt-3 rounded-xl border border-[#1C4E97]/10 bg-[#EFF5FC] p-5 text-base leading-relaxed text-[#364153]">
                    {focusedJurusan.prospek}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
