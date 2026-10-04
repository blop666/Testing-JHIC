"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const visiMisiData = [
  {
    id: 'visi',
    label: 'VISI',
    title: 'Visi SMKN 1 Cibinong',
    subtitle: 'Menjadi SMK Unggul dan Berkarakter',
    description: 'Mewujudkan SMK Negeri 1 Cibinong sebagai lembaga pendidikan kejuruan yang unggul dalam prestasi, berkarakter kuat, dan berwawasan lingkungan untuk menghasilkan lulusan yang kompeten dan siap kerja di era global.',
    points: [
      {
        title: 'Unggul dalam Prestasi',
        desc: 'Menghasilkan lulusan yang berprestasi di tingkat nasional dan internasional.',
      },
      {
        title: 'Berkarakter Kuat',
        desc: 'Membentuk siswa yang berakhlak mulia, disiplin, dan bertanggung jawab.',
      },
      {
        title: 'Berwawasan Lingkungan',
        desc: 'Menanamkan kepedulian terhadap kelestarian lingkungan hidup.',
      },
      {
        title: 'Siap Kerja Global',
        desc: 'Membekali kompetensi yang dibutuhkan industri 4.0 dan era digital.',
      }
    ]
  },
  {
    id: 'misi',
    label: 'MISI',
    title: 'Misi SMKN 1 Cibinong',
    subtitle: 'Langkah Strategis Menuju Keunggulan',
    description: 'Melaksanakan program-program strategis untuk mewujudkan visi sekolah melalui pembelajaran berkualitas, kerjasama industri, dan pembinaan karakter yang berkelanjutan.',
    points: [
      {
        title: 'Pembelajaran Berkualitas',
        desc: 'Menyelenggarakan pembelajaran berbasis kompetensi dengan standar industri.',
      },
      {
        title: 'Kerjasama Industri',
        desc: 'Membangun kemitraan strategis dengan dunia usaha dan dunia industri.',
      },
      {
        title: 'Pembinaan Karakter',
        desc: 'Mengintegrasikan nilai-nilai karakter dalam setiap kegiatan pembelajaran.',
      },
      {
        title: 'Fasilitas Modern',
        desc: 'Menyediakan sarana prasarana pembelajaran yang modern dan relevan.',
      }
    ]
  }
];

export function VisiMisiSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = visiMisiData[activeIndex];

  return (
    <section className="mt-0 flex min-h-screen w-full flex-col items-center bg-gray-50 px-4 py-12 sm:px-6 md:mt-12 md:px-8 md:py-8 lg:px-12">
        {/* Header Section */}
        <div className="mb-8 text-center md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-3xl font-bold text-blue-900 sm:text-4xl md:mb-4 md:text-5xl lg:text-6xl"
          >
            Visi & Misi
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base text-gray-600 md:text-xl"
          >
            Visi & Misi dari sekolah SMKN 1 Cibinong
          </motion.p>
        </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[1440px]"
      >
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-blue-100 p-1.5 sm:hidden">
          {visiMisiData.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-xl px-4 py-3 text-sm font-bold transition-colors ${activeIndex === index ? "bg-[#123e91] text-white shadow-sm" : "text-[#123e91]"}`}
              aria-pressed={activeIndex === index}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-3xl border-2 border-blue-200 bg-[#123e91] shadow-[0_24px_60px_rgba(15,50,120,0.22)] sm:hidden">
          <div className="absolute inset-0">
            <Image src="/banner.jpeg" alt="Gedung SMKN 1 Cibinong" fill sizes="100vw" quality={75} className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(13,47,121,0.96),rgba(31,100,226,0.9))]" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="relative p-5"
            >
              <p className="mb-2 text-xs font-bold tracking-[0.18em] text-blue-100">{activeItem.label}</p>
              <h3 className="text-2xl font-bold leading-tight text-white">{activeItem.title}</h3>
              <p className="mt-2 text-base font-medium text-blue-50">{activeItem.subtitle}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/85">{activeItem.description}</p>
              <div className="mt-5 grid gap-2.5">
                {activeItem.points.map((point, index) => (
                  <div key={point.title} className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-3.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-500 text-sm font-bold text-white">{index + 1}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{point.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-white/80">{point.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden min-h-[560px] items-stretch gap-5 sm:flex lg:gap-7">
          {visiMisiData.map((item, index) => (
            <motion.div
              key={item.id}
                className={`relative min-w-0 overflow-hidden rounded-3xl border-2 border-blue-200 shadow-2xl transition-[flex] duration-500 ease-in-out ${
                   activeIndex === index ? 'flex-[5] cursor-pointer' : 'flex-[0.55] cursor-pointer'
              }`}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <Image
                  src="/banner.jpeg"
                  alt={item.label}
                  fill
                  className="object-cover"
                  quality={55}
                  sizes="(max-width: 1024px) 80vw, 70vw"
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: activeIndex === index 
                      ? "linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(37, 99, 235, 0.90) 100%)"
                      : "linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(37, 99, 235, 0.75) 100%)"
                  }}
                />
              </div>

              {/* {activeIndex === index && (
                <div className="absolute top-4 left-4 z-20">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-4 py-2 text-sm text-white font-semibold shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M2 12h20"/>
                    </svg>
                    <span>{item.label}</span>
                  </div>
                </div>
              )} */}

              {/* Content Container */}
              <div className="relative flex h-full w-full flex-col p-7 lg:p-12">
                <AnimatePresence mode="wait">
                  {activeIndex === index ? (
                    <motion.div
                      key={`${item.id}-active`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="h-full flex flex-col"
                    >
                      <h2 className="mb-2 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                        {item.title}
                      </h2>

                      <p className="mb-5 text-lg text-white/90 md:text-xl lg:text-2xl">
                        {item.subtitle}
                      </p>

                      <p className="mb-7 text-base leading-relaxed text-white/80">
                        {item.description}
                      </p>

                      {/* Points List dengan Glassmorphism - kecil dan bagus */}
                      <div className="grid flex-1 grid-cols-2 gap-4 lg:gap-6">
                        {item.points.map((point, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (idx * 0.05) }}
                            className="flex min-h-[150px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-4 text-center shadow-lg"
                          >
                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg lg:h-16 lg:w-16">
                              <span className="text-white font-bold text-xl md:text-2xl">{idx + 1}</span>
                            </div>
                            <h4 className="mb-2 text-base font-semibold text-white lg:text-lg">
                              {point.title}
                            </h4>
                            <p className="text-sm leading-snug text-white/80">
                              {point.desc}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`${item.id}-inactive`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                        className="flex h-full items-center justify-center"
                    >
                      <h3 
                          className="text-3xl font-bold text-white [writing-mode:vertical-rl] lg:text-5xl"
                        style={{ textOrientation: 'mixed' }}
                      >
                        {item.label}
                      </h3>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
