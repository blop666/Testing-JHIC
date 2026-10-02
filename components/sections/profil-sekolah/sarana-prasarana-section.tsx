"use client"

import InteractiveImageBentoGallery from "@/components/ui/bento-gallery"

const saranaPrasaranaItems = [
  {
    id: 1,
    title: "Ruang Kelas Utama",
    desc: "Ruang belajar nyaman dengan fasilitas modern",
    url: "/fan.jpeg",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    id: 2,
    title: "Laboratorium Komputer",
    desc: "Lab komputer dengan perangkat terkini",
    url: "/banner.jpeg",
    span: "md:row-span-1",
  },
  {
    id: 3,
    title: "Perpustakaan",
    desc: "Koleksi buku lengkap dan ruang baca yang nyaman",
    url: "/banner.jpeg",
    span: "md:row-span-1",
  },
  {
    id: 4,
    title: "Laboratorium Jaringan",
    desc: "Praktikum jaringan komputer dan server",
    url: "/banner.jpeg",
    span: "md:row-span-2",
  },
  {
    id: 5,
    title: "Lapangan Olahraga",
    desc: "Area olahraga dan upacara",
    url: "/banner.jpeg",
    span: "md:row-span-1",
  },
  {
    id: 6,
    title: "Aula Serbaguna",
    desc: "Ruang kegiatan dan acara sekolah",
    url: "/banner.jpeg",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    id: 7,
    title: "Ruang Multimedia",
    desc: "Studio produksi konten digital",
    url: "/banner.jpeg",
    span: "md:row-span-1",
  },
  {
    id: 8,
    title: "Bengkel Praktik",
    desc: "Area praktikum teknik dan workshop",
    url: "/banner.jpeg",
    span: "md:row-span-2",
  },
  {
    id: 9,
    title: "Kantin Sekolah",
    desc: "Area makan dengan menu sehat dan higienis",
    url: "/banner.jpeg",
    span: "md:row-span-1",
  },
  {
    id: 10,
    title: "Masjid",
    desc: "Tempat ibadah yang bersih dan nyaman",
    url: "/banner.jpeg",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    id: 11,
    title: "Ruang Guru",
    desc: "Ruang kerja tenaga pengajar",
    url: "/banner.jpeg",
    span: "md:row-span-1",
  },
  {
    id: 12,
    title: "Laboratorium Bahasa",
    desc: "Fasilitas pembelajaran bahasa interaktif",
    url: "/banner.jpeg",
    span: "md:row-span-1",
  },
]

type Facility = { id: number; title: string; description: string | null; imageUrl: string | null; presentationSlot: string };

const slotSpan: Record<string, string> = {
  featured_large: "md:col-span-2 md:row-span-2",
  standard: "md:row-span-1",
  tall: "md:row-span-2",
  wide: "md:col-span-2 md:row-span-1",
};

export function SaranaPrasaranaSection({ facilities }: { facilities: Facility[] }) {
  const imageItems = facilities.length ? facilities.map((facility) => ({
    id: facility.id,
    title: facility.title,
    desc: facility.description ?? "",
    url: facility.imageUrl ?? "/banner.jpeg",
    span: slotSpan[facility.presentationSlot] ?? slotSpan.standard,
  })) : saranaPrasaranaItems;
  return (
    <div className="w-full bg-gray-50">
      <InteractiveImageBentoGallery
        imageItems={imageItems}
        title="Sarana & Prasarana"
        description="Fasilitas lengkap untuk mendukung pembelajaran berkualitas."
        autoPlay={true}
        autoPlaySpeed={1.2}
        pauseOnHover={true}
      />
    </div>
  )
}
