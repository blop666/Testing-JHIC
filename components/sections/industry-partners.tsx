"use client";

import LogoLoop, { type LogoItem } from "@/components/ui/logo-loop";
import { Building2 } from "lucide-react";

export interface PartnerItem {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl: string;
}

const fallbackPartners: PartnerItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: `Mitra ${String(index + 1).padStart(2, "0")}`,
  logoUrl: "",
  websiteUrl: "",
}));

export function IndustryPartners({ partners }: { partners?: PartnerItem[] }) {
  const list = partners && partners.length ? partners : fallbackPartners;
  const logos: LogoItem[] = list.map((partner) => ({
    node: (
      <span className="flex h-24 w-64 shrink-0 items-center gap-4 rounded-2xl border border-white/15 bg-[#1b4d96] px-5 text-white shadow-lg">
        {partner.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <span className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-white/30">
            <img src={partner.logoUrl} alt={partner.name} className="max-h-full max-w-full object-contain" />
          </span>
        ) : (
          <span className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl bg-white text-[#1b4d96] ring-1 ring-white/30"><Building2 className="size-8" /></span>
        )}
        <span className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight">{partner.name}</span>
      </span>
    ),
    title: partner.name,
    href: partner.websiteUrl || undefined,
  }));

  return (
    <section className="relative z-10 overflow-hidden bg-[#f5f8ff] py-16 text-slate-950 md:py-20">
      <div className="mx-auto mb-9 max-w-7xl px-4 text-center md:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-700">Kolaborasi dunia kerja</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Mitra Industri Kami</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">Bersama mitra industri, kami menghadirkan pembelajaran yang relevan dengan kebutuhan dunia kerja.</p>
      </div>
      <LogoLoop logos={logos} speed={40} direction="left" logoHeight={96} gap={24} hoverSpeed={10} scaleOnHover fadeOut fadeOutColor="#f5f8ff" ariaLabel="Daftar mitra industri SMKN 1 Cibinong" />
    </section>
  );
}
