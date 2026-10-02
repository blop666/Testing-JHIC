import Link from "next/link";
import { KompetensiSection } from "@/components/sections/kompetensi-section";
import { FasilitasVokasi } from "@/components/sections/fasilitas-vokasi";
import { getPublicFasilitasVokasi } from "@/server/queries/public-content";

const keunggulan = [
  {
    title: "Akreditasi A Unggul",
    description: "Penilaian BAN-SM dengan predikat Sangat Baik, standar nasional pendidikan terpenuhi.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "SMK Pusat Keunggulan",
    description: "Ditetapkan Kemendikbudristek sebagai institusi penggerak link and match industri.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
      </svg>
    ),
  },
  {
    title: "Teaching Factory (TeFa)",
    description: "Sistem bengkel dan lab produksi riil, berlisensi sertifikasi BNSP & asosiasi profesi.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      </svg>
    ),
  },
];

export default async function KompetensiKeahlianPage() {
  const fasilitas = await getPublicFasilitasVokasi();
  const fasilitasItems = fasilitas.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    image: item.imageUrl ?? "/hero-banner.webp",
    tefaName: item.tefaName,
    jurusan: item.jurusan ? `${item.jurusan.code} · ${item.jurusan.name}` : null,
  }));

  return (
    <main className="min-h-screen">
      <div className="bg-white pb-16">
        <div className="mx-auto max-w-[1600px] px-5 pt-10 md:px-10 lg:px-14">
          {/* Header */}
          <div data-aos="fade-up" className="max-w-3xl">
            <h1 className="text-3xl font-bold text-[#1C398E] md:text-4xl lg:text-5xl">Program Keahlian</h1>
            <p className="mt-4 text-base leading-relaxed text-[#364153] md:text-lg">
              SMKN 1 Cibinong menawarkan 10 program keahlian unggulan yang dirancang untuk mempersiapkan siswa menghadapi tantangan industri modern dengan kompetensi yang relevan dan berbasis teknologi terkini.
            </p>
          </div>

          {/* Keunggulan */}
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {keunggulan.map((item, index) => (
              <div
                key={item.title}
                data-aos="fade-up"
                data-aos-delay={String(index * 100)}
                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-6"
              >
                <span className="text-[#1C4E97]">{item.icon}</span>
                <h2 className="mt-4 text-lg font-bold text-[#101828]">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#364153]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar Jurusan */}
      <KompetensiSection />

      {/* Fasilitas Praktik Vokasi */}
      <FasilitasVokasi fasilitas={fasilitasItems} />

      {/* CTA Banner */}
      <section className="bg-[#0036ab] py-16 md:py-20">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 lg:px-14">
          <div data-aos="fade-up" className="text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">Butuh arahan memilih jurusan?</h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/80">
              Konsultasikan minat dan bakat Anda dengan tim kami melalui WhatsApp atau kirim pesan pertanyaan.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="https://wa.me/622518663846"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Chat WhatsApp
              </a>
              <Link
                href="/kontak"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0036ab] transition hover:bg-blue-50 sm:w-auto"
              >
                Kirim Pesan Pertanyaan
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
