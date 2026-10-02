"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import LogoLoop, { type LogoItem } from "@/components/ui/logo-loop";
import { Building2, ChevronRight, X } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const fallbackPartnerLogos = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    alt: "Google",
    width: 120,
    name: "Google LLC",
    description: "Partnership dalam program Google Developer Student Clubs dan sertifikasi Google IT Support Professional untuk meningkatkan kompetensi siswa di bidang teknologi cloud dan digital."
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    alt: "Microsoft",
    width: 140,
    name: "Microsoft Corporation",
    description: "Kerja sama dalam program Microsoft Learn Student Ambassador dan akses ke Azure for Education untuk pembelajaran cloud computing dan pengembangan software modern."
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
    alt: "IBM",
    width: 100,
    name: "IBM Indonesia",
    description: "Partnership dalam IBM SkillsBuild program untuk pelatihan AI, data science, dan cybersecurity dengan sertifikasi internasional yang diakui industri."
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/250px-Amazon_Web_Services_Logo.svg.png",
    alt: "AWS",
    width: 80,
    name: "Amazon Web Services",
    description: "Kolaborasi dalam AWS Educate program memberikan akses ke cloud computing resources dan training untuk mempersiapkan siswa menjadi cloud practitioner."
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Cisco_logo_blue_2016.svg/250px-Cisco_logo_blue_2016.svg.png",
    alt: "Cisco",
    width: 100,
    name: "Cisco Systems Indonesia",
    description: "Partnership dalam Cisco Networking Academy untuk sertifikasi CCNA dan pelatihan jaringan komputer yang memenuhi standar industri global."
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Oracle_red_logo.svg/250px-Oracle_red_logo.svg.png",
    alt: "Oracle",
    width: 120,
    name: "Oracle Indonesia",
    description: "Kerja sama dalam Oracle Academy program untuk pembelajaran database management, Java programming, dan enterprise software development."
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Intel-logo.svg/250px-Intel-logo.svg.png",
    alt: "Intel",
    width: 80,
    name: "Intel Indonesia",
    description: "Partnership dalam Intel AI for Youth program dan pelatihan Internet of Things (IoT) untuk membekali siswa dengan keterampilan teknologi masa depan."
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dell_logo_2016.svg/250px-Dell_logo_2016.svg.png",
    alt: "Dell",
    width: 80,
    name: "Dell Technologies Indonesia",
    description: "Kolaborasi dalam program magang dan workshop hardware assembly, troubleshooting, dan IT infrastructure management untuk pengalaman praktis siswa."
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/250px-HP_logo_2012.svg.png",
    alt: "HP",
    width: 60,
    name: "HP Indonesia",
    description: "Partnership dalam program HP LIFE (Learning Initiative for Entrepreneurs) untuk pengembangan keterampilan digital dan entrepreneurship bagi siswa."
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/250px-Samsung_Logo.svg.png",
    alt: "Samsung",
    width: 120,
    name: "Samsung Electronics Indonesia",
    description: "Kerja sama dalam Samsung Innovation Campus untuk pelatihan mobile development, AI, dan IoT dengan peralatan dan mentor dari Samsung."
  },
];

type Partner = { id: number; name: string; logoUrl: string | null; description: string | null; websiteUrl: string | null };

type PartnerLogo = {
  src: string;
  alt: string;
  width: number;
  name: string;
  description: string;
};

export function KerjaSamaIndustriSection({ partners }: { partners: Partner[] }) {
  const partnerLogos: PartnerLogo[] = partners.length ? partners.map((partner) => ({
    src: partner.logoUrl ?? "/banner.jpeg",
    alt: partner.name,
    width: 120,
    name: partner.name,
    description: partner.description ?? "",
  })) : fallbackPartnerLogos;
  const [selectedCompany, setSelectedCompany] = useState<PartnerLogo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogoClick = (logo: PartnerLogo) => {
    setSelectedCompany(logo);
    setIsModalOpen(true);
  };

  const logos: LogoItem[] = partnerLogos.map((logo) => ({
    node: (
      <button
        type="button"
        onClick={() => handleLogoClick(logo)}
        className="flex h-24 w-64 shrink-0 items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 text-left shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
      >
        <span className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-white/30">
          {logo.src && logo.src !== "/banner.jpeg" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" loading="lazy" />
          ) : (
            <Building2 className="h-8 w-8 text-[#1b4d96]" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-semibold text-white">{logo.name}</span>
          <span className="block text-xs font-medium text-white/70">Mitra Industri</span>
        </span>
      </button>
    ),
    title: logo.name,
  }));

  const renderPartnerCard = (logo: PartnerLogo) => (
    <button
      type="button"
      onClick={() => handleLogoClick(logo)}
      className="flex h-24 w-64 shrink-0 items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 text-left shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
    >
      <span className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-white/30">
        {logo.src && logo.src !== "/banner.jpeg" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" loading="lazy" />
        ) : (
          <Building2 className="h-8 w-8 text-[#1b4d96]" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold text-white">{logo.name}</span>
        <span className="block text-xs font-medium text-white/70">Mitra Industri</span>
      </span>
    </button>
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCompany(null), 300);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#1b4d96" }}>
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6"
          >
            Kerja Sama Industri
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto"
          >
            Membangun partnership strategis dengan industri terkemuka untuk memastikan lulusan siap kerja dan berdaya saing tinggi.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden md:block"
        >
          <LogoLoop logos={logos} speed={40} direction="left" logoHeight={96} gap={24} fadeOut fadeOutColor="#1b4d96" ariaLabel="Daftar mitra kerja sama industri" />
        </motion.div>

        {/* Mobile: manual scroll carousel with a small "tap for detail" hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="md:hidden"
        >
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Daftar mitra kerja sama industri">
            {partnerLogos.map((logo) => (
              <div key={logo.name} className="snap-start">
                {renderPartnerCard(logo)}
                <span className="mt-2 flex items-center justify-center gap-1 text-[11px] font-medium text-white/60">
                  <ChevronRight className="h-3 w-3" /> Ketuk untuk detail
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isModalOpen && selectedCompany && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md sm:p-8"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ duration: 0.3 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 border-b border-gray-200 pb-6 pr-10">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gray-50 p-4">
                    <img
                      src={selectedCompany.src}
                      alt={selectedCompany.alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {selectedCompany.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Mitra Industri
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
                    Program Kerja Sama
                  </h4>
                  <p className="leading-relaxed text-gray-600">
                    {selectedCompany.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}
