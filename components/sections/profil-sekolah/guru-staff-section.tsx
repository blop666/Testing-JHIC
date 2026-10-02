"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const fallbackGuruStaffData = [
  // General - Leadership
  { id: 1, name: 'Dr. Sugiyo, S.Pd, M.Pd', position: 'Kepala Sekolah', bio: 'Memimpin SMKN 1 Cibinong dengan visi keunggulan dan karakter. Berpengalaman lebih dari 20 tahun di bidang pendidikan.', image: '/banner.webp', category: 'General' },
  { id: 2, name: 'Dr. Eneng Nurahman, S.Pd, M.Si', position: 'Wakil Kepala Sekolah Bidang Kurikulum', bio: 'Mengelola kurikulum dan pembelajaran dengan fokus pada standar industri dan kompetensi siswa.', image: '/banner.webp', category: 'General' },
  { id: 3, name: 'H. Budi Santoso, S.Kom', position: 'Wakil Kepala Sekolah Bidang Sarana Prasarana', bio: 'Mengelola fasilitas pembelajaran dan infrastruktur sekolah untuk mendukung proses belajar mengajar.', image: '/banner.webp', category: 'General' },
  { id: 4, name: 'Lina Susilowati, S.Pd', position: 'Wakil Kepala Sekolah Bidang Kesiswaan', bio: 'Membimbing karakter dan prestasi siswa dalam berbagai kegiatan ekstrakurikuler.', image: '/banner.webp', category: 'General' },
  { id: 5, name: 'Drs. Ahmad Fauzi, M.Pd', position: 'Wakil Kepala Sekolah Bidang Hubungan Industri', bio: 'Membangun kemitraan dengan dunia usaha dan industri untuk penempatan lulusan.', image: '/banner.webp', category: 'General' },
  { id: 6, name: 'Hj. Siti Aminah, S.Pd, M.M', position: 'Kepala Tata Usaha', bio: 'Mengelola administrasi dan keuangan sekolah dengan sistem yang tertib dan akuntabel.', image: '/banner.webp', category: 'General' },
  
  // Staff - Administrative
  { id: 7, name: 'Budi Hartono, S.Kom', position: 'Staff IT & Sistem Informasi', bio: 'Mengelola infrastruktur teknologi informasi dan sistem administrasi digital sekolah.', image: '/banner.webp', category: 'Staff' },
  { id: 8, name: 'Rina Kusuma, S.E', position: 'Staff Keuangan', bio: 'Mengelola keuangan sekolah dengan sistem pelaporan yang transparan dan akuntabel.', image: '/banner.webp', category: 'Staff' },
  { id: 9, name: 'Dedi Supriadi, S.Sos', position: 'Staff Hubungan Masyarakat', bio: 'Mengelola komunikasi dan publikasi kegiatan sekolah ke masyarakat dan media.', image: '/banner.webp', category: 'Staff' },
  { id: 10, name: 'Ani Widiastuti, A.Md', position: 'Staff Perpustakaan', bio: 'Mengelola koleksi buku dan layanan perpustakaan digital untuk mendukung pembelajaran.', image: '/banner.webp', category: 'Staff' },
  { id: 11, name: 'Joko Susilo, S.Pd', position: 'Staff Bimbingan Konseling', bio: 'Memberikan layanan konseling dan bimbingan karir untuk siswa.', image: '/banner.webp', category: 'Staff' },
  
  // SIJA - Sistem Informasi Jaringan dan Aplikasi
  { id: 12, name: 'Agus Prasetyo, S.Kom, M.T', position: 'Ketua Program SIJA', bio: 'Mengkoordinir pembelajaran dan pengembangan kurikulum SIJA sesuai kebutuhan industri.', image: '/banner.webp', category: 'SIJA' },
  { id: 13, name: 'Eko Wijaya, S.T', position: 'Guru Produktif SIJA', bio: 'Mengajar jaringan komputer, administrasi server, dan keamanan jaringan.', image: '/banner.webp', category: 'SIJA' },
  { id: 14, name: 'Dewi Anggraeni, S.Kom', position: 'Guru Produktif SIJA', bio: 'Mengajar pemrograman web, database management, dan sistem informasi.', image: '/banner.webp', category: 'SIJA' },
  { id: 15, name: 'Rudi Hermawan, S.Pd', position: 'Guru Produktif SIJA', bio: 'Mengajar infrastruktur jaringan, cloud computing, dan virtualisasi.', image: '/banner.webp', category: 'SIJA' },
  { id: 16, name: 'Linda Marlina, S.T', position: 'Guru Produktif SIJA', bio: 'Mengajar cybersecurity, ethical hacking, dan forensik digital.', image: '/banner.webp', category: 'SIJA' },
  
  // RPL - Rekayasa Perangkat Lunak
  { id: 17, name: 'Dr. Bambang Sulistyo, S.Kom, M.Cs', position: 'Ketua Program RPL', bio: 'Mengkoordinir pengembangan kompetensi siswa di bidang software engineering.', image: '/banner.webp', category: 'RPL' },
  { id: 18, name: 'Andi Firmansyah, S.Kom', position: 'Guru Produktif RPL', bio: 'Mengajar pemrograman Java, Android development, dan mobile app development.', image: '/banner.webp', category: 'RPL' },
  { id: 19, name: 'Sari Indah, S.T', position: 'Guru Produktif RPL', bio: 'Mengajar web development, React, Node.js, dan full-stack development.', image: '/banner.webp', category: 'RPL' },
  { id: 20, name: 'Hendra Gunawan, S.Kom', position: 'Guru Produktif RPL', bio: 'Mengajar database design, SQL, dan backend development.', image: '/banner.webp', category: 'RPL' },
  { id: 21, name: 'Maya Kusuma, S.Pd', position: 'Guru Produktif RPL', bio: 'Mengajar UI/UX design, software testing, dan quality assurance.', image: '/banner.webp', category: 'RPL' },
  
  // TKJ - Teknik Komputer dan Jaringan
  { id: 22, name: 'Ir. Wahyu Hidayat, M.T', position: 'Ketua Program TKJ', bio: 'Mengkoordinir pembelajaran teknik komputer dan jaringan dengan standar industri.', image: '/banner.webp', category: 'TKJ' },
  { id: 23, name: 'Dedi Kurniawan, S.T', position: 'Guru Produktif TKJ', bio: 'Mengajar instalasi dan konfigurasi jaringan, routing, dan switching.', image: '/banner.webp', category: 'TKJ' },
  { id: 24, name: 'Fitri Rahmawati, S.Kom', position: 'Guru Produktif TKJ', bio: 'Mengajar troubleshooting hardware, assembling PC, dan maintenance komputer.', image: '/banner.webp', category: 'TKJ' },
  { id: 25, name: 'Arief Budiman, S.Pd', position: 'Guru Produktif TKJ', bio: 'Mengajar wireless network, network security, dan monitoring jaringan.', image: '/banner.webp', category: 'TKJ' },
  { id: 26, name: 'Nurul Hidayah, S.T', position: 'Guru Produktif TKJ', bio: 'Mengajar sistem operasi, Linux administration, dan server management.', image: '/banner.webp', category: 'TKJ' },
  
  // DKV - Desain Komunikasi Visual
  { id: 27, name: 'Drs. Hadi Purnomo, M.Sn', position: 'Ketua Program DKV', bio: 'Mengkoordinir pengembangan kreativitas dan kompetensi desain visual siswa.', image: '/banner.webp', category: 'DKV' },
  { id: 28, name: 'Lia Amalia, S.Sn', position: 'Guru Produktif DKV', bio: 'Mengajar desain grafis, Adobe Photoshop, Illustrator, dan digital imaging.', image: '/banner.webp', category: 'DKV' },
  { id: 29, name: 'Riko Aditya, S.Ds', position: 'Guru Produktif DKV', bio: 'Mengajar videografi, editing video, motion graphics, dan multimedia.', image: '/banner.webp', category: 'DKV' },
  { id: 30, name: 'Indah Permatasari, S.Sn', position: 'Guru Produktif DKV', bio: 'Mengajar fotografi, lighting, dan visual storytelling.', image: '/banner.webp', category: 'DKV' },
  { id: 31, name: 'Fajar Ramadhan, S.Ds', position: 'Guru Produktif DKV', bio: 'Mengajar desain web, UI design, dan branding.', image: '/banner.webp', category: 'DKV' },
  
  // TKP - Teknik Konstruksi dan Perumahan
  { id: 32, name: 'Ir. Sutrisno, M.T', position: 'Ketua Program TKP', bio: 'Mengkoordinir pembelajaran teknik konstruksi dengan standar SNI dan industri.', image: '/banner.webp', category: 'TKP' },
  { id: 33, name: 'Ahmad Yani, S.T', position: 'Guru Produktif TKP', bio: 'Mengajar gambar teknik, AutoCAD, dan perencanaan konstruksi.', image: '/banner.webp', category: 'TKP' },
  { id: 34, name: 'Wulan Dari, S.Pd', position: 'Guru Produktif TKP', bio: 'Mengajar ilmu bahan bangunan, teknologi beton, dan struktur bangunan.', image: '/banner.webp', category: 'TKP' },
  { id: 35, name: 'Iwan Setiawan, S.T', position: 'Guru Produktif TKP', bio: 'Mengajar mekanika tanah, fondasi, dan konstruksi jalan.', image: '/banner.webp', category: 'TKP' },
  { id: 36, name: 'Sri Wahyuni, S.Pd', position: 'Guru Produktif TKP', bio: 'Mengajar estimasi biaya, manajemen proyek, dan quantity surveying.', image: '/banner.webp', category: 'TKP' },
  
  // DPIB - Desain Permodelan dan Informasi Bangunan
  { id: 37, name: 'Ir. Gunawan, M.T', position: 'Ketua Program DPIB', bio: 'Mengkoordinir pembelajaran BIM (Building Information Modeling) dan teknologi konstruksi modern.', image: '/banner.webp', category: 'DPIB' },
  { id: 38, name: 'Rizal Efendi, S.T', position: 'Guru Produktif DPIB', bio: 'Mengajar Revit, BIM modeling, dan koordinasi desain 3D.', image: '/banner.webp', category: 'DPIB' },
  { id: 39, name: 'Dwi Lestari, S.T', position: 'Guru Produktif DPIB', bio: 'Mengajar SketchUp, rendering 3D, dan presentasi arsitektur.', image: '/banner.webp', category: 'DPIB' },
  { id: 40, name: 'Heru Santoso, S.Pd', position: 'Guru Produktif DPIB', bio: 'Mengajar struktur bangunan, MEP (Mechanical, Electrical, Plumbing), dan instalasi.', image: '/banner.webp', category: 'DPIB' },
  { id: 41, name: 'Yuni Astuti, S.T', position: 'Guru Produktif DPIB', bio: 'Mengajar quantity take-off, cost estimation berbasis BIM, dan project management.', image: '/banner.webp', category: 'DPIB' },
  
  // TP - Teknik Pengelasan
  { id: 42, name: 'Drs. Slamet Riyadi, M.Pd', position: 'Ketua Program TP', bio: 'Mengkoordinir pembelajaran teknik pengelasan dengan sertifikasi internasional.', image: '/banner.webp', category: 'TP' },
  { id: 43, name: 'Joko Widodo, S.T', position: 'Guru Produktif TP', bio: 'Mengajar las SMAW, GMAW, dan teknik pengelasan dasar.', image: '/banner.webp', category: 'TP' },
  { id: 44, name: 'Suwardi, A.Md', position: 'Guru Produktif TP', bio: 'Mengajar las TIG, pipa, dan pressure vessel welding.', image: '/banner.webp', category: 'TP' },
  { id: 45, name: 'Edi Susanto, S.Pd', position: 'Guru Produktif TP', bio: 'Mengajar metalurgi pengelasan, NDT (Non-Destructive Testing), dan quality control.', image: '/banner.webp', category: 'TP' },
  
  // TFLM - Teknik Fabrikasi Logam dan Manufaktur
  { id: 46, name: 'Ir. Bambang Sutopo, M.T', position: 'Ketua Program TFLM', bio: 'Mengkoordinir pembelajaran fabrikasi logam dan proses manufaktur modern.', image: '/banner.webp', category: 'TFLM' },
  { id: 47, name: 'Agung Prasetya, S.T', position: 'Guru Produktif TFLM', bio: 'Mengajar mesin CNC, CAD/CAM, dan machining process.', image: '/banner.webp', category: 'TFLM' },
  { id: 48, name: 'Surya Kusuma, A.Md', position: 'Guru Produktif TFLM', bio: 'Mengajar sheet metal working, bending, dan fabrikasi plat.', image: '/banner.webp', category: 'TFLM' },
  { id: 49, name: 'Rini Handayani, S.Pd', position: 'Guru Produktif TFLM', bio: 'Mengajar metrology, quality inspection, dan manufacturing process.', image: '/banner.webp', category: 'TFLM' },
  
  // TKR - Teknik Kendaraan Ringan
  { id: 50, name: 'Drs. Agus Salim, M.Pd', position: 'Ketua Program TKR', bio: 'Mengkoordinir pembelajaran teknologi otomotif dengan standar industri automotive.', image: '/banner.webp', category: 'TKR' },
  { id: 51, name: 'Hermawan, S.T', position: 'Guru Produktif TKR', bio: 'Mengajar sistem mesin, tune-up, dan engine overhaul.', image: '/banner.webp', category: 'TKR' },
  { id: 52, name: 'Dian Pratama, A.Md', position: 'Guru Produktif TKR', bio: 'Mengajar sistem kelistrikan, ECU, dan diagnosa kendaraan.', image: '/banner.webp', category: 'TKR' },
  { id: 53, name: 'Yanto Wijaya, S.Pd', position: 'Guru Produktif TKR', bio: 'Mengajar sistem chasis, transmisi, dan power train.', image: '/banner.webp', category: 'TKR' },
  { id: 54, name: 'Ratna Sari, S.T', position: 'Guru Produktif TKR', bio: 'Mengajar AC mobil, sistem rem, dan teknologi hybrid vehicle.', image: '/banner.webp', category: 'TKR' },
  
  // TOI - Teknik Otomasi Industri
  { id: 55, name: 'Ir. Hendra Kusuma, M.T', position: 'Ketua Program TOI', bio: 'Mengkoordinir pembelajaran otomasi industri dan teknologi kontrol modern.', image: '/banner.webp', category: 'TOI' },
  { id: 56, name: 'Budi Santoso, S.T', position: 'Guru Produktif TOI', bio: 'Mengajar PLC programming, SCADA, dan industrial automation.', image: '/banner.webp', category: 'TOI' },
  { id: 57, name: 'Lina Mariana, S.Kom', position: 'Guru Produktif TOI', bio: 'Mengajar robotika, pneumatik, dan elektro-pneumatik.', image: '/banner.webp', category: 'TOI' },
  { id: 58, name: 'Andi Gunawan, S.Pd', position: 'Guru Produktif TOI', bio: 'Mengajar sensor dan aktuator, IoT, dan smart manufacturing.', image: '/banner.webp', category: 'TOI' },
  { id: 59, name: 'Rina Kusumawati, S.T', position: 'Guru Produktif TOI', bio: 'Mengajar kontrol motor, inverter, dan sistem kontrol proses industri.', image: '/banner.webp', category: 'TOI' },
];

type GuruItem = { id: number; name: string; position: string; bio: string; image: string; category: string };
type GuruCategory = { id: number; name: string; slug: string };

export function GuruStaffSection({ items, categories = [] }: { items: GuruItem[]; categories?: GuruCategory[] }) {
  const guruStaffData = items;
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(guruStaffData[0]);
  const [activeFilter, setActiveFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [lastInteractionTime, setLastInteractionTime] = useState(0);
  const [isSectionVisible, setIsSectionVisible] = useState(false);

  // Filter tabs come from the Guru & Staff categories configured in the admin,
  // then merge any categories that actually exist in the data (fallback).
  const adminCategories = categories.map((category) => category.name);
  const dataCategories = Array.from(new Set(guruStaffData.map((item) => item.category || 'General').filter(Boolean)));
  const guruFilters = Array.from(new Set([...adminCategories, ...dataCategories]));
  const effectiveFilter = activeFilter || guruFilters[0] || 'General';

  // Filter data based on active filter
  const filteredData = guruStaffData.filter((item) => (item.category || 'General') === effectiveFilter);

  // Pagination: 5 items per page
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => setIsSectionVisible(entry.isIntersecting), {
      threshold: 0.15,
    });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Do not wake the page while this offscreen section cannot be seen.
  useEffect(() => {
    if (!isSectionVisible) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      const timeSinceInteraction = Date.now() - lastInteractionTime;
      const pauseDuration = 10000; // 10 seconds pause after interaction
      
      if (timeSinceInteraction > pauseDuration) {
        setCurrentPage((prev) => (prev + 1) % totalPages);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isSectionVisible, totalPages, lastInteractionTime]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(0);
    setActiveIndex(0);
  }, [activeFilter]);

  useEffect(() => {
    setActiveIndex(0);
  }, [currentPage]);

  const handleOpenDetail = (item: GuruItem) => {
    setDetailItem(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <section ref={sectionRef} className="min-h-screen w-full px-4 py-12 sm:px-6 lg:px-24" style={{ backgroundColor: '#eff7ff' }}>
      <div className="mx-auto w-full max-w-[95vw]">
        {/* Header Section */}
        <div className="mb-8 text-center md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-3xl font-bold text-blue-900 sm:text-4xl md:mb-4 md:text-5xl lg:text-6xl"
          >
            Guru & Staff
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base text-gray-600 md:text-xl"
          >
            Tim pengajar dan staf profesional SMKN 1 Cibinong
          </motion.p>

          <div className="mt-6 grid grid-cols-4 gap-1.5 rounded-2xl border border-blue-100 bg-white/75 p-1.5 shadow-sm sm:hidden">
            {guruFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className="relative rounded-xl px-1 py-2.5 text-xs font-semibold"
                aria-pressed={effectiveFilter === filter}
              >
                {effectiveFilter === filter && (
                  <motion.span layoutId="mobile-guru-filter" className="absolute inset-0 rounded-xl bg-blue-600 shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className={`relative z-10 transition-colors duration-200 ${effectiveFilter === filter ? "text-white" : "text-slate-600"}`}>{filter}</span>
              </button>
            ))}
          </div>

          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 hidden flex-wrap justify-center gap-2 sm:flex"
          >
            {guruFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 snap-start rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  effectiveFilter === filter
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </motion.div>
        </div>

        {guruStaffData.length === 0 && (
          <div className="mx-auto mt-4 max-w-xl rounded-3xl border-2 border-dashed border-blue-200 bg-white/70 px-8 py-16 text-center shadow-sm">
            <p className="text-lg font-semibold text-blue-900">Data guru saat ini tidak ada</p>
            <p className="mt-2 text-sm text-slate-500">Data guru dan staff akan muncul di sini setelah ditambahkan melalui CMS.</p>
          </div>
        )}

        {/* Mobile uses one readable card instead of the desktop five-panel accordion. */}
        {guruStaffData.length > 0 && (<>
        <AnimatePresence mode="wait">
          <motion.article
            key={`mobile-${paginatedData[activeIndex]?.id}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-[440px] overflow-hidden rounded-3xl border-2 border-blue-200 shadow-2xl sm:hidden"
          >
            {paginatedData[activeIndex] && (
              <>
                <Image src={paginatedData[activeIndex].image} alt={paginatedData[activeIndex].name} fill quality={55} sizes="100vw" className="object-cover" />
                <div className="relative flex min-h-[440px] flex-col justify-end bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent p-5 text-white">
                  <h3 className="text-2xl font-bold leading-tight drop-shadow-sm">{paginatedData[activeIndex].name}</h3>
                  <p className="mt-2 text-sm font-medium text-white/90">{paginatedData[activeIndex].position}</p>
                </div>
              </>
            )}
          </motion.article>
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between gap-3 sm:hidden">
          <button type="button" aria-label="Guru sebelumnya" onClick={() => setActiveIndex((index) => (index - 1 + paginatedData.length) % paginatedData.length)} className="grid h-10 w-10 place-items-center rounded-full border border-blue-200 bg-white text-blue-800 shadow-sm transition active:scale-95">←</button>
          <div className="flex gap-1.5" aria-label="Pilih guru atau staf">
            {paginatedData.map((item, index) => (
              <button key={item.id} type="button" onClick={() => setActiveIndex(index)} className={`h-2.5 rounded-full transition-all ${activeIndex === index ? "w-7 bg-blue-600" : "w-2.5 bg-blue-200"}`} aria-label={`Tampilkan ${item.name}`} />
            ))}
          </div>
          <button type="button" aria-label="Guru berikutnya" onClick={() => setActiveIndex((index) => (index + 1) % paginatedData.length)} className="grid h-10 w-10 place-items-center rounded-full border border-blue-200 bg-white text-blue-800 shadow-sm transition active:scale-95">→</button>
        </div>

        {/* Horizontal Accordion Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto hidden h-[70vh] min-h-[520px] max-w-7xl overflow-hidden sm:block"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`page-${currentPage}-${activeFilter}`}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full gap-1.5 sm:gap-2 md:gap-4"
            >
              {paginatedData.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  className={`relative min-w-0 cursor-pointer overflow-hidden rounded-2xl border-2 border-blue-200 shadow-2xl transition-all duration-500 ease-in-out sm:rounded-3xl ${
                    activeIndex === index ? 'flex-[4]' : 'flex-[0.5]'
                  }`}
                  onClick={() => {
                    setActiveIndex(index);
                    setLastInteractionTime(Date.now());
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover object-top"
                  quality={55}
                  sizes="(max-width: 640px) 30vw, 40vw"
                />
                {activeIndex === index && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/25 to-transparent" />
                )}
              </div>

              {/* Content Container */}
               <div className="relative flex h-full w-full flex-col p-3 sm:p-6">
                <AnimatePresence mode="wait">
                  {activeIndex === index ? (
                    <motion.div
                      key={`${item.id}-active`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="h-full flex flex-col justify-end"
                    >
                      <h3 className="mb-1 text-lg font-bold text-white drop-shadow-sm sm:mb-2 sm:text-2xl md:text-3xl">
                        {item.name}
                      </h3>

                      <p className="mb-2 text-sm text-white/90 sm:text-base md:text-lg">
                        {item.position}
                      </p>
                    </motion.div>
                  ) : (
                    <div aria-hidden className="h-full" />
                  )}
                </AnimatePresence>
              </div>
              </motion.div>
            ))}
          </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Pagination Dots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 hidden justify-center gap-2 sm:flex"
        >
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentPage(index);
                setLastInteractionTime(Date.now());
              }}
              className={`transition-all duration-300 rounded-full ${
                currentPage === index
                  ? 'w-8 h-3 bg-blue-600'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </motion.div>
        </>)}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/40 backdrop-blur-lg"
            onClick={handleClose}
          >
            <div 
              className="fixed inset-0 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] flex md:flex-row flex-col"
              >
                {/* Image Section */}
                <div className="relative md:w-1/2 h-[300px] md:h-auto">
                  <Image
                    src={detailItem.image}
                    alt={detailItem.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent" />
                  
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                  <h3 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
                    {detailItem.name}
                  </h3>
                  
                  <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-200 bg-blue-50 px-4 py-2 text-blue-900 font-semibold mb-6 w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>{detailItem.position}</span>
                  </div>

                  <p className="text-gray-700 text-lg leading-relaxed">
                    {detailItem.bio}
                  </p>

                  <div className="mt-8 flex gap-4">
                    <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg">
                      Hubungi Sekarang
                    </button>
                    <button className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition">
                      Lihat Profile
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
