"use client";

import { AnimatePresence, motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Profil", href: "/profil-sekolah" },
  { label: "Jurusan", href: "/kompetensi-keahlian" },
  { label: "Berita", href: "/berita" },
  { label: "Prestasi", href: "/berita/prestasi" },
  { label: "Kontak", href: "/kontak" },
];

export function SiteNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(720);
  const { scrollY } = useScroll();
  const isHome = pathname === "/";
  const isProfile = pathname === "/profil-sekolah";

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const updateHeight = () => setViewportHeight(window.innerHeight);
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [mobileOpen]);

  const homeBlue = useTransform(scrollY, [viewportHeight * 0.7, viewportHeight * 1.05], [0, 0.82]);
  const homeBlur = useTransform(scrollY, [viewportHeight * 0.92, viewportHeight * 1.05], [0, 16]);
  const homePadding = useTransform(scrollY, [0, viewportHeight * 1.18], [28, 12]);
  const profileBlue = useTransform(scrollY, [viewportHeight * 0.96, viewportHeight * 1.08], [0, 0.82]);
  const profileText = useTransform(scrollY, () => "#ffffff");
  const profileBlur = useTransform(scrollY, [viewportHeight * 0.96, viewportHeight * 1.08], [0, 16]);
  const staticBlue = useTransform(scrollY, () => 0.82);
  const staticBlur = useTransform(scrollY, () => 16);
  const transparent = useTransform(scrollY, () => 0);
  const white = useTransform(scrollY, () => "#ffffff");
  const compactPadding = useTransform(scrollY, () => 12);

  const blueOpacity = isHome ? homeBlue : isProfile ? profileBlue : staticBlue;
  const whiteOpacity = transparent;
  const blur = isHome ? homeBlur : isProfile ? profileBlur : staticBlur;
  const color = isProfile ? profileText : white;
  const paddingY = isHome || isProfile ? homePadding : compactPadding;
  const background = useMotionTemplate`linear-gradient(rgba(255, 255, 255, ${whiteOpacity}), rgba(255, 255, 255, ${whiteOpacity})), linear-gradient(rgba(0, 54, 171, ${blueOpacity}), rgba(0, 54, 171, ${blueOpacity}))`;
  const backdropFilter = useMotionTemplate`blur(${blur}px) saturate(150%)`;

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[60]"
        style={{
          paddingTop: paddingY,
          paddingBottom: paddingY,
          background,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          color,
        }}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-5 md:px-10 lg:px-14">
          <Link href="/" className="flex items-center gap-3" aria-label="SMKN 1 Cibinong - Beranda">
            <Image src="/cropped-logo-SMKN-1-Cbn.png" alt="Logo SMKN 1 Cibinong" width={48} height={48} priority className="h-10 w-10 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)] md:h-12 md:w-12" />
            <span className="hidden text-sm font-medium tracking-[-0.02em] md:block">SMKN 1 CIBINONG</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Navigasi utama">
            {navItems.slice(1).map((item) => {
              const active = item.href === "/berita" ? pathname === "/berita" : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className="relative py-2 opacity-80 transition-opacity hover:opacity-100">
                  {item.label}
                  {active && <motion.span layoutId="active-nav" className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-current" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/kontak" className="hidden rounded-full bg-white px-5 py-2 text-sm font-medium text-black shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition hover:scale-[1.02] hover:bg-white/90 sm:block">Hubungi</Link>
            <button type="button" aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? "Tutup menu" : "Buka menu"} onClick={() => setMobileOpen((open) => !open)} className="relative grid h-11 w-11 place-items-center rounded-full border border-current/20 bg-white/10 backdrop-blur-md transition hover:bg-white/20 md:hidden">
              <span className="sr-only">Menu</span>
              <motion.span animate={mobileOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }} className="absolute h-0.5 w-5 rounded-full bg-current" />
              <motion.span animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} className="absolute h-0.5 w-5 rounded-full bg-current" />
              <motion.span animate={mobileOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }} className="absolute h-0.5 w-5 rounded-full bg-current" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div key="mobile-menu" className="fixed inset-0 z-[55] md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" aria-label="Tutup menu" onClick={() => setMobileOpen(false)} />
            <motion.nav id="mobile-navigation" aria-label="Navigasi mobile" initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.98 }} transition={{ type: "spring", stiffness: 320, damping: 28 }} className="absolute inset-x-4 top-24 overflow-hidden rounded-[2rem] border border-white/40 bg-white/88 p-3 text-[#0b3477] shadow-[0_30px_80px_rgba(2,20,60,0.3)] backdrop-blur-2xl">
              <div className="px-4 pb-3 pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0b3477]/50">Navigasi</div>
              {navItems.map((item, index) => {
                const active = item.href === "/" ? pathname === "/" : item.href === "/berita" ? pathname === "/berita" : pathname.startsWith(item.href);
                return (
                  <motion.div key={item.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * index }}>
                    <Link href={item.href} aria-current={active ? "page" : undefined} className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium transition ${active ? "bg-[#0036ab] text-white shadow-lg shadow-blue-900/15" : "hover:bg-blue-50"}`}>
                      {item.label}<span aria-hidden="true" className="text-lg opacity-55">↗</span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
      {!isHome && !isProfile && <div className="h-[72px] md:h-[80px]" aria-hidden="true" />}
    </>
  );
}
