"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const galleryItems = [
  {
    id: 1,
    title: "Akreditasi A",
    description: "Terakreditasi A oleh BAN-S/M dengan standar pendidikan nasional yang terpercaya dan berkualitas.",
    tag: "Akreditasi",
    image: "/banner.jpeg",
    type: "image",
    className: "md:col-span-3 lg:col-span-5 md:row-span-2"
  },
  {
    id: 2,
    title: "Fasilitas Standar Industri",
    description: "Laboratorium dan workshop dengan peralatan modern sesuai standar industri 4.0.",
    tag: "Fasilitas",
    image: "/banner.jpeg",
    type: "image",
    className: "md:col-span-3 lg:col-span-4 md:row-span-1"
  },
  {
    id: 3,
    title: "92% Lulusan Terserap",
    description: "Lulusan terserap di industri dalam 6 bulan pertama setelah kelulusan dengan kompetensi yang kompetitif.",
    tag: "Pencapaian",
    type: "text",
    className: "md:col-span-3 lg:col-span-3 md:row-span-1"
  },
  {
    id: 4,
    title: "Sertifikasi ISO",
    description: "ISO 9001:2015 untuk Sistem Manajemen Mutu dan ISO 21001:2018 untuk Organisasi Pendidikan.",
    tag: "Sertifikasi",
    image: "/banner.jpeg",
    type: "image",
    className: "md:col-span-3 lg:col-span-4 md:row-span-1"
  },
  {
    id: 5,
    title: "Kurikulum Adaptif",
    description: "Kurikulum yang terus berkembang mengikuti kebutuhan industri 4.0 dan society 5.0.",
    tag: "Kurikulum",
    type: "text",
    className: "md:col-span-3 lg:col-span-3 md:row-span-1"
  },
  {
    id: 6,
    title: "100% Guru Bersertifikat",
    description: "Seluruh tenaga pendidik bersertifikat pendidik profesional dengan pengalaman industri yang mumpuni.",
    tag: "Tenaga Pendidik",
    type: "text",
    className: "md:col-span-3 lg:col-span-3 md:row-span-1"
  },
  {
    id: 7,
    title: "Pembelajaran Inovatif",
    description: "Metode pembelajaran berbasis proyek dengan kolaborasi industri dan teknologi terkini.",
    tag: "Pembelajaran",
    image: "/banner.jpeg",
    type: "image",
    className: "md:col-span-3 lg:col-span-6 md:row-span-1"
  },
  {
    id: 8,
    title: "Program Keahlian Terakreditasi",
    description: "Rekayasa Perangkat Lunak, Teknik Jaringan, Multimedia, dan Teknik Komputer dengan akreditasi A.",
    tag: "Program Studi",
    type: "text",
    className: "md:col-span-3 lg:col-span-3 md:row-span-1"
  },
];

export function AkreditasiSection() {
  return (
    <section className="relative flex min-h-screen items-center bg-gradient-to-b from-blue-50 to-cyan-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="mb-10 text-center sm:mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-4 text-3xl font-bold tracking-tight text-blue-900 sm:mb-6 sm:text-5xl lg:text-6xl"
          >
            Membangun Standar Pendidikan <br className="hidden sm:block" />
            yang Terpercaya
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-4 max-w-2xl text-sm text-gray-600 sm:text-lg"
          >
            Berkomitmen mewujudkan pendidikan berkualitas dengan standar akreditasi terpercaya dan lulusan siap industri.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid auto-rows-[220px] grid-cols-1 gap-3 sm:auto-rows-[250px] sm:gap-4 md:grid-cols-6 md:auto-rows-[280px] lg:grid-cols-12"
        >
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
               className={`group relative overflow-hidden rounded-2xl ${item.className}`}
            >
              {item.type === "image" ? (
                <>
                  <div className="absolute inset-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-gray-900/20"></div>
                  </div>

                   <div className="relative flex h-full flex-col justify-end p-4 text-white sm:p-6">
                    <span className="inline-block w-fit px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-xs font-medium mb-3 shadow-sm">
                      {item.tag}
                    </span>
                     <h3 className="mb-2 text-lg font-semibold transition-transform duration-300 group-hover:translate-y-[-4px] sm:text-2xl">
                      {item.title}
                    </h3>
                     <p className="text-xs leading-relaxed text-white/95 sm:text-sm">
                      {item.description}
                    </p>
                  </div>
                </>
              ) : (
                 <div className="relative flex h-full flex-col justify-between border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-xl sm:p-6">
                  <span className="inline-block w-fit px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 text-xs font-medium backdrop-blur-sm">
                    {item.tag}
                  </span>
                  <div>
                     <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-transform duration-300 group-hover:translate-y-[-4px] sm:mb-3 sm:text-2xl">
                      {item.title}
                    </h3>
                     <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
