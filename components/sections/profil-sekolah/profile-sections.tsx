"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useEffect, useRef, useState } from "react";

const VisiMisiSection = dynamic(
  () => import("./visi-misi-section").then((module) => module.VisiMisiSection),
  { ssr: false },
);
const GuruStaffSection = dynamic(
  () => import("./guru-staff-section").then((module) => module.GuruStaffSection),
  { ssr: false },
);
const SaranaPrasaranaSection = dynamic(
  () => import("./sarana-prasarana-section").then((module) => module.SaranaPrasaranaSection),
  { ssr: false },
);
const AkreditasiSection = dynamic(
  () => import("./akreditasi-section").then((module) => module.AkreditasiSection),
  { ssr: false },
);
const KerjaSamaIndustriSection = dynamic(
  () => import("./kerja-sama-industri-section").then((module) => module.KerjaSamaIndustriSection),
  { ssr: false },
);

function DeferredSection({ children, rootMargin = "320px 0px" }: { children: ReactNode; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className="profile-deferred-section">{isVisible && children}</div>;
}

type Facility = { id: number; title: string; description: string | null; imageUrl: string | null; presentationSlot: string };
type GuruItem = { id: number; name: string; position: string; bio: string; image: string; category: string };
type GuruCategory = { id: number; name: string; slug: string };
type Partner = { id: number; name: string; logoUrl: string | null; description: string | null; websiteUrl: string | null };

export function ProfileSections({ facilities, guru, guruCategories, partners }: { facilities: Facility[]; guru: GuruItem[]; guruCategories: GuruCategory[]; partners: Partner[] }) {
  return (
    <>
      <DeferredSection rootMargin="700px 0px"><VisiMisiSection /></DeferredSection>
      <DeferredSection><GuruStaffSection items={guru} categories={guruCategories} /></DeferredSection>
      <DeferredSection><SaranaPrasaranaSection facilities={facilities} /></DeferredSection>
      <DeferredSection><AkreditasiSection /></DeferredSection>
      <DeferredSection><KerjaSamaIndustriSection partners={partners} /></DeferredSection>
    </>
  );
}
